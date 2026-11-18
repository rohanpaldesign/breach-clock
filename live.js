// Attacks in flight: DDoS attacks drawn between countries at the real average pace.
// Rate per route = attacks a minute × source share × target share (see the method card).
import { LIVE } from './data.js';
import { createGlobe, loadAtlas, geoInterpolate, geoDistance, hexA } from './globe-core.js';
import { esc, openSource } from './util.js';

const perMin = LIVE.perHour / 60;
const PL = LIVE.places;
const nameOf = (c) => PL[c][0];
const ll = (c) => [PL[c][3], PL[c][2]];
export const routes = [];
for (const [s, sp] of LIVE.sources) {
  for (const [t, tp] of LIVE.targets) {
    routes.push({ from: s, to: t, perMin: perMin * (sp / 100) * (tp / 100) });
  }
}
routes.sort((a, b) => b.perMin - a.perMin);
const fmtRate = (m) => (m >= 10 ? Math.round(m) : m >= 1 ? m.toFixed(1) : m.toFixed(2));

export async function initLive() {
  const wrap = document.getElementById('liveWrap');
  const canvas = document.getElementById('liveGlobe');
  const panel = document.getElementById('livePanel');
  const tip = document.getElementById('liveTip');
  const countEl = document.getElementById('liveCount');
  document.getElementById('liveRate').textContent = Math.round(perMin);

  const top = (arr) => [...arr].sort((a, b) => b[1] - a[1])[0];
  const stats = [
    { v: Math.round(perMin).toLocaleString('en-US'), l: 'DDoS attacks a minute, on average', src: 'cfReport', title: 'Attacks a minute', math: `5,343 attacks an hour ÷ 60 = ${perMin.toFixed(1)} a minute`, note: 'Cloudflare mitigated 23.2 million network-layer DDoS attacks in the first half of 2026, about 5,343 an hour.' },
    { v: `${top(LIVE.sources)[1]}%`, l: `of attack traffic came from ${nameOf(top(LIVE.sources)[0])}`, src: 'cfRadar', title: 'Biggest source', note: 'Share of application-layer DDoS attacks by source location, 7 days to 16 November 2026. Source means where the traffic came from, often hijacked devices.' },
    { v: `${top(LIVE.targets)[1]}%`, l: `of attacks hit ${nameOf(top(LIVE.targets)[0])}`, src: 'cfRadar', title: 'Most attacked', note: 'Share of application-layer DDoS attacks by target location, 7 days to 16 November 2026.' },
    { v: `${fmtRate(routes[0].perMin)}`, l: `a minute on the busiest route, ${nameOf(routes[0].from)} to ${nameOf(routes[0].to)}`, src: 'cfRadar', title: 'Busiest route', math: `${perMin.toFixed(1)} a minute × ${LIVE.sources.find((x) => x[0] === routes[0].from)[1]}% × ${LIVE.targets.find((x) => x[0] === routes[0].to)[1]}% = ${routes[0].perMin.toFixed(2)} a minute`, note: 'An estimate: it assumes a country’s attacks spread across targets in proportion to how often each target is hit.' },
  ];
  const statsEl = document.getElementById('liveStats');
  statsEl.innerHTML = stats.map((s, i) => `<button class="gstat" type="button" data-i="${i}"><span class="v">${esc(s.v)}</span><span class="l">${esc(s.l)}</span></button>`).join('');
  statsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    const s = stats[Number(b.dataset.i)];
    openSource({ title: s.title, value: s.v, sub: s.l, math: s.math, note: s.note, kind: i2kind(s), source: s.src });
  });

  let speed = 1;
  const speedSeg = document.getElementById('liveSpeed');
  speedSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-speed]');
    if (!b) return;
    speedSeg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    speed = Number(b.dataset.speed);
  });

  try {
    await loadAtlas();
  } catch {
    panel.innerHTML = '<p class="fine">The map couldn’t load. Check your connection and refresh.</p>';
    return;
  }
  const codeByNum = Object.fromEntries(Object.entries(PL).map(([c, p]) => [p[1], c]));
  for (const r of routes) {
    if (r.from === r.to) continue;
    const a = ll(r.from);
    const b = ll(r.to);
    r.f = geoInterpolate(a, b);
    r.d = geoDistance(a, b);
  }

  // Simulation
  const flights = [];
  const hits = [];
  const feed = [];
  let drawn = 0;
  window.addEventListener('breachclock:restart', () => { drawn = 0; feed.length = 0; lastFeedLen = -1; renderFeed(); });
  let selected = null;
  function spawn(dt) {
    for (const r of routes) {
      // Poisson arrivals: chance of one in this frame (rates are far below one a frame).
      if (Math.random() < (r.perMin / 60) * dt * speed) {
        drawn++;
        feed.unshift({ r, at: new Date() });
        if (feed.length > 7) feed.pop();
        if (r.from === r.to) hits.push({ code: r.to, t: 0, home: true });
        else flights.push({ r, t: 0, dur: 1.1 + r.d * 0.9 });
      }
    }
  }

  const G = await createGlobe({
    wrap, canvas, tip, codeByNum, nameOf,
    spin: 4,
    rot: [75, -28],
    onSelect: (code) => { selected = code; if (code) G.focus(ll(code)); renderPanel(); },
    overlay: draw,
  });
  G.numOf = (c) => PL[c][1];

  function draw(g, dt) {
    const { ctx, path, proj, P, reduce } = g;
    spawn(dt);
    // faint routes for structure
    ctx.lineCap = 'round';
    for (const r of routes.slice(0, 40)) {
      if (r.from === r.to) continue;
      const rel = selected && (r.from === selected || r.to === selected);
      if (selected && !rel) continue;
      if (!r.line) r.line = { type: 'LineString', coordinates: Array.from({ length: 33 }, (_, i) => r.f(i / 32)) };
      ctx.beginPath();
      path(r.line);
      ctx.strokeStyle = hexA(P.signal, selected ? 0.35 : 0.1);
      ctx.lineWidth = 0.6 + r.perMin * 0.25;
      ctx.stroke();
    }
    // flights: a bright head with a fading tail along the great circle
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i];
      f.t += (dt * speed ** 0.5) / f.dur;
      if (f.t >= 1) {
        flights.splice(i, 1);
        hits.push({ code: f.r.to, t: 0 });
        continue;
      }
      const dim = selected && f.r.from !== selected && f.r.to !== selected;
      const head = f.t;
      const tail = Math.max(0, head - 0.4);
      const steps = 10;
      for (let k = 0; k < steps; k++) {
        const a = tail + ((head - tail) * k) / steps;
        const b = tail + ((head - tail) * (k + 1)) / steps;
        const pa = f.r.f(a);
        const pb = f.r.f(b);
        if (!g.visible(pa) || !g.visible(pb)) continue;
        const [x1, y1] = proj(pa);
        const [x2, y2] = proj(pb);
        ctx.strokeStyle = hexA(P.signal, ((k + 1) / steps) * (dim ? 0.15 : 0.9));
        ctx.lineWidth = 1.2 + (k / steps) * 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      const ph = f.r.f(head);
      if (g.visible(ph) && !dim) {
        const [x, y] = proj(ph);
        ctx.fillStyle = hexA(P.signal, 0.3);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = P.ink;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // impacts
    for (let i = hits.length - 1; i >= 0; i--) {
      const h = hits[i];
      h.t += dt / (reduce ? 0.6 : 1.1);
      if (h.t >= 1) { hits.splice(i, 1); continue; }
      const pos = ll(h.code);
      if (!g.visible(pos)) continue;
      if (selected && h.code !== selected) continue;
      const [x, y] = proj(pos);
      const col = h.home ? P.ink : P.alert;
      ctx.strokeStyle = hexA(col, 0.9 * (1 - h.t));
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, 3 + h.t * (h.home ? 14 : 18), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = hexA(col, 0.8 * (1 - h.t));
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (selected) g.label(selected, ll(selected));
    if (feedDirty()) renderFeed();
  }

  // Panel: busiest routes + a feed of the latest attacks, or one country's view.
  let lastFeedLen = -1;
  let lastFeedTop = null;
  const feedDirty = () => feed[0] !== lastFeedTop || feed.length !== lastFeedLen;
  const time = (d) => d.toTimeString().slice(0, 8);
  const routeRow = (r) => `<li><button type="button" data-code="${r.from === selected ? r.to : r.from}"><i class="dotc ${r.from === r.to ? 'dom' : 'ns'}"></i><span>${r.from === r.to ? `${esc(nameOf(r.from))}, at home` : `${esc(nameOf(r.from))} <span aria-hidden="true">→</span><span class="sr">to</span> ${esc(nameOf(r.to))}`}</span><b>${fmtRate(r.perMin)}</b></button></li>`;

  function renderFeed() {
    lastFeedLen = feed.length;
    lastFeedTop = feed[0];
    countEl.textContent = drawn.toLocaleString('en-US');
    const el = panel.querySelector('[data-feed]');
    if (!el) return;
    el.innerHTML = feed.length
      ? feed.map((e) => `<li><span class="mono">${time(e.at)}</span><span>${esc(nameOf(e.r.from))} <span aria-hidden="true">→</span><span class="sr">to</span> ${esc(nameOf(e.r.to))}</span></li>`).join('')
      : '<li class="fine">Waiting for the first attack…</li>';
  }

  function renderPanel() {
    if (!selected) {
      panel.innerHTML = `
        <h3 class="h-sm">Busiest routes <span class="unit">a minute</span></h3>
        <ol class="routes">${routes.slice(0, 8).map(routeRow).join('')}</ol>
        <h3 class="h-sm">Just now</h3>
        <ol class="feed" data-feed></ol>
        <p class="fine">Tap a country or a route to see what leaves it and what lands on it.</p>`;
    } else {
      const out = routes.filter((r) => r.from === selected && r.to !== selected);
      const inn = routes.filter((r) => r.to === selected && r.from !== selected);
      const home = routes.find((r) => r.from === selected && r.to === selected);
      const sum = (a) => a.reduce((s, r) => s + r.perMin, 0);
      const bars = (arr, side) => {
        const max = Math.max(1e-9, ...arr.map((r) => r.perMin));
        return arr.slice(0, 5).map((r) => {
          const other = side === 'out' ? r.to : r.from;
          return `<li><button type="button" data-code="${other}"><span>${esc(nameOf(other))}</span><b>${fmtRate(r.perMin)}</b><i style="width:${(r.perMin / max) * 100}%"></i></button></li>`;
        }).join('');
      };
      panel.innerHTML = `
        <div class="gp-head"><h3 class="h-md">${esc(nameOf(selected))}</h3><button class="icon-btn" type="button" data-clear aria-label="Clear selection"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
        <div class="gp-block"><p class="gp-k">Leaving ${esc(nameOf(selected))}</p><p class="gp-v">${out.length ? fmtRate(sum(out)) : 0} <span>attacks a minute</span></p><ol class="bars">${bars(out, 'out') || '<li class="fine">Not among the top 20 sources.</li>'}</ol></div>
        <div class="gp-block"><p class="gp-k">Landing on ${esc(nameOf(selected))}</p><p class="gp-v">${inn.length ? fmtRate(sum(inn)) : 0} <span>attacks a minute</span></p><ol class="bars in">${bars(inn, 'in') || '<li class="fine">Not among the top 20 targets.</li>'}</ol></div>
        <div class="gp-block"><p class="gp-k">At home</p><p class="gp-v">${home ? fmtRate(home.perMin) : 0} <span>a minute where source and target are both here</span></p></div>`;
    }
    lastFeedLen = -1;
    renderFeed();
  }
  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear]')) return G.select(null);
    const b = e.target.closest('[data-code]');
    if (b) G.select(b.dataset.code);
  });
  renderPanel();
}

const i2kind = (s) => (s.title === 'Busiest route' ? 'estimated' : 'measured');
