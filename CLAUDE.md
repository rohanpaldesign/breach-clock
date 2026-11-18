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

## v3: cards and pages
- The home page (`index.html`) is a grid of cards; each opens its own page: `live.html`,
  `clock.html`, `named.html`, `scale.html`, `how.html`, `sources.html`.
- Pages are GENERATED. Edit `partials/<page>.html` or the shell in `scripts/build_pages.py`, then
  run `python scripts/build_pages.py`. `app.js` loads only the current page's module
  (`body[data-page]`).
- Layout: cards meet edge to edge (no gaps) with a big radius, so the page colour (`--page`)
  shows only at the corners. Cards use `--bg`. Content lives on cards, never on the page colour.
- Live (`live.js`): DDoS attacks between countries at the real average pace. Rate per route =
  (5,343 an hour ÷ 60) × source share × target share. The rate comes from the Cloudflare H1 2026
  report; the shares come from Cloudflare Radar's application-layer DDoS top 20 for 7 days, kept in
  `LIVE` in `data.js`. Refresh the shares by reading the Radar page (no API token is needed for
  the page). Arrival times are simulated (Poisson); say so.
- Globes share `globe-core.js` (palette cached, render loop pauses off screen or in hidden tabs).
- "Since you opened this page" uses a sessionStorage start time, so it carries across pages.

## v4: Latest updates itself
- `latest.html` + `latest.js` read `data/latest.json`. `.github/workflows/update.yml` runs
  `scripts/update_latest.py` daily at 06:00 UTC, commits only when the data changed, then asks Pages
  to rebuild. Sources: HIBP breach list (CC BY 4.0) and CISA KEV (public domain), no keys.
- Curation rules are constants at the top of the script: verified HIBP breaches of at least 100,000
  accounts from the last 120 days, KEV entries from the last 30 days, 12 each.
- The header nav is only Latest / Sources / About (`NAV` in build_pages.py); other pages are reached
  from the home cards.
- On the record stays still until a country or a route is picked (they are past events).
- Not automated: the yearly report figures in `data.js` (IC3, ITRC, APWG, Chainalysis, Cloudflare).

## v5
- Restart: `restartSession()` in clock.js fires `breachclock:restart`. The home meter card has a
  restart button; on the clock page, clicking "Since you arrived" again restarts.
- Latest filter (scripts/update_latest.py): breaches must be verified, happened within 2 years,
  surfaced in 180 days, and have 1M+ accounts or 250K+ with sensitive data. Flaws (30 days) must be
  used by ransomware or be in COMMON_VENDORS software. 6 each, each with a "why it's here" line.
- Spot the con (`tricks.html`, `tricks.js`): the four buttons (Rush, Rank, Reward, Rattle), nine
  tricks with tappable tells in mock messages, a cheat sheet and a quiz. Fictional brands only.
