// How it happens: five attacks as step-by-step SVG animations.
import { FACTS } from './data.js';
import { esc, openSource, reducedMotion } from './util.js';

const W = 164;
const H = 60;
const G = {
  attacker: 'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21c1-4 4-6 8-6s7 2 8 6',
  person: 'M12 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM5 20c1-3.5 3.6-5 7-5s6 1.5 7 5',
  server: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
  network: 'M12 3v5M5 16v-3h14v3M12 8v5M3 16h4v5H3zM10 16h4v5h-4zM17 16h4v5h-4z',
  db: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  leak: 'M6 3h9l3 3v15H6zM9 11h6M9 15h4M15 3v3h3',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  login: 'M4 4h16v16H4zM8 10h8M8 14h5',
  key: 'M8 15a4 4 0 1 1 3.5-6L21 9v3h-2v2h-2v2h-3l-2.5-2.5',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  backup: 'M4 6h16v4H4zM4 14h16v4H4zM8 8h.01M8 16h.01M12 2v2M12 20v2',
  files: 'M4 7h6l2 2h8v10H4z',
  bank: 'M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18',
  money: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z',
  tower: 'M12 10v11M8 21h8M5 5a10 10 0 0 0 0 10M19 5a10 10 0 0 1 0 10M8 7a5 5 0 0 0 0 6M16 7a5 5 0 0 1 0 6',
  phone: 'M8 2h8v20H8zM11 18h2',
  social: 'M5 5h14v10H9l-4 4z',
  alert: 'M12 3l10 18H2zM12 10v5M12 18h.01',
};

