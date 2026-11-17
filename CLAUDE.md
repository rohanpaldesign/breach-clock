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

## Who attacks whom (v2)
- `globe.js` draws an orthographic globe on canvas with `d3-geo@3.1.1` and `topojson-client@3.1.0`
  (jsdelivr `+esm`) and `world-atlas@2.0.2` country shapes. Arcs are named attacker country to
  target country; rings are domestic. Red means a state or state-linked actor in at least half
  the pair's incidents, amber means everyone else.
- Data: `data/flows.json`, built by `python scripts/build_flows.py` (standard library only) from
  the EuRepoC dyadic dataset (v1.3.2, CC BY-NC 4.0, doi:10.5281/zenodo.14965395), with country
  centre points from world-countries. Each pair keeps one `[year, type, stateLinked]` entry per
  incident, so the filters are exact. Incidents with no named attacker are counted on the target
  only (`unattributed`), never drawn as arcs.
- Refresh: rerun the script when EuRepoC publishes a new version and update the URL in it.
- Page order: globe hero, Scale, Live counters, How it happens, Sources. The floating pill
  (`#floatLive`) shares the losses counter in `clock.js` and tucks away while the big number is
  on screen.
