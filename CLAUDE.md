# Breach Clock

Static site (plain HTML, CSS, ES modules; no build, no dependencies) on GitHub Pages:
https://rohanpaldesign.github.io/breach-clock/

Cybercrime made visible: live counters since you opened the page, the biggest breaches to scale
(one dot per million records), and animated walk-throughs of how common attacks unfold.

## Rules
- Every number on screen comes from `data.js`, and every entry there has a source URL and a type:
  measured, reported (second-hand), claimed (attacker's word) or compiled (old leaks re-packaged).
  Never add a figure without a source. Prefer the primary report over coverage.
- Data refresh is once a year: IC3 (April), DBIR (May), IBM (July), ITRC (January), Chainalysis
  (February), APWG (quarterly). Update `data.js` and the `ACCESSED` date.
- Inspired by dataclock.org but deliberately different: dark editorial, sentence case, streams and
  dot swarms instead of square grids. No em dashes in copy.
- Respect `prefers-reduced-motion` everywhere.

## Run locally
`python -m http.server 8000` then open http://localhost:8000. No installs.
