import { initClock } from './clock.js';
import { initScale } from './scale.js';
import { initWalkthroughs } from './walkthroughs.js';
import { initSources } from './sources.js';

// Theme: follows the system until the visitor picks one.
const root = document.documentElement;
try {
  const saved = localStorage.getItem('breachclock:theme');
  if (saved) root.dataset.theme = saved;
} catch {}
document.getElementById('themeBtn').addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('breachclock:theme', root.dataset.theme); } catch {}
  window.dispatchEvent(new Event('themechange'));
});
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => window.dispatchEvent(new Event('themechange')));

initClock();
initScale();
initWalkthroughs();
initSources();

// Chapters fade up as they arrive; the nav marks the one in view.
const chapters = [...document.querySelectorAll('.chapter')];
const navLinks = [...document.querySelectorAll('.nav a')];
for (const c of chapters.slice(1)) {
  for (const el of c.children) el.classList.add('reveal');
}
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) e.target.classList.add('in');
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
const navIo = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${e.target.id}`));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
chapters.forEach((c) => navIo.observe(c));
