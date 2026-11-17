// Shared globe: orthographic projection on canvas, drag to spin, auto-spin, picking and a
// render loop that pauses when the globe is off screen or the tab is hidden.
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, geoDistance, geoContains } from 'https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm';
import { feature, mesh } from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm';
import { css, reducedMotion } from './util.js';

export { geoInterpolate, geoDistance };
const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
let atlasP = null;
export const loadAtlas = () => (atlasP ||= fetch(ATLAS).then((r) => r.json()));

export async function createGlobe({ wrap, canvas, tip, codeByNum, nameOf, onSelect, overlay, spin = 5, rot = [-20, -22] }) {
  const world = await loadAtlas();
  const ctx = canvas.getContext('2d');
  const reduce = reducedMotion();
  const lands = feature(world, world.objects.countries).features;
  const borders = mesh(world, world.objects.countries, (a, b) => a !== b);
  const landById = Object.fromEntries(lands.map((f) => [f.id, f]));
  const proj = geoOrthographic().clipAngle(90).precision(0.5);
  const path = geoPath(proj, ctx);
  const grat = geoGraticule10();

  const P = {};
  const readPalette = () => Object.assign(P, { bg: css('--bg'), ocean: css('--surface'), land: css('--surface-2'), line: css('--line'), signal: css('--signal'), alert: css('--alert'), ink: css('--ink'), muted: css('--muted') });
  readPalette();
  window.addEventListener('themechange', readPalette);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', readPalette);

  const api = { proj, path, ctx, P, reduce, t: 0, size: 0, selected: null, hover: null, rot: [...rot] };
  let dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    api.size = wrap.clientWidth;
    canvas.width = Math.round(api.size * dpr);
    canvas.height = Math.round(api.size * dpr);
    canvas.style.height = `${api.size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    proj.scale(api.size / 2 - 10).translate([api.size / 2, api.size / 2]);
  }
  resize();
  new ResizeObserver(resize).observe(wrap);

  const center = () => [-api.rot[0], -api.rot[1]];
  api.visible = (p) => geoDistance(p, center()) < Math.PI / 2 - 0.02;

  let tween = null;
  api.focus = ([lon, lat]) => {
    tween = { from: [...api.rot], to: [-lon, Math.max(-50, Math.min(50, -lat))], t0: performance.now() };
    if (tween.to[0] - tween.from[0] > 180) tween.from[0] += 360;
    if (tween.from[0] - tween.to[0] > 180) tween.from[0] -= 360;
  };
  let lastInteract = -1e9;
  api.select = (code) => {
    api.selected = code;
    lastInteract = performance.now();
    onSelect?.(code);
  };

  // Pointer: drag to spin, click to pick, hover for names.
  let dragging = false;
  let moved = false;
  let px = 0;
  let py = 0;
  const featAt = (e) => {
    const r = canvas.getBoundingClientRect();
    const p = proj.invert([e.clientX - r.left, e.clientY - r.top]);
    if (!p || !api.visible(p)) return null;
    return lands.find((f) => geoContains(f, p)) || null;
  };
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
      const k = (90 / proj.scale()) * 1.6;
      api.rot[0] += dx * k;
      api.rot[1] = Math.max(-70, Math.min(70, api.rot[1] - dy * k));
      px = e.clientX;
      py = e.clientY;
      lastInteract = performance.now();
      return;
    }
    if (e.pointerType === 'touch') return;
    const f = featAt(e);
    const code = f && codeByNum[f.id];
    api.hover = code || null;
    const name = code ? nameOf(code) : f?.properties.name;
    canvas.style.cursor = code ? 'pointer' : 'grab';
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
    if (!moved) {
      const f = featAt(e);
      api.select((f && codeByNum[f.id]) || null);
    }
  });
  canvas.addEventListener('pointerleave', () => { tip.hidden = true; api.hover = null; });

  function drawBase() {
    const { size } = api;
    const r = proj.scale();
    const cx = size / 2;
    ctx.clearRect(0, 0, size, size);
    const g = ctx.createRadialGradient(cx, cx, r * 0.92, cx, cx, r * 1.06);
    g.addColorStop(0, hexA(P.signal, 0));
    g.addColorStop(0.5, hexA(P.signal, 0.12));
    g.addColorStop(1, hexA(P.signal, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cx, r * 1.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = P.ocean;
    ctx.fill();
    ctx.beginPath();
    path(grat);
    ctx.strokeStyle = hexA(P.line, 0.55);
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.beginPath();
    for (const f of lands) path(f);
    ctx.fillStyle = P.land;
    ctx.fill();
    for (const code of [api.selected, api.hover]) {
      const f = code && api.numOf && landById[api.numOf(code)];
      if (!f) continue;
      ctx.beginPath();
      path(f);
      ctx.fillStyle = hexA(P.signal, code === api.selected ? 0.32 : 0.16);
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
  }

  api.label = (code, lonlat) => {
    if (!api.visible(lonlat)) return;
    const [x, y] = proj(lonlat);
    const name = nameOf(code);
    ctx.font = '600 13px "Space Grotesk", sans-serif';
    const w = ctx.measureText(name).width + 16;
    ctx.fillStyle = P.ink;
    roundRect(ctx, x - w / 2, y - 34, w, 22, 11);
    ctx.fill();
    ctx.fillStyle = P.bg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x, y - 23);
  };

  // Loop: only while on screen and the tab is visible.
  let onScreen = true;
  let running = false;
  let last = performance.now();
  function frame(now) {
    if (!onScreen || document.hidden) { running = false; return; }
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    api.t += dt;
    if (tween) {
      const k = Math.min(1, (now - tween.t0) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      api.rot = [tween.from[0] + (tween.to[0] - tween.from[0]) * e, tween.from[1] + (tween.to[1] - tween.from[1]) * e];
      if (k >= 1) tween = null;
    } else if (!dragging && !reduce && !api.selected && now - lastInteract > 3500) {
      api.rot[0] += dt * spin;
    }
    proj.rotate(api.rot);
    drawBase();
    overlay(api, dt, now);
    requestAnimationFrame(frame);
  }
  const start = () => {
    if (running || !onScreen || document.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; start(); }).observe(canvas);
  document.addEventListener('visibilitychange', start);
  start();
  return api;
}

export function hexA(c, a) {
  c = (c || '').trim();
  if (c.startsWith('#')) {
    const n = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1, 7);
    return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
  }
  return c;
}
export function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
  return h / 1000;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}
