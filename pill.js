// The small floating "lost since you opened this page" counter on every inner page.
import { odometer, perSecond, LOSSES, sessionElapsed } from './clock.js';
import { fmtMoney } from './util.js';

export function initPill() {
  const set = odometer(document.getElementById('floatNum'));
  const rate = perSecond(LOSSES);
  const tick = () => set(fmtMoney(rate * sessionElapsed()));
  tick();
  setInterval(() => { if (!document.hidden) tick(); }, 250);
}