const SCENARIOS = [
  {
    id: 'flaw',
    title: 'Exploited flaw',
    sub: 'Now the most common way in',
    nodes: [
      { id: 'a', label: 'Attacker', x: 10, y: 170, g: 'attacker', attacker: true },
      { id: 's', label: 'Edge server', x: 318, y: 50, g: 'server' },
      { id: 'n', label: 'Internal network', x: 318, y: 290, g: 'network' },
      { id: 'd', label: 'Customer data', x: 620, y: 50, g: 'db' },
      { id: 'l', label: 'Leak site', x: 620, y: 290, g: 'leak' },
    ],
    steps: [
      { title: 'A flaw is announced', text: 'A vendor ships a fix for a serious flaw in its VPN or file-transfer software. The advisory also tells attackers exactly what to look for.', active: ['s'] },
      { title: 'Scanning the whole internet', edge: ['a', 's'], text: 'Automated scanners find every server still running the old version, often within hours.', active: ['a', 's'] },
      { title: 'Break in', edge: ['a', 's'], hit: ['s'], text: 'No password needed. The flaw itself lets them run commands on the server.' },
      { title: 'Move inside', edge: ['s', 'n'], hit: ['n'], text: 'The edge server is trusted by the internal network, so they walk straight in.' },
      { title: 'Take the data', edge: ['n', 'd'], hit: ['d'], text: 'They copy the customer database out, quietly, before anyone notices.' },
      { title: 'Extort', edge: ['d', 'l'], hit: ['l'], text: 'The data goes on a leak site with a deadline: pay, or it gets published.' },
      { title: 'Stop it here: patch fast', stop: ['a', 's'], text: 'Apply the fix in days, not weeks. Organizations took a median of 43 days to patch, while scanning starts within hours.' },
    ],
    stats: ['exploitShare', 'patchDays', 'breachCost'],
    fix: [
      ['Patch the edge first.', 'VPNs, firewalls and file-transfer tools within days of a fix.'],
      ['Know what you expose.', 'Keep a list of everything reachable from the internet.'],
      ['Assume the edge can fall.', 'Keep it walled off from the data that matters most.'],
    ],
  },
  {
    id: 'ransomware',
    title: 'Ransomware',
    sub: 'In almost half of all breaches',
    nodes: [
      { id: 'a', label: 'Ransomware gang', x: 10, y: 170, g: 'attacker', attacker: true },
      { id: 'r', label: 'Remote login', x: 318, y: 50, g: 'login' },
      { id: 'n', label: 'Network', x: 318, y: 290, g: 'network' },
      { id: 'b', label: 'Backups', x: 620, y: 50, g: 'backup' },
      { id: 'f', label: 'Files and systems', x: 620, y: 290, g: 'files' },
    ],
    steps: [
      { title: 'A stolen password', edge: ['a', 'r'], hit: ['r'], text: 'The gang buys a password stolen by malware, or uses a flaw, to reach a remote login page.' },
      { title: 'No second check', edge: ['r', 'n'], hit: ['n'], text: 'The login has no multi-factor authentication, so the password alone gets them in.' },
      { title: 'Find the backups', edge: ['n', 'b'], hit: ['b'], text: 'Before anything visible happens, they find the backups and delete them.' },
      { title: 'Steal a copy', edge: ['n', 'a'], text: 'They copy data out first, so they can threaten to publish it as well.' },
      { title: 'Lock everything', edge: ['n', 'f'], hit: ['f'], text: 'Then they encrypt files and systems at once, often overnight or on a weekend.' },
      { title: 'The demand', active: ['f'], text: 'A note demands crypto: pay to unlock, and pay again or the stolen copy is published. In 2025, 28% of victims paid.' },
      { title: 'Stop it here: a second factor', stop: ['r', 'n'], text: 'Multi-factor authentication on every remote login makes the stolen password useless. Offline backups are the safety net if that fails.' },
    ],
    stats: ['ransomShare', 'payRate', 'medianRansom'],
    fix: [
      ['A second factor on every remote login.', 'Especially VPNs and remote desktop.'],
      ['Backups they can’t reach.', 'Offline or locked copies, restored in a drill at least once.'],
      ['Patch remote-access tools.', 'They are the front door.'],
    ],
  },
  {
    id: 'phishing',
    title: 'Phishing',
    sub: 'A fake login steals a real one',
    nodes: [
      { id: 'a', label: 'Attacker', x: 10, y: 170, g: 'attacker', attacker: true },
      { id: 'm', label: 'Your inbox', x: 318, y: 50, g: 'mail' },
      { id: 'p', label: 'Fake login page', x: 318, y: 290, g: 'alert' },
      { id: 'r', label: 'Your real account', x: 620, y: 50, g: 'lock' },
      { id: 'x', label: 'Mail, files, contacts', x: 620, y: 290, g: 'files' },
    ],
    steps: [
      { title: 'The lure', edge: ['a', 'm'], active: ['m'], text: 'An email that looks like IT, your bank or a parcel service: "Your password expires today."' },
      { title: 'The click', edge: ['m', 'p'], active: ['p'], text: 'The link opens a perfect copy of a real login page, on a lookalike web address.' },
      { title: 'The capture', edge: ['p', 'a'], hit: ['p'], text: 'Whatever you type goes straight to the attacker, including the one-time code.' },
      { title: 'Signing in as you', edge: ['a', 'r'], hit: ['r'], text: 'They log in to the real account before the code expires.' },
      { title: 'Inside', edge: ['r', 'x'], hit: ['x'], text: 'Mail, files and contacts. Often the next phishing email goes out from your account.' },
      { title: 'Stop it here: a passkey', stop: ['p', 'a'], text: 'Passkeys and security keys only work on the real site, so a lookalike page has nothing to steal.' },
    ],
    stats: ['phishQ2', 'credShare'],
    fix: [
      ['Use passkeys where offered.', 'They can’t be typed into a fake page.'],
      ['Let a password manager fill logins.', 'If it won’t autofill, the site may not be real.'],
      ['Go there yourself.', 'Open the site from a bookmark, not the email link.'],
    ],
  },
  {
    id: 'bec',
    title: 'Business email scam',
    sub: '“Please note our new bank details”',
    nodes: [
      { id: 'a', label: 'Scammer', x: 10, y: 170, g: 'attacker', attacker: true },
      { id: 'v', label: 'Supplier’s email', x: 318, y: 50, g: 'mail' },
      { id: 'f', label: 'Finance team', x: 318, y: 290, g: 'person' },
      { id: 'k', label: 'Bank transfer', x: 620, y: 290, g: 'bank' },
      { id: 'm', label: 'Scammer’s account', x: 620, y: 50, g: 'money' },
    ],
    steps: [
      { title: 'Hijack or fake', edge: ['a', 'v'], hit: ['v'], text: 'The scammer takes over a supplier’s mailbox, or registers a lookalike domain.' },
      { title: 'A normal-looking email', edge: ['v', 'f'], active: ['f'], text: 'A reply in a real invoice thread: "Please note our new bank details for this payment."' },
      { title: 'The payment', edge: ['f', 'k'], active: ['k'], text: 'Finance updates the details and sends the next payment as usual.' },
      { title: 'Gone', edge: ['k', 'm'], hit: ['m'], text: 'The money lands in an account the scammer controls and is moved on within hours.' },
      { title: 'Stop it here: call back', stop: ['v', 'f'], text: 'Confirm any change of bank details by phone, on a number you already had, never one from the email.' },
    ],
    stats: ['becLoss', 'becWire'],
    fix: [
      ['Call back on a known number.', 'For any change of payment details.'],
      ['Two people approve.', 'No single person can change where money goes.'],
      ['Act fast if it happens.', 'Banks can sometimes recall a transfer in the first day.'],
    ],
  },
  {
    id: 'simswap',
    title: 'SIM swap',
    sub: 'Your number becomes their key',
    nodes: [
      { id: 'a', label: 'Attacker', x: 4, y: 170, g: 'attacker', attacker: true },
      { id: 'c', label: 'Phone carrier', x: 214, y: 50, g: 'tower' },
      { id: 'p', label: 'Your number', x: 214, y: 290, g: 'phone' },
      { id: 'e', label: 'Email account', x: 424, y: 170, g: 'mail' },
      { id: 'b', label: 'Bank', x: 632, y: 50, g: 'bank' },
      { id: 's', label: 'Social', x: 632, y: 290, g: 'social' },
    ],
    steps: [
      { title: 'Homework', active: ['a'], text: 'Your name, address and date of birth are already out there from old breaches.' },
      { title: 'The call', edge: ['a', 'c'], active: ['c'], text: 'The attacker calls your carrier pretending to be you, or bribes someone who works there.' },
      { title: 'Your number moves', edge: ['c', 'p'], hit: ['p'], text: 'Your number is moved to their SIM card. Your phone suddenly shows no signal.' },
      { title: 'Reset codes', edge: ['p', 'e'], hit: ['e'], text: 'They tap "forgot password", and the reset code arrives by text, on their phone.' },
      { title: 'The money', edge: ['e', 'b'], hit: ['b'], text: 'With your email, they reset everything linked to it, starting with money.' },
      { title: 'And the rest', edge: ['e', 's'], hit: ['s'], text: 'Then social accounts, often used to scam your friends next.' },
      { title: 'Stop it here: no codes by text', stop: ['p', 'e'], text: 'Use an authenticator app or a passkey instead of text messages, and set a port-out PIN with your carrier.' },
    ],
    stats: ['noticesYear', 'compromises'],
    fix: [
      ['Lock your number.', 'Ask your carrier for a port-out PIN or SIM lock.'],
      ['Move off text codes.', 'Authenticator app or passkey, starting with email and bank.'],
      ['Protect email most.', 'It can reset everything else.'],
    ],
  },
];

