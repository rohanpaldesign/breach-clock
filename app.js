// Shared by every page: theme toggle, then only the code the current page needs.
const root = document.documentElement;
document.getElementById('themeBtn').addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('breachclock:theme', root.dataset.theme); } catch {}
  window.dispatchEvent(new Event('themechange'));
});
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => window.dispatchEvent(new Event('themechange')));

const page = document.body.dataset.page;
const loaders = {
  index: () => import('./home.js').then((m) => m.initHome()),
  live: () => import('./live.js').then((m) => m.initLive()),
  clock: () => import('./clock.js').then((m) => m.initClock()),
  named: () => import('./named.js').then((m) => m.initNamed()),
  scale: () => import('./scale.js').then((m) => m.initScale()),
  how: () => import('./walkthroughs.js').then((m) => m.initWalkthroughs()),
  sources: () => import('./sources.js').then((m) => m.initSources()),
};
loaders[page]?.();
if (document.getElementById('floatLive')) import('./pill.js').then((m) => m.initPill());
