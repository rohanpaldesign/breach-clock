// Who attacks whom: a spinning globe of publicly reported cyber incidents between countries.
// Data: EuRepoC (see data/flows.json and scripts/build_flows.py). Arcs are named attacker
// country -> target country; rings are attacks inside one country.
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, geoDistance, geoContains } from 'https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm';
import { feature, mesh } from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm';
import { css, esc, openSource, reducedMotion } from './util.js';
import { addFigures } from './sources.js';

const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
export const TYPE_LABELS = { theft: 'Data theft', ransomware: 'Ransomware', ddos: 'DDoS or defacement', leak: 'Hack and leak', wiper: 'Wiper or outage', hijack: 'Hijacking' };
const TOP_N = 150;

export async function initGlobe() {
  const canvas = document.getElementById('globe');
  const wrap = document.getElementById('globeWrap');
  const panel = document.getElementById('globePanel');
  const tip = document.getElementById('globeTip');
  const ctx = canvas.getContext('2d');
  const reduce = reducedMotion();

  let world;
  let flows;
  try {
    [world, flows] = await Promise.all([fetch(ATLAS).then((r) => r.json()), fetch('data/flows.json').then((r) => r.json())]);
  } catch (e) {
    panel.innerHTML = '<p class="muted">The map couldn’t load. Check your connection and refresh.</p>';
    return;
  }
  const lands = feature(world, world.objects.countries).features;
  const borders = mesh(world, world.objects.countries, (a, b) => a !== b);
  const C = flows.countries;
  const byNum = Object.fromEntries(Object.entries(C).map(([code, c]) => [c.num, code]));
  const ll = (code) => [C[code].lon, C[code].lat];

  // Filters
  const state = { year: 'all', types: new Set(Object.keys(TYPE_LABELS).concat('other')), all: false, selected: null, hover: null };
  const keep = (y, t) => (state.year === 'all' || y === state.year) && state.types.has(t);
  let shown = [];
  function refilter() {
    const list = [];
    for (const p of flows.pairs) {
      let n = 0;
      let s = 0;
      for (const [y, t, st] of p.ev) if (keep(y, t)) { n++; s += st; }
      if (n) list.push({ p, n, stateShare: s / n });
    }
    list.sort((a, b) => b.n - a.n);
    shown = list;
    for (const r of shown) {
      if (!r.p._line && r.p.from !== r.p.to) {
        const a = ll(r.p.from);
        const b = ll(r.p.to);
        const f = geoInterpolate(a, b);
        r.p._d = geoDistance(a, b);
        r.p._f = f;
        r.p._line = { type: 'LineString', coordinates: Array.from({ length: 49 }, (_, i) => f(i / 48)) };
      }
    }
    renderPanel();
  }
  const unattrCount = (code) => (flows.unattributed[code] || []).filter(([y, t]) => keep(y, t)).length;

  // Stats row
  const T = flows.totals;
  const share = Math.round((T.unattributedTargets / (T.unattributedTargets + T.namedPairs)) * 100);
  const stats = [
    { f: 'Publicly reported incidents with a target country', v: T.incidents.toLocaleString('en-US'), l: 'publicly reported cyber incidents with a target country, 2000 to early 2025', note: 'Incidents documented from public reporting by EuRepoC researchers. Not every attack: most are never made public.' },
    { f: 'Countries named as an attacker’s home', v: T.attackerCountries, l: 'countries named as the attacker’s home', note: 'Where researchers or governments attributed the attack to people or a state based in that country.' },
    { f: 'Attacks inside a single country', v: T.domestic, l: 'attacks inside a single country', note: 'The attacker and the target are in the same country: hacktivists, criminals or a state targeting its own people.' },
    { f: 'Share of attacks on a country with no attacker named', v: `${share}%`, l: 'of attacks on a country have no attacker named', note: `${T.unattributedTargets.toLocaleString('en-US')} country targets with no attributed attacker, against ${T.namedPairs.toLocaleString('en-US')} with one. These are counted on the target but not drawn as arcs.` },
  ];
  const statsEl = document.getElementById('globeStats');
  statsEl.innerHTML = stats.map((s, i) => `<button class="gstat" type="button" data-i="${i}"><span class="v">${esc(s.v)}</span><span class="l">${esc(s.l)}</span></button>`).join('');
  statsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    const s = stats[Number(b.dataset.i)];
    openSource({ title: 'Who attacks whom', value: String(s.v), sub: s.l, note: s.note, kind: 'measured', source: 'eurepoc' });
  });
  addFigures(stats.map((s) => ({ label: s.f, value: String(s.v), period: '2000 to Feb 2025', source: 'eurepoc', kind: 'measured' })));

  // Controls
  const chipsEl = document.getElementById('globeTypes');
  chipsEl.innerHTML = Object.entries(TYPE_LABELS).map(([k, v]) => `<button type="button" class="chip" data-type="${k}" aria-pressed="true">${v}</button>`).join('');
  chipsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-type]');
    if (!b) return;
    const k = b.dataset.type;
    if (state.types.has(k)) state.types.delete(k); else state.types.add(k);
    if (![...state.types].some((t) => t !== 'other')) Object.keys(TYPE_LABELS).forEach((t) => state.types.add(t));
    chipsEl.querySelectorAll('[data-type]').forEach((x) => x.setAttribute('aria-pressed', String(state.types.has(x.dataset.type))));
    refilter();
  });
  const yearSeg = document.getElementById('globeYears');
  yearSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-year]');
    if (!b) return;
    yearSeg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    state.year = b.dataset.year;
    refilter();
  });
  document.getElementById('globeAll').addEventListener('change', (e) => { state.all = e.target.checked; renderPanel(); });

  // Projection and sizing
  const proj = geoOrthographic().clipAngle(90).precision(0.4);
  const path = geoPath(proj, ctx);
  const grat = geoGraticule10();
  let rot = [-20, -22];
  let size = 0;
  let dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    size = wrap.clientWidth;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    proj.scale(size / 2 - 10).translate([size / 2, size / 2]);
  }
  resize();
  new ResizeObserver(resize).observe(wrap);

  // Rotation: spins slowly; drag to turn; picking a country eases it to the front.
  let dragging = false;
  let moved = false;
  let lastInteract = -1e9;
  let tween = null;
  let last = performance.now();
  let t = 0;
  const center = () => [-rot[0], -rot[1]];
  const visible = (p) => geoDistance(p, center()) < Math.PI / 2 - 0.02;

  function focus(code) {
    const [lon, lat] = ll(code);
    tween = { from: [...rot], to: [-lon, Math.max(-50, Math.min(50, -lat))], t0: performance.now() };
    if (tween.to[0] - tween.from[0] > 180) tween.from[0] += 360;
    if (tween.from[0] - tween.to[0] > 180) tween.from[0] -= 360;
  }

  function select(code) {
    state.selected = code;
    lastInteract = performance.now();
    if (code) focus(code);
    renderPanel();
  }

  let px = 0;
  let py = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    px = e.clientX;
    py = e.clientY;
    tween = null;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (dragging) {
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      const k = 90 / proj.scale();
      rot[0] += dx * k * 1.6;
      rot[1] = Math.max(-70, Math.min(70, rot[1] - dy * k * 1.6));
      px = e.clientX;
      py = e.clientY;
      lastInteract = performance.now();
      return;
    }
    if (e.pointerType === 'touch') return;
    const code = pick(e);
    const name = code ? C[code].name : hoverName(e);
    state.hover = code;
    canvas.style.cursor = name ? 'pointer' : 'grab';
    if (name) {
      const r = wrap.getBoundingClientRect();
      tip.hidden = false;
      tip.textContent = name;
      tip.style.left = `${e.clientX - r.left + 12}px`;
      tip.style.top = `${e.clientY - r.top + 12}px`;
    } else tip.hidden = true;
  });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    if (!moved) select(pick(e) || null);
  });
  canvas.addEventListener('pointerleave', () => { tip.hidden = true; state.hover = null; });

  function lonlatAt(e) {
    const r = canvas.getBoundingClientRect();
    const p = proj.invert([e.clientX - r.left, e.clientY - r.top]);
    if (!p || !visible(p)) return null;
    return p;
  }
  function featAt(e) {
    const p = lonlatAt(e);
    return p ? lands.find((f) => geoContains(f, p)) : null;
  }
  function pick(e) {
    const f = featAt(e);
    return f && byNum[f.id] ? byNum[f.id] : null;
  }
  function hoverName(e) {
    const f = featAt(e);
    return f ? f.properties.name : null;
  }

  // Drawing
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    t += dt;
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      rot = [tween.from[0] + (tween.to[0] - tween.from[0]) * e, tween.from[1] + (tween.to[1] - tween.from[1]) * e];
      if (k >= 1) tween = null;
    } else if (!dragging && !reduce && !state.selected && now - lastInteract > 3500) {
      rot[0] += dt * 5;
    }
    proj.rotate(rot);
    draw();
    requestAnimationFrame(frame);
  }

  function draw() {
    const P = { bg: css('--bg'), ocean: css('--surface'), land: css('--surface-2'), line: css('--line'), signal: css('--signal'), alert: css('--alert'), ink: css('--ink'), muted: css('--muted') };
    const r = proj.scale();
    const cx = size / 2;
    ctx.clearRect(0, 0, size, size);
    // rim glow
    const g = ctx.createRadialGradient(cx, cx, r * 0.92, cx, cx, r * 1.06);
    g.addColorStop(0, 'rgba(255,176,0,0)');
    g.addColorStop(0.5, hexA(P.signal, 0.12));
    g.addColorStop(1, 'rgba(255,176,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cx, r * 1.06, 0, Math.PI * 2);
    ctx.fill();
    // ocean
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = P.ocean;
    ctx.fill();
    ctx.beginPath();
    path(grat);
    ctx.strokeStyle = hexA(P.line, 0.55);
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // land
    ctx.beginPath();
    for (const f of lands) path(f);
    ctx.fillStyle = P.land;
    ctx.fill();
    const sel = state.selected;
    const hov = state.hover;
    for (const code of [sel, hov]) {
      if (!code) continue;
      const f = lands.find((x) => x.id === C[code].num);
      if (!f) continue;
      ctx.beginPath();
      path(f);
      ctx.fillStyle = hexA(P.signal, code === sel ? 0.32 : 0.16);
      ctx.fill();
    }
    ctx.beginPath();
    path(borders);
    ctx.strokeStyle = P.line;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = hexA(P.signal, 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();

    const list = state.all ? shown : shown.slice(0, TOP_N);
    // arcs
    ctx.lineCap = 'round';
    for (const row of list) {
      const p = row.p;
      if (p.from === p.to) continue;
      const related = sel && (p.from === sel || p.to === sel);
      const alpha = sel ? (related ? 0.85 : 0.06) : 0.32;
      const col = row.stateShare >= 0.5 ? P.alert : P.signal;
      ctx.beginPath();
      path(p._line);
      ctx.strokeStyle = hexA(col, alpha);
      ctx.lineWidth = 0.6 + Math.log2(row.n + 1) * 0.55;
      ctx.stroke();
    }
    // particles
    if (!reduce) {
      for (const row of list) {
        const p = row.p;
        if (p.from === p.to) continue;
        const related = sel && (p.from === sel || p.to === sel);
        if (sel && !related) continue;
        const k = Math.min(4, 1 + Math.floor(Math.log2(row.n)));
        const speed = 0.16 / (p._d + 0.35);
        const col = row.stateShare >= 0.5 ? P.alert : P.signal;
        for (let i = 0; i < k; i++) {
          const ph = (t * speed + i / k + hash(p.from + p.to)) % 1;
          const ptLL = p._f(ph);
          if (!visible(ptLL)) continue;
          const [x, y] = proj(ptLL);
          ctx.fillStyle = hexA(col, 0.25);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(x, y, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // domestic rings
    for (const row of list) {
      const p = row.p;
      if (p.from !== p.to) continue;
      const pos = ll(p.from);
      if (!visible(pos)) continue;
      if (sel && p.from !== sel) continue;
      const [x, y] = proj(pos);
      const rad = 3 + Math.sqrt(row.n) * 1.5;
      ctx.strokeStyle = hexA(P.ink, 0.85);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.stroke();
      if (!reduce) {
        const ph = (t * 0.5 + hash(p.from)) % 1;
        ctx.strokeStyle = hexA(P.ink, 0.5 * (1 - ph));
        ctx.beginPath();
        ctx.arc(x, y, rad + ph * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // label for the selected country
    if (sel && visible(ll(sel))) {
      const [x, y] = proj(ll(sel));
      ctx.font = '600 13px "Space Grotesk", sans-serif';
      const w = ctx.measureText(C[sel].name).width + 16;
      ctx.fillStyle = P.ink;
      roundRect(ctx, x - w / 2, y - 34, w, 22, 11);
      ctx.fill();
      ctx.fillStyle = P.bg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(C[sel].name, x, y - 23);
    }
  }

  // Side panel
  function renderPanel() {
    const sel = state.selected;
    if (!sel) {
      const top = shown.filter((r) => r.p.from !== r.p.to).slice(0, 10);
      const dom = shown.filter((r) => r.p.from === r.p.to).slice(0, 3);
      panel.innerHTML = `
        <h3 class="h-sm">Top routes${state.year === 'all' ? '' : ` in ${state.year}`}</h3>
        <ol class="routes">${top.map((r) => route(r)).join('')}</ol>
        ${dom.length ? `<h3 class="h-sm">Inside one country</h3><ol class="routes">${dom.map((r) => route(r)).join('')}</ol>` : ''}
        <p class="fine">Tap a country on the globe, or a route, to see who attacks it and whom it attacks.</p>`;
    } else {
      const out = shown.filter((r) => r.p.from === sel && r.p.to !== sel);
      const inn = shown.filter((r) => r.p.to === sel && r.p.from !== sel);
      const dom = shown.find((r) => r.p.from === sel && r.p.to === sel);
      const sum = (a) => a.reduce((s, r) => s + r.n, 0);
      const un = unattrCount(sel);
      const ex = [...out, ...inn, ...(dom ? [dom] : [])].sort((a, b) => b.n - a.n)[0];
      const bars = (arr, side) => {
        const max = Math.max(1, ...arr.map((r) => r.n));
        return arr.slice(0, 5).map((r) => {
          const other = side === 'out' ? r.p.to : r.p.from;
          return `<li><button type="button" data-code="${other}"><span>${esc(C[other].name)}</span><b>${r.n}</b><i style="width:${(r.n / max) * 100}%"></i></button></li>`;
        }).join('');
      };
      panel.innerHTML = `
        <div class="gp-head"><h3 class="h-md">${esc(C[sel].name)}</h3><button class="icon-btn" type="button" data-clear aria-label="Clear selection"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
        <div class="gp-block"><p class="gp-k">Attacks from here</p><p class="gp-v">${sum(out)} <span>against ${out.length} ${out.length === 1 ? 'country' : 'countries'}</span></p><ol class="bars">${bars(out, 'out') || '<li class="fine">None reported</li>'}</ol></div>
        <div class="gp-block"><p class="gp-k">Attacks on ${esc(C[sel].name)}</p><p class="gp-v">${sum(inn) + un} <span>${un ? `of which ${un} with no attacker named` : 'all with a named attacker'}</span></p><ol class="bars in">${bars(inn, 'in') || '<li class="fine">No named attackers</li>'}</ol></div>
        <div class="gp-block"><p class="gp-k">Inside the country</p><p class="gp-v">${dom ? dom.n : 0} <span>attacks where attacker and target are both here</span></p></div>
        ${ex ? `<p class="fine">For example: ${esc(ex.p.examples[0][0])} (${esc(ex.p.examples[0][1].slice(0, 4))}).</p>` : ''}`;
    }
  }
  function route(r) {
    const a = C[r.p.from].name;
    const b = C[r.p.to].name;
    const label = r.p.from === r.p.to ? esc(a) : `${esc(a)} <span aria-hidden="true">→</span><span class="sr">to</span> ${esc(b)}`;
    return `<li><button type="button" data-code="${r.p.from === r.p.to ? r.p.from : r.p.to}"><i class="dotc ${r.p.from === r.p.to ? 'dom' : r.stateShare >= 0.5 ? 'st' : 'ns'}"></i><span>${label}</span><b>${r.n}</b></button></li>`;
  }
  panel.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear]')) return select(null);
    const b = e.target.closest('[data-code]');
    if (b) select(b.dataset.code);
  });

  refilter();
  requestAnimationFrame(frame);
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
  return h / 1000;
}
function hexA(c, a) {
  c = c.trim();
  if (c.startsWith('#')) {
    const n = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1, 7);
    return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
  }
  return c;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}
