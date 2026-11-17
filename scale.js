// Scale: each breach is a sunflower-packed cluster of dots, one dot per million records.
// Filters re-pack the clusters; dots grow in a spiral when a cluster appears.
import { BREACHES, CAUSES, STATUSES, SOURCES } from './data.js';
import { css, esc, fmtRecords, reducedMotion, sourceLine } from './util.js';

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const LABEL_H = 46;

export function initScale() {
  const canvas = document.getElementById('scaleCanvas');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('scaleStage');
  const tip = document.getElementById('scaleTip');
  const detail = document.getElementById('scaleDetail');
  const summary = document.getElementById('scaleSummary');
  const reduce = reducedMotion();

  const state = { years: 'all', causes: new Set(Object.keys(CAUSES).filter((k) => k !== 'compiled')), compiled: false, sort: 'size', hover: null, selected: null };
  const clusters = new Map(); // id -> animated cluster
  let w = 0;
  let h = 0;
  let dpr = 1;
  let unit = 4; // spacing scale c
  let animating = true;
  let started = false; // dots grow only once the section is on screen

  // Cause chips
  const chips = document.getElementById('causeChips');
  chips.innerHTML = Object.entries(CAUSES).filter(([k]) => k !== 'compiled').map(([k, v]) => `<button type="button" class="chip" data-cause="${k}" aria-pressed="true">${v}</button>`).join('');
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cause]');
    if (!b) return;
    const k = b.dataset.cause;
    if (state.causes.has(k)) state.causes.delete(k); else state.causes.add(k);
    if (!state.causes.size) Object.keys(CAUSES).forEach((x) => x !== 'compiled' && state.causes.add(x));
    chips.querySelectorAll('[data-cause]').forEach((x) => x.setAttribute('aria-pressed', String(state.causes.has(x.dataset.cause))));
    relayout();
  });
  seg('yearSeg', 'years', (v) => { state.years = v; relayout(); });
  seg('sortSeg', 'sort', (v) => { state.sort = v; relayout(); });
  document.getElementById('compiledToggle').addEventListener('change', (e) => { state.compiled = e.target.checked; relayout(); });

  function seg(id, key, fn) {
    const el = document.getElementById(id);
    el.addEventListener('click', (e) => {
      const b = e.target.closest(`[data-${key}]`);
      if (!b) return;
      el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      fn(b.dataset[key]);
    });
  }

  function visibleList() {
    let list = BREACHES.filter((b) => {
      if (b.cause === 'compiled') return state.compiled;
      if (!state.causes.has(b.cause)) return false;
      if (state.years !== 'all') {
        const [a, z] = state.years.split('-').map(Number);
        if (b.year < a || b.year > z) return false;
      }
      return true;
    });
    if (state.compiled && state.years !== 'all') {
      const [a, z] = state.years.split('-').map(Number);
      list = list.filter((b) => b.year >= a && b.year <= z);
    }
    return list.sort(state.sort === 'size' ? (p, q) => q.records - p.records : (p, q) => q.year - p.year || q.records - p.records);
  }

  const dots = (b) => Math.max(1, Math.round(b.records));

  function relayout() {
    tip.hidden = true;
    state.hover = null;
    const list = visibleList();
    w = stage.clientWidth - 32;
    const maxN = Math.max(...list.map(dots), 1);
    // Biggest cluster spans at most ~30% of the width (most of it on phones).
    const maxD = w < 560 ? w * 0.56 : Math.min(w * 0.3, 380);
    unit = Math.max(0.9, Math.min(9, maxD / 2 / Math.sqrt(maxN)));
    const minSlot = w < 560 ? 104 : 128;
    const gap = 18;
    let x = 0;
    let y = 0;
    let rowH = 0;
    let row = [];
    const placed = [];
    const flush = () => {
      // centre the row
      const used = x - gap;
      const off = Math.max(0, (w - used) / 2);
      for (const p of row) {
        p.cx += off;
        p.cy = y + rowH / 2;
        p.ly = y + rowH + 8;
      }
      y += rowH + LABEL_H + 18;
      x = 0;
      rowH = 0;
      row = [];
    };
    for (const b of list) {
      const r = unit * Math.sqrt(dots(b)) + unit;
      const slot = Math.max(2 * r, minSlot);
      if (x > 0 && x + slot > w) flush();
      const p = { b, r, cx: x + slot / 2, cy: 0, ly: 0 };
      row.push(p);
      placed.push(p);
      x += slot + gap;
      rowH = Math.max(rowH, 2 * r);
    }
    if (row.length) flush();
    h = Math.max(160, y);

    const ids = new Set(list.map((b) => b.id));
    for (const [id, c] of clusters) if (!ids.has(id)) c.talpha = 0;
    for (const p of placed) {
      let c = clusters.get(p.b.id);
      if (!c) {
        c = { b: p.b, x: p.cx, y: p.cy, ly: p.ly, c: unit, alpha: 0, grow: reduce ? 1 : 0 };
        clusters.set(p.b.id, c);
      }
      Object.assign(c, { tx: p.cx, ty: p.cy, tly: p.ly, tc: unit, talpha: 1, r: p.r });
      if (reduce) Object.assign(c, { x: p.cx, y: p.cy, ly: p.ly, c: unit, alpha: 1 });
    }
    const total = list.reduce((s, b) => s + b.records, 0);
    summary.textContent = `${list.length} breaches · ${fmtRecords(total)} records · 1 dot = 1 million`;
    size();
    kick();
  }

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function kick() {
    if (!started && !reduce) return;
    if (!animating) {
      animating = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const k = 1 - Math.exp(-dt * 7);
    let moving = false;
    for (const [id, c] of clusters) {
      for (const [a, t] of [['x', 'tx'], ['y', 'ty'], ['ly', 'tly'], ['c', 'tc'], ['alpha', 'talpha']]) {
        const d = c[t] - c[a];
        if (Math.abs(d) > 0.01) { c[a] += d * k; moving = true; } else c[a] = c[t];
      }
      if (c.grow < 1 && c.talpha > 0) { c.grow = Math.min(1, c.grow + dt / 1.4); moving = true; }
      if (c.talpha === 0 && c.alpha < 0.02) clusters.delete(id);
    }
    draw();
    if (moving) requestAnimationFrame(frame);
    else animating = false;
  }

  function colorFor(b, P) {
    return { confirmed: P.signal, reported: P.signal, claimed: P.alert, compiled: P.faint }[b.status];
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const P = { signal: css('--signal'), alert: css('--alert'), faint: css('--faint'), ink: css('--ink'), muted: css('--muted') };
    const focus = state.hover || state.selected;
    for (const c of clusters.values()) {
      const n = dots(c.b);
      const shown = Math.ceil(n * easeOut(c.grow));
      const dim = focus && focus !== c.b.id ? 0.28 : 1;
      const base = c.b.status === 'reported' ? 0.55 : 1;
      ctx.globalAlpha = c.alpha * dim * base;
      ctx.fillStyle = colorFor(c.b, P);
      const rd = Math.max(0.55, c.c * 0.42);
      ctx.beginPath();
      for (let i = 0; i < shown; i++) {
        const rr = c.c * Math.sqrt(i + 0.5);
        const th = i * GOLDEN;
        const px = c.x + rr * Math.cos(th);
        const py = c.y + rr * Math.sin(th);
        if (rd < 1.2) ctx.rect(px - rd, py - rd, rd * 2, rd * 2);
        else { ctx.moveTo(px + rd, py); ctx.arc(px, py, rd, 0, Math.PI * 2); }
      }
      ctx.fill();
      // label
      ctx.globalAlpha = c.alpha * (focus && focus !== c.b.id ? 0.45 : 1);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = P.ink;
      ctx.font = '600 13px "Space Grotesk", sans-serif';
      ctx.fillText(clip(c.b.name, 22), c.x, c.ly);
      ctx.fillStyle = P.muted;
      ctx.font = '400 11px "IBM Plex Mono", monospace';
      ctx.fillText(`${short(c.b.records)} · ${c.b.year}`, c.x, c.ly + 18);
    }
    ctx.globalAlpha = 1;
  }

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const short = (m) => (m >= 1000 ? `${(m / 1000).toFixed(m >= 10000 ? 0 : 1)}B` : `${m >= 10 ? Math.round(m) : m}M`);

  function hit(mx, my) {
    for (const c of clusters.values()) {
      if (c.talpha === 0) continue;
      const dx = mx - c.x;
      const dy = my - c.y;
      if (dx * dx + dy * dy <= (c.r + 4) ** 2) return c;
      if (Math.abs(dx) < 60 && my >= c.ly - 2 && my <= c.ly + 34) return c;
    }
    return null;
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const [mx, my] = pos(e);
    const c = hit(mx, my);
    const id = c ? c.b.id : null;
    canvas.style.cursor = c ? 'pointer' : 'default';
    if (id !== state.hover) { state.hover = id; draw(); }
    if (c) {
      tip.hidden = false;
      tip.innerHTML = `<b>${esc(c.b.name)}</b><span class="mono">${fmtRecords(c.b.records)} ${esc(c.b.unit)} · ${c.b.year} · ${esc(CAUSES[c.b.cause])}</span><br>${esc(c.b.note)}`;
      const sr = stage.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      let left = cr.left - sr.left + mx + 14;
      if (left + 290 > sr.width) left = cr.left - sr.left + mx - 294;
      tip.style.left = `${Math.max(8, left)}px`;
      tip.style.top = `${cr.top - sr.top + my + 14}px`;
    } else tip.hidden = true;
  });
  canvas.addEventListener('pointerleave', () => { tip.hidden = true; if (state.hover) { state.hover = null; draw(); } });
  canvas.addEventListener('click', (e) => {
    const [mx, my] = pos(e);
    const c = hit(mx, my);
    state.selected = c ? c.b.id : null;
    showDetail(c ? c.b : null);
    draw();
  });

  function showDetail(b) {
    if (!b) { detail.innerHTML = ''; return; }
    const s = SOURCES[b.source];
    detail.innerHTML = `<div class="detail-card">
      <div class="num">${short(b.records)}</div>
      <h3>${esc(b.name)}, ${b.year} <span class="badge ${b.status}">${b.status}</span></h3>
      <p>${fmtRecords(b.records)} ${esc(b.unit)} · ${esc(CAUSES[b.cause])} · ${esc(b.sector)}. ${esc(b.note)}</p>
      <p>${esc(STATUSES[b.status])}. Source: <a href="${esc(s.url)}" target="_blank" rel="noopener">${sourceLine(b.source)}</a></p>
    </div>`;
  }

  let rw = 0;
  new ResizeObserver(() => {
    if (Math.abs(stage.clientWidth - rw) < 2) return;
    rw = stage.clientWidth;
    relayout();
  }).observe(stage);
  // Start the spiral growth when the section comes into view.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !started) { started = true; relayout(); }
  }, { threshold: 0.15 }).observe(stage);
  relayout();
  animating = false;
  if (!reduce) for (const c of clusters.values()) c.grow = 0;
  draw();
  window.addEventListener('themechange', draw);
}
