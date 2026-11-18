// Home: live numbers on the cards. Kept light: no canvases here.
import { odometer, perSecond, LOSSES, sessionElapsed, restartSession } from './clock.js';
import { BREACHES, LIVE } from './data.js';
import { fmtMoney, fmtRecords, fmtBig, esc } from './util.js';
import { loadLatest, ago } from './latest.js';

export function initHome() {
  document.getElementById('tileRate').textContent = Math.round(LIVE.perHour / 60);
  const set = odometer(document.getElementById('tileLoss'));
  const rate = perSecond(LOSSES);
  const tick = () => set(fmtMoney(rate * sessionElapsed()));
  tick();
  setInterval(() => { if (!document.hidden) tick(); }, 250);
  document.getElementById('tileRestart').addEventListener('click', () => {
    restartSession();
    tick();
    const el = document.getElementById('tileLoss');
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  });

  const real = BREACHES.filter((b) => b.status !== 'compiled');
  const total = real.reduce((s, b) => s + b.records, 0);
  document.getElementById('tileBreach').textContent = fmtRecords(total).replace(' billion', 'B').replace(' million', 'M');
  loadLatest().then((d) => {
    const items = [
      ...d.breaches.slice(0, 2).map((b) => ({ k: 'Breach', t: b.name, s: b.why, at: b.added })),
      ...d.flaws.slice(0, 2).map((f) => ({ k: f.ransomware ? 'Exploited flaw, ransomware' : 'Exploited flaw', t: f.title, s: f.who, at: f.added })),
    ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3);
    document.getElementById('tileNews').innerHTML = items.map((i) => `<li><span class="tn-k">${esc(i.k)}</span><span class="tn-t">${esc(i.t)}</span><span class="tn-s">${esc(i.s)}</span></li>`).join('');
    document.getElementById('tileNewsChecked').textContent = `Updated ${ago(d.checked)}.`;
  }).catch(() => { document.getElementById('tileNews').innerHTML = '<li class="fine">Open to see the latest.</li>'; });

  document.getElementById('tileBreachLine').textContent = `records exposed in the ${real.length} biggest breaches, drawn one dot per million.`;
}
