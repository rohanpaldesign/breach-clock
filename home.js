// Home: live numbers on the cards. Kept light: no canvases here.
import { odometer, perSecond, LOSSES, sessionElapsed } from './clock.js';
import { BREACHES, LIVE } from './data.js';
import { fmtMoney, fmtRecords } from './util.js';

export function initHome() {
  document.getElementById('tileRate').textContent = Math.round(LIVE.perHour / 60);
  const set = odometer(document.getElementById('tileLoss'));
  const rate = perSecond(LOSSES);
  const tick = () => set(fmtMoney(rate * sessionElapsed()));
  tick();
  setInterval(() => { if (!document.hidden) tick(); }, 250);

  const real = BREACHES.filter((b) => b.status !== 'compiled');
  const total = real.reduce((s, b) => s + b.records, 0);
  document.getElementById('tileBreach').textContent = fmtRecords(total).replace(' billion', 'B').replace(' million', 'M');
  document.getElementById('tileBreachLine').textContent = `records exposed in the ${real.length} biggest breaches, drawn one dot per million.`;
}
