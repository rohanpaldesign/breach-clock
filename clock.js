// "Since you arrived": live counters, rolling digits and the event streams.
import { COUNTERS, SOURCES } from './data.js';
import { fmtMoney, fmtCount, fmtBig, openSource, css, reducedMotion } from './util.js';

const byId = Object.fromEntries(COUNTERS.map((c) => [c.id, c]));
export const perSecond = (c) => c.value / (c.periodDays * 86400);

// Rolling digits. Rebuilds when the shape of the string changes, otherwise just rolls.
function odometer(el) {
  el.classList.add('odo');
  let cells = [];
  const isD = (ch) => ch >= '0' && ch <= '9';
  const build = (str) => {
    el.textContent = '';
    cells = [...str].map((ch) => {
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      if (isD(ch)) {
        s.className = 'odo-d';
        const col = document.createElement('span');
        col.className = 'odo-col';
        for (let d = 0; d < 10; d++) {
          const x = document.createElement('span');
          x.textContent = d;
          col.appendChild(x);
        }
        col.style.transform = `translateY(-${Number(ch) * 10}%)`;
        s.appendChild(col);
      } else {
        s.className = 'odo-s';
        s.textContent = ch;
      }
      el.appendChild(s);
      return { s, ch };
    });
  };
  return (str) => {
    el.setAttribute('aria-label', str);
    const same = cells.length === str.length && [...str].every((ch, i) => isD(ch) === isD(cells[i].ch) && (isD(ch) || ch === cells[i].ch));
    if (!same) return build(str);
    [...str].forEach((ch, i) => {
      const c = cells[i];
      if (c.ch !== ch) {
        // A digit that changes faster than the roll would blur, so it snaps instead.
        const now = performance.now();
        c.s.firstChild.style.transition = now - (c.t || 0) < 1200 ? 'none' : '';
        c.t = now;
        c.s.firstChild.style.transform = `translateY(-${Number(ch) * 10}%)`;
        c.ch = ch;
      }
    });
  };
}

function display(c, mode, elapsed) {
  if (mode === 'live') {
    const v = perSecond(c) * elapsed;
    return c.unit === 'usd' ? fmtMoney(v) : fmtCount(v);
  }
  const v = mode === 'day' ? perSecond(c) * 86400 : (c.value * 365) / c.periodDays;
  return fmtBig(v, c.unit);
}

