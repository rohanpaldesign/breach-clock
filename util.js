import { SOURCES } from './data.js';

export const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const fmtMoney = (v) => '$' + Math.floor(v).toLocaleString('en-US');
export const fmtCount = (v) => Math.floor(v).toLocaleString('en-US');

// "$20.88 billion", "57.2 million", "763,915"
export function fmtBig(v, unit) {
  const pre = unit === 'usd' ? '$' : '';
  const tiers = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']];
  for (const [n, word] of tiers) {
    if (v >= n) {
      const x = v / n;
      const digits = x >= 100 ? 0 : x >= 10 ? 1 : 2;
      return `${pre}${x.toLocaleString('en-US', { maximumFractionDigits: digits })} ${word}`;
    }
  }
  return pre + Math.round(v).toLocaleString('en-US');
}

// Records are stored in millions.
export function fmtRecords(m) {
  if (m >= 1000) return `${(m / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} billion`;
  return `${m.toLocaleString('en-US', { maximumFractionDigits: 1 })} million`;
}

export const KIND_TEXT = {
  measured: 'Measured by the publisher',
  reported: 'Second-hand: from coverage of the report',
  claimed: 'The attackers’ own number',
  compiled: 'Older leaks re-packaged',
  confirmed: 'Confirmed by the company or official filings',
};

export function sourceLine(id) {
  const s = SOURCES[id];
  return `${s.publisher}, <i>${esc(s.title)}</i>${s.date ? `, ${esc(s.date)}` : ''}`;
}

const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

export function openSource({ title, value, sub, math, note, kind, source }) {
  const s = SOURCES[source];
  const dlg = document.getElementById('srcDialog');
  document.getElementById('srcDialogBody').innerHTML = `
    <h3 id="srcDialogTitle">${esc(title)} <span class="badge ${kind}">${kind}</span></h3>
    <div class="dv">${esc(value)}</div>
    <p>${esc(sub)}</p>
    ${math ? `<p class="math">${esc(math)}</p>` : ''}
    ${note ? `<p>${esc(note)}</p>` : ''}
    <p><b>Source:</b> ${sourceLine(source)}. ${KIND_TEXT[kind] || ''}.</p>
    <a class="open-src" href="${esc(s.url)}" target="_blank" rel="noopener">Open the source ${arrow}</a>`;
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');
}
