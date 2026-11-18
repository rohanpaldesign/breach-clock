// Latest: notable new breaches (HIBP) and actively exploited flaws (CISA KEV).
// data/latest.json is refreshed daily by .github/workflows/update.yml.
import { esc, fmtBig } from './util.js';

const fmtDate = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const ago = (iso) => {
  const h = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 3.6e6));
  return h < 1 ? 'less than an hour ago' : h < 48 ? `${h} hour${h === 1 ? '' : 's'} ago` : `${Math.round(h / 24)} days ago`;
};
export const loadLatest = () => fetch('data/latest.json', { cache: 'no-cache' }).then((r) => r.json());
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

export async function initLatest() {
  let d;
  try {
    d = await loadLatest();
  } catch {
    document.getElementById('latestBreaches').innerHTML = '<p class="fine">Couldn’t load the latest data. Refresh to try again.</p>';
    return;
  }
  document.getElementById('latestChecked').textContent = `Last checked ${ago(d.checked)}.`;
  const M = d.counts;
  document.getElementById('latestStats').innerHTML = [
    [M.breaches, 'breaches big or sensitive enough to list, last 6 months'],
    [fmtBig(M.accounts, ''), 'accounts exposed in them'],
    [M.flaws, 'flaws in common software being exploited, last 30 days'],
    [d.kevTotal.toLocaleString('en-US'), 'flaws on CISA’s exploited list in total'],
  ].map(([v, l]) => `<div class="gstat"><span class="v">${esc(v)}</span><span class="l">${esc(l)}</span></div>`).join('');

  document.getElementById('latestBreaches').innerHTML = d.breaches.map((b) => `
    <article class="news">
      <p class="news-k">Breach · surfaced ${fmtDate(b.added)}</p>
      <h3 class="news-t">${esc(b.name)}</h3>
      <p class="news-n">${esc(fmtBig(b.accounts, ''))} <span>accounts${b.happened ? `, happened ${fmtDate(b.happened)}` : ''}</span></p>
      <p class="news-why"><b>Why it’s here:</b> ${esc(b.why)}</p>
      <p class="news-a">${esc(b.about)}</p>
      <ul class="news-chips">${b.data.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <a class="news-l" href="${esc(b.url)}" target="_blank" rel="noopener">Check if you’re in it ${arrow}</a>
    </article>`).join('') || '<p class="fine">A quiet stretch: nothing big enough to list.</p>';

  document.getElementById('latestFlaws').innerHTML = d.flaws.map((f) => `
    <article class="news">
      <p class="news-k">Exploited · added ${fmtDate(f.added)}${f.ransomware ? ' <span class="badge claimed">used by ransomware</span>' : ''}</p>
      <h3 class="news-t">${esc(f.title)}</h3>
      <p class="news-why"><b>Why it’s here:</b> ${esc(f.who)}</p>
      <p class="news-a">${esc(f.about)}</p>
      <p class="news-fix"><b>Fix:</b> ${esc(f.fix)}</p>
      <a class="news-l" href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.cve)} ${arrow}</a>
    </article>`).join('') || '<p class="fine">A quiet stretch: nothing big enough to list.</p>';
}