const pad = (n) => String(n).padStart(2, '0');
function clockText(s) {
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  return h ? `${h}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

export function initClock() {
  const grid = document.getElementById('counterGrid');
  const rest = COUNTERS.filter((c) => c.id !== 'losses');
  grid.innerHTML = rest.map((c) => `
    <button class="counter" type="button" data-counter="${c.id}">
      <span class="counter-num ${c.unit}" data-num></span>
      <span class="counter-label">${c.label}</span>
      <span class="next" data-next ${perSecond(c) >= 1 ? 'hidden' : ''}><i></i></span>
      <span class="src-chip">${shortSource(c)} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></span>
    </button>`).join('');

  const views = [{ c: byId.losses, set: odometer(document.getElementById('bigNum')), next: null }];
  for (const el of grid.querySelectorAll('.counter')) {
    views.push({ c: byId[el.dataset.counter], set: odometer(el.querySelector('[data-num]')), next: el.querySelector('[data-next] i') });
  }
  // The floating pill shares the losses counter and tucks away when the big number is on screen.
  const pill = document.getElementById('floatLive');
  views.push({ c: byId.losses, set: odometer(document.getElementById('floatNum')), next: null });
  let bigVisible = false;
  const tuck = () => pill.classList.toggle('tucked', bigVisible || mode !== 'live');
  new IntersectionObserver(([e]) => { bigVisible = e.isIntersecting; tuck(); }, { threshold: 0.3 }).observe(document.getElementById('bigNum'));
  pill.addEventListener('click', () => document.getElementById('clock').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }));

  document.querySelectorAll('[data-counter]').forEach((el) => el.addEventListener('click', () => openCounter(byId[el.dataset.counter])));

  let mode = 'live';
  let paused = false;
  let elapsed = 0;
  let last = performance.now();
  const elapsedEl = document.getElementById('elapsed');
  const sinceLabel = document.getElementById('sinceLabel');
  const hero = document.getElementById('clock');
  const pauseBtn = document.getElementById('pauseBtn');

  document.querySelectorAll('.hero-head [data-mode]').forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    document.querySelectorAll('.hero-head [data-mode]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    sinceLabel.textContent = mode === 'live' ? 'Since you opened this page' : mode === 'day' ? 'On an average day' : 'In a year';
    elapsedEl.hidden = mode !== 'live';
    tuck();
    render();
  }));
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.querySelector('span').textContent = paused ? 'Resume' : 'Pause';
    hero.classList.toggle('paused', paused);
  });

  function render() {
    for (const v of views) {
      v.set(display(v.c, mode, elapsed));
      if (v.next) {
        const n = perSecond(v.c) * elapsed;
        v.next.style.width = mode === 'live' ? `${(n % 1) * 100}%` : '0%';
      }
    }
    elapsedEl.textContent = clockText(elapsed);
  }

  // Counters keep real time even when the tab is hidden: they count "since you arrived".
  let lastText = 0;
  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    if (!paused) elapsed += dt;
    if (now - lastText > 120) {
      lastText = now;
      if (mode === 'live') render();
    }
    requestAnimationFrame(tick);
  }
  render();
  requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') return;
    last = performance.now();
  });

  initStreams(() => paused);
}

function shortSource(c) {
  const s = SOURCES[c.source];
  const name = { ic3: 'FBI IC3', itrc: 'ITRC', apwg: 'APWG', chainalysis: 'Chainalysis' }[c.source] || s.publisher;
  return `${name} · ${c.period}`;
}

function openCounter(c) {
  const ps = perSecond(c);
  const secs = c.periodDays * 86400;
  const money = c.unit === 'usd';
  const rate = money ? `$${ps.toLocaleString('en-US', { maximumFractionDigits: 2 })} a second` : ps >= 1 ? `${ps.toLocaleString('en-US', { maximumFractionDigits: 1 })} a second` : `one every ${(1 / ps).toLocaleString('en-US', { maximumFractionDigits: 1 })} seconds`;
  openSource({
    title: c.short,
    value: money ? fmtBig(c.value, 'usd') : c.value.toLocaleString('en-US'),
    sub: `${c.label}, ${c.period}`,
    math: `${c.value.toLocaleString('en-US')} ÷ ${secs.toLocaleString('en-US')} seconds (${c.periodDays} days) = ${rate}`,
    note: c.note,
    kind: c.kind,
    source: c.source,
  });
}

// Event streams: one lane per counter that has a dot unit. Dots enter on the right at the
// real average rate and drift left.
function initStreams(isPaused) {
  const canvas = document.getElementById('streams');
  const ctx = canvas.getContext('2d');
  const lanes = COUNTERS.filter((c) => c.dot).map((c) => ({ c, rate: perSecond(c) / c.dot.per, acc: 0, dots: [] }));
  let w = 0;
  let h = 0;
  let dpr = 1;
  const TRAVEL = 22; // seconds to cross

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  new ResizeObserver(size).observe(canvas);

  // Seed each lane so it looks like it has been running, not empty.
  for (const l of lanes) {
    const n = Math.min(400, Math.round(l.rate * TRAVEL));
    for (let i = 0; i < n; i++) l.dots.push({ age: Math.random() * TRAVEL, jy: Math.random() - 0.5 });
  }

  const reduce = reducedMotion();
  let last = performance.now();
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (visible) {
      if (!isPaused() && !reduce) {
        for (const l of lanes) {
          l.acc += l.rate * dt;
          while (l.acc >= 1) {
            l.acc -= 1;
            l.dots.push({ age: Math.random() * dt, jy: Math.random() - 0.5 });
          }
          for (const d of l.dots) d.age += dt;
          l.dots = l.dots.filter((d) => d.age < TRAVEL);
        }
      }
      draw();
    }
    requestAnimationFrame(frame);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const colors = { alert: css('--alert'), signal: css('--signal'), ink: css('--ink') };
    const line = css('--line');
    const muted = css('--muted');
    const laneH = h / lanes.length;
    lanes.forEach((l, i) => {
      const y = laneH * i + laneH * 0.62;
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = muted;
      ctx.font = '500 11px "IBM Plex Mono", monospace';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(l.c.dot.label, 0, laneH * i + laneH * 0.3);
      const rateText = l.rate >= 1 ? `${l.rate.toFixed(1)}/s` : `1 every ${(1 / l.rate).toFixed(0)}s`;
      const tw = ctx.measureText(rateText).width;
      ctx.fillText(rateText, w - tw, laneH * i + laneH * 0.3);
      const col = colors[l.c.dot.color];
      const spread = Math.min(10, laneH * 0.22);
      for (const d of l.dots) {
        const x = w - (d.age / TRAVEL) * (w + 10);
        const yy = y + d.jy * spread;
        const fresh = d.age < 0.6;
        ctx.globalAlpha = Math.min(1, 0.25 + 0.75 * (x / w));
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, yy, fresh ? 3.4 : 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (fresh && !reduce) {
          ctx.globalAlpha = 1 - d.age / 0.6;
          ctx.strokeStyle = col;
          ctx.beginPath();
          ctx.arc(x, yy, 3 + d.age * 22, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    });
  }
  requestAnimationFrame(frame);
}
