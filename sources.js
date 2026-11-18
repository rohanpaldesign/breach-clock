// The Sources section: every figure, every breach, every report. Built from data.js.
import { ACCESSED, COUNTERS, FACTS, BREACHES, SOURCES, CAUSES, LIVE } from './data.js';
import { esc, fmtBig, fmtRecords } from './util.js';

let extra = [];
let rerender = () => {};
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

  // Live globe figures.
  const name = (c) => LIVE.places[c][0];
  const top = (a) => [...a].sort((x, y) => y[1] - x[1])[0];
  addFigures([
    { label: 'DDoS attacks mitigated, average an hour', value: LIVE.perHour.toLocaleString('en-US'), period: 'H1 2026', source: 'cfReport', kind: 'measured' },
    { label: `Biggest source of DDoS traffic (${name(top(LIVE.sources)[0])})`, value: `${top(LIVE.sources)[1]}%`, period: '7 days to 16 Nov 2026', source: 'cfRadar', kind: 'measured' },
    { label: `Most attacked (${name(top(LIVE.targets)[0])})`, value: `${top(LIVE.targets)[1]}%`, period: '7 days to 16 Nov 2026', source: 'cfRadar', kind: 'measured' },
    { label: 'Attacks a minute on each route (source share × target share × rate)', value: 'estimated', period: 'model', source: 'cfRadar', kind: 'estimated' },
  ]);
  // On the record figures come from the same file the globe uses.
  fetch('data/flows.json').then((r) => r.json()).then(({ totals: T }) => addFigures([
    { label: 'Publicly reported incidents with a target country', value: T.incidents.toLocaleString('en-US'), period: '2000 to Feb 2025', source: 'eurepoc', kind: 'measured' },
    { label: 'Countries named as an attacker’s home', value: String(T.attackerCountries), period: '2000 to Feb 2025', source: 'eurepoc', kind: 'measured' },
    { label: 'Attacks inside a single country', value: String(T.domestic), period: '2000 to Feb 2025', source: 'eurepoc', kind: 'measured' },
    { label: 'Share of attacks on a country with no attacker named', value: `${Math.round((T.unattributedTargets / (T.unattributedTargets + T.namedPairs)) * 100)}%`, period: '2000 to Feb 2025', source: 'eurepoc', kind: 'measured' },
  ])).catch(() => {});

  const rows = [...BREACHES].sort((a, b) => b.records - a.records);
  document.getElementById('breachTable').innerHTML = `
    <thead><tr><th>Breach</th><th>Year</th><th>Size</th><th>Cause</th><th>Source</th><th>Type</th></tr></thead>
    <tbody>${rows.map((b) => `<tr><td>${esc(b.name)}</td><td>${b.year}</td><td class="v">${fmtRecords(b.records)} ${esc(b.unit)}</td><td>${esc(CAUSES[b.cause])}</td><td>${link(b.source)}</td><td>${kind(b.status)}</td></tr>`).join('')}</tbody>`;

  const used = new Set(['hibp', 'cisaKev', 'cfReport', 'cfRadar', 'eurepoc', 'worldCountries', 'worldAtlas', ...COUNTERS.map((c) => c.source), ...Object.values(FACTS).map((f) => f.source), ...BREACHES.map((b) => b.source)]);
  document.getElementById('srcList').innerHTML = Object.entries(SOURCES).filter(([id]) => used.has(id)).map(([, s]) =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>, ${esc(s.publisher)}${s.date ? `, ${esc(s.date)}` : ''}</li>`).join('');
}