const center = (n) => [n.x + W / 2, n.y + H / 2];

// Where the line between two boxes leaves each box.
function trim(a, b) {
  const [ax, ay] = center(a);
  const [bx, by] = center(b);
  const dx = bx - ax;
  const dy = by - ay;
  const t = (n) => Math.min(Math.abs((W / 2 + 6) / (dx || 1e-9)), Math.abs((H / 2 + 6) / (dy || 1e-9)));
  const ta = t(a);
  return [ax + dx * ta, ay + dy * ta, bx - dx * ta, by - dy * ta];
}

export function initWalkthroughs() {
  const svg = document.getElementById('wtSvg');
  const tabs = document.getElementById('wtTabs');
  const scrub = document.getElementById('wtScrub');
  const playBtn = document.getElementById('wtPlay');
  const side = document.querySelector('.wt-side');
  const reduce = reducedMotion();
  let sc = SCENARIOS[0];
  let step = 0;
  let timer = null;
  let raf = 0;

  tabs.innerHTML = SCENARIOS.map((s, i) => `<button class="tab" type="button" role="tab" data-i="${i}" aria-selected="${i === 0}"><b>${esc(s.title)}</b>${esc(s.sub)}</button>`).join('');
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    tabs.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    load(SCENARIOS[Number(b.dataset.i)]);
  });
  document.getElementById('wtPrev').addEventListener('click', () => { stop(); go(step - 1); });
  document.getElementById('wtNext').addEventListener('click', () => { stop(); go(step + 1); });
  scrub.addEventListener('input', () => { stop(); go(Number(scrub.value), false); });
  playBtn.addEventListener('click', () => (timer ? stop() : play()));

  function load(s) {
    stop();
    sc = s;
    const byId = Object.fromEntries(s.nodes.map((n) => [n.id, n]));
    const edges = [];
    const seen = new Set();
    for (const st of s.steps) {
      const e = st.edge || st.stop;
      if (!e) continue;
      const k = e.join('>');
      const kr = [...e].reverse().join('>');
      if (seen.has(k) || seen.has(kr)) continue;
      seen.add(k);
      edges.push(e);
    }
    svg.innerHTML = `
      ${edges.map((e) => { const [x1, y1, x2, y2] = trim(byId[e[0]], byId[e[1]]); return `<line class="edge" data-e="${e.join('>')}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join('')}
      ${s.nodes.map((n) => `
        <g class="node${n.attacker ? ' attacker' : ''}" data-n="${n.id}" transform="translate(${n.x} ${n.y})">
          <rect width="${W}" height="${H}" rx="14"/>
          <g transform="translate(14 18)"><path class="glyph" d="${G[n.g]}"/></g>
          <text x="48" y="${H / 2 + 5}">${esc(n.label)}</text>
        </g>`).join('')}
      <circle class="packet" r="6" cx="-20" cy="-20"/>
      <g class="shield" visibility="hidden"><circle class="shield-ring" r="26"/><path d="M0 -15l12 5v7c0 8-5.5 12-12 15-6.5-3-12-7-12-15v-7z"/><path d="M-5 1l4 4 7-8" fill="none"/></g>`;
    scrub.max = String(s.steps.length - 1);
    document.getElementById('wtStats').innerHTML = s.stats.map((id) => {
      const f = FACTS[id];
      return `<button class="stat" type="button" data-fact="${id}"><span class="v">${esc(f.value)}</span><span class="l">${esc(f.label)}</span><span class="src-chip">${esc(f.period)} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></span></button>`;
    }).join('');
    document.getElementById('wtStats').querySelectorAll('[data-fact]').forEach((b) => b.addEventListener('click', () => {
      const f = FACTS[b.dataset.fact];
      openSource({ title: f.label, value: f.value, sub: f.period, note: f.note, kind: f.kind, source: f.source });
    }));
    document.getElementById('wtFix').innerHTML = s.fix.map(([b, t]) => `<li><b>${esc(b)}</b> ${esc(t)}</li>`).join('');
    go(0, false);
  }

  function go(i, animate = true) {
    i = Math.max(0, Math.min(sc.steps.length - 1, i));
    const forward = i === step + 1;
    step = i;
    scrub.value = String(i);
    const st = sc.steps[i];
    const hit = new Set();
    const done = new Set();
    for (let k = 0; k <= i; k++) {
      (sc.steps[k].hit || []).forEach((n) => hit.add(n));
      if (k < i && sc.steps[k].edge) done.add(key(sc.steps[k].edge));
    }
    const nowEdge = st.edge ? key(st.edge) : null;
    svg.querySelectorAll('.edge').forEach((el) => {
      el.classList.toggle('now', el.dataset.e === nowEdge);
      el.classList.toggle('done', done.has(el.dataset.e) && el.dataset.e !== nowEdge);
    });
    const active = new Set([...(st.active || []), ...(st.edge || [])]);
    svg.querySelectorAll('.node').forEach((el) => {
      el.classList.toggle('hit', hit.has(el.dataset.n));
      el.classList.toggle('active', active.has(el.dataset.n));
    });
    const shield = svg.querySelector('.shield');
    if (st.stop) {
      const el = svg.querySelector(`.edge[data-e="${key(st.stop)}"]`);
      const mx = (Number(el.getAttribute('x1')) + Number(el.getAttribute('x2'))) / 2;
      const my = (Number(el.getAttribute('y1')) + Number(el.getAttribute('y2'))) / 2;
      shield.setAttribute('transform', `translate(${mx} ${my})`);
      shield.setAttribute('visibility', 'visible');
      el.classList.add('now');
    } else shield.setAttribute('visibility', 'hidden');
    side.classList.toggle('stop', !!st.stop);
    document.getElementById('wtStepNo').textContent = st.stop ? 'The fix' : `Step ${i + 1} of ${sc.steps.filter((s) => !s.stop).length}`;
    document.getElementById('wtCaptionTitle').textContent = st.title;
    document.getElementById('wtCaption').textContent = st.text;
    movePacket(st.edge && animate && forward && !reduce ? svg.querySelector(`.edge[data-e="${key(st.edge)}"]`) : null);
  }

  // Edges are stored in one direction; find the element whichever way the step goes.
  function key(e) {
    const k = e.join('>');
    return svg.querySelector(`.edge[data-e="${k}"]`) ? k : [...e].reverse().join('>');
  }

  function movePacket(el) {
    cancelAnimationFrame(raf);
    const p = svg.querySelector('.packet');
    if (!el) { p.setAttribute('cx', -20); p.setAttribute('cy', -20); return; }
    let [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((a) => Number(el.getAttribute(a)));
    const st = sc.steps[step];
    if (el.dataset.e !== st.edge.join('>')) [x1, y1, x2, y2] = [x2, y2, x1, y1];
    const t0 = performance.now();
    const f = (now) => {
      const t = Math.min(1, (now - t0) / 900);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      p.setAttribute('cx', x1 + (x2 - x1) * e);
      p.setAttribute('cy', y1 + (y2 - y1) * e);
      if (t < 1) raf = requestAnimationFrame(f);
      else { p.setAttribute('cx', -20); p.setAttribute('cy', -20); }
    };
    raf = requestAnimationFrame(f);
  }

  function play() {
    if (step >= sc.steps.length - 1) go(0, false);
    playBtn.setAttribute('aria-pressed', 'true');
    playBtn.querySelector('span').textContent = 'Pause';
    timer = setInterval(() => {
      if (step >= sc.steps.length - 1) return stop();
      go(step + 1);
    }, 3200);
    if (step === 0) movePacket(sc.steps[0].edge ? svg.querySelector(`.edge[data-e="${key(sc.steps[0].edge)}"]`) : null);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.querySelector('span').textContent = 'Play';
  }

  load(sc);
  // Auto-play the first walk-through once, when it scrolls into view.
  let once = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !once && !reduce) { once = true; play(); }
  }, { threshold: 0.5 }).observe(svg);
}
