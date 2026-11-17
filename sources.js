// The Sources section: every figure, every breach, every report. Built from data.js.
import { ACCESSED, COUNTERS, FACTS, BREACHES, SOURCES, CAUSES } from './data.js';
import { esc, fmtBig, fmtRecords } from './util.js';

let extra = [];
let rerender = () => {};
// The globe adds its figures once its data has loaded.
export function addFigures(rows) {
  extra = extra.concat(rows);
  rerender();
}

export function initSources() {
  document.getElementById('accessed').textContent = `Every figure links to the report or article it came from. All sources checked on ${ACCESSED}. Each one is marked as measured, second-hand, the attackers’ claim, or a compilation of old leaks.`;

  const link = (id) => `<a href="${esc(SOURCES[id].url)}" target="_blank" rel="noopener">${esc(SOURCES[id].publisher)}</a>`;
  const kind = (k) => `<span class="badge ${k}">${k}</span>`;

  rerender = () => {
  const figs = [
    ...COUNTERS.map((c) => ({ label: c.short, value: c.unit === 'usd' ? fmtBig(c.value, 'usd') : c.value.toLocaleString('en-US'), period: c.period, source: c.source, kind: c.kind })),
    ...Object.values(FACTS),
    ...extra,
  ];
  document.getElementById('figTable').innerHTML = `
    <thead><tr><th>Figure</th><th>Value</th><th>Period</th><th>Source</th><th>Type</th></tr></thead>
    <tbody>${figs.map((f) => `<tr><td>${esc(f.label)}</td><td class="v">${esc(f.value)}</td><td>${esc(f.period)}</td><td>${link(f.source)}</td><td>${kind(f.kind)}</td></tr>`).join('')}</tbody>`;
  };
  rerender();

  const rows = [...BREACHES].sort((a, b) => b.records - a.records);
  document.getElementById('breachTable').innerHTML = `
    <thead><tr><th>Breach</th><th>Year</th><th>Size</th><th>Cause</th><th>Source</th><th>Type</th></tr></thead>
    <tbody>${rows.map((b) => `<tr><td>${esc(b.name)}</td><td>${b.year}</td><td class="v">${fmtRecords(b.records)} ${esc(b.unit)}</td><td>${esc(CAUSES[b.cause])}</td><td>${link(b.source)}</td><td>${kind(b.status)}</td></tr>`).join('')}</tbody>`;

  const used = new Set(['eurepoc', 'worldCountries', 'worldAtlas', ...COUNTERS.map((c) => c.source), ...Object.values(FACTS).map((f) => f.source), ...BREACHES.map((b) => b.source)]);
  document.getElementById('srcList').innerHTML = Object.entries(SOURCES).filter(([id]) => used.has(id)).map(([, s]) =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>, ${esc(s.publisher)}${s.date ? `, ${esc(s.date)}` : ''}</li>`).join('');
}
