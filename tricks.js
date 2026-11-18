// Spot the con: social engineering, taught by inspecting fake messages for their tells.
// Every brand, name, number and web address here is made up.
import { FACTS, COUNTERS } from './data.js';
import { esc, openSource, fmtBig } from './util.js';

const BUTTONS = {
  rush: { name: 'Rush', what: 'A deadline so you act before you think.', says: '“within 24 hours”, “right now”, “before it’s too late”' },
  rank: { name: 'Rank', what: 'Someone with authority, so you don’t question it.', says: '“the CEO”, “your bank”, “IT support”, “the police”' },
  reward: { name: 'Reward', what: 'Something you want: money, a prize, a peek.', says: '“refund due”, “guaranteed returns”, “Salaries 2026.xlsx”' },
  rattle: { name: 'Rattle', what: 'Fear, so panic does the clicking.', says: '“account locked”, “virus detected”, “I’m in trouble”' },
};

// Text in [[shown text|tellId]] becomes a tappable tell.
const TRICKS = [
  {
    id: 'phish', name: 'Phishing email', short: 'The fake login page',
    mock: { type: 'email', from: '[[Mail Admin <support@mailbox-quota-center.net>|from]]', subject: '[[Final notice: your mailbox is 99% full|rush]]',
      body: ['Dear [[user|generic]],', 'Your mailbox has exceeded its storage limit. Incoming messages will be [[deleted in 24 hours|rush]].', 'To keep your emails, verify your account below:', '[[Keep my emails → mailbox-quota-center.net/verify|link]]'] },
    tells: {
      from: 'The sender’s address isn’t your email provider or your workplace. Display names are free to fake; the part after @ is what counts.',
      rush: 'A countdown. Real storage warnings don’t threaten to delete your mail in a day.',
      generic: '“Dear user”: they don’t know your name because they sent this to thousands of people.',
      link: 'The button leads to a lookalike site that asks for your password. Hover or long-press a link to see where it really goes.',
    },
    buttons: ['rush', 'rattle'],
    move: ['Don’t click. Open your email app or type the address you always use, and check storage there.', 'If you entered your password, change it now and turn on two-step login.'],
    hook: 'Login links in emails are guilty until proven innocent.',
    stat: { fact: 'phishQ2' },
  },
  {
    id: 'smish', name: 'Smishing', short: 'The text about a parcel',
    mock: { type: 'sms', from: '[[+1 (555) 014-2290|from]]', msgs: ['[[Parcelly|brand]]: Your parcel is on hold due to an unpaid [[$1.99 redelivery fee|reward]]. Pay [[today|rush]] or it will be returned: [[parcelly-redelivery.top/pay|link]]'] },
    tells: {
      from: 'A random mobile number, not a short code or the company’s known sender name.',
      brand: 'Using a delivery brand works because almost everyone is expecting a parcel.',
      reward: 'A tiny fee makes it feel harmless. The real goal is your card number, not the $1.99.',
      rush: '“Today or it’s returned” is there to stop you checking.',
      link: 'An odd web address that isn’t the courier’s real site. Couriers tell you to use their app or website.',
    },
    buttons: ['rush', 'reward'],
    move: ['Delete it. Check delivery in the courier’s own app or site, typed in yourself.', 'Forward scam texts to your carrier’s spam number (7726 in the US and UK), then delete.'],
    hook: 'Couriers don’t charge by text.',
  },
  {
    id: 'voice', name: 'AI voice clone', short: 'The call from family',
    mock: { type: 'call', caller: '[[Unknown number|from]]', lines: [
      ['Caller', '[[Mum? It’s me. I’ve been in an accident, my phone’s broken|voice]], I’m using a friend’s.'],
      ['You', 'Oh no, are you okay? Where are you?'],
      ['Caller', 'I’m fine but I need [[$900 for the tow and the hospital right now|rush]]. [[Please don’t tell Dad|secret]], he’ll be furious.'],
      ['Caller', 'Can you send it to my friend’s account? [[I’ll text you the details|payment]].'],
    ] },
    tells: {
      from: 'A new number with a story about why. That’s the setup for “don’t call my real phone”.',
      voice: 'A few seconds of someone’s voice from social media is enough to clone it. Sounding like them proves nothing.',
      rush: 'Money needed this minute, so you don’t stop to check.',
      secret: 'Asking you to keep it secret cuts you off from the people who would spot it.',
      payment: 'Money to a “friend’s” account, gift cards or crypto is the giveaway: it can’t be pulled back.',
    },
    buttons: ['rattle', 'rush'],
    move: ['Hang up and call them back on the number you already have, or call someone who’s with them.', 'Agree a family safe word now, and ask for it in any emergency call.'],
    hook: 'Agree a family safe word. No word, no money.',
    stat: { fact: 'aiFraud' },
  },
  {
    id: 'bec', name: 'The boss scam', short: 'The urgent email from “the CEO”',
    mock: { type: 'email', from: '[[Dana Reyes (CEO) <dana.reyes.office@gmail.com>|from]]', subject: 'Quick favour',
      body: ['Are you at your desk? [[I’m in meetings all day and can’t take calls|nocall]].', 'I need you to process a [[payment to a new supplier today|rush]], it’s confidential until the deal is announced. [[Bank details attached, they changed banks last week|bank]].', '[[Don’t loop in finance on this one|secret]], I’ll explain later.', 'Sent from my phone'] },
    tells: {
      from: 'The CEO’s name, but a personal email address. Check the address, not the name.',
      nocall: '“Can’t take calls” blocks the one thing that would expose it: ringing them.',
      rush: 'Today, and confidential: urgency plus secrecy.',
      bank: 'New or changed bank details are the heart of the scam. The money goes to the attacker.',
      secret: 'Telling you to skip the usual approval is a red flag on its own.',
    },
    buttons: ['rank', 'rush'],
    move: ['Call the person on a number you already have before moving any money.', 'Any change of bank details gets confirmed by phone, every time.'],
    hook: 'Money requests get a phone call. Always.',
    stat: { fact: 'becLoss' },
  },
  {
    id: 'mfa', name: 'MFA fatigue', short: 'The login prompts that won’t stop',
    mock: { type: 'push', pushes: ['Flowdesk: Approve sign-in? [[Location: unknown|where]]', 'Flowdesk: Approve sign-in?', 'Flowdesk: Approve sign-in?', 'Flowdesk: Approve sign-in? [[11:52 PM|time]]'],
      chat: '[[Hi, this is IT. We’re fixing a sync issue on your account, just tap Approve to make the prompts stop.|it]]' },
    tells: {
      where: 'A sign-in you didn’t start, from somewhere you aren’t. Someone already has your password.',
      time: 'A flood of prompts late at night, hoping you’ll tap Approve just to make it stop.',
      it: 'The follow-up message from “IT” is the attacker. Real IT will never ask you to approve a login you didn’t make.',
    },
    buttons: ['rank', 'rattle'],
    move: ['Tap Deny, every time. Then change your password: they have it.', 'Tell your real IT team through a channel you already use.'],
    hook: 'If you didn’t try to log in, the answer is No.',
  },
  {
    id: 'qr', name: 'Quishing', short: 'The QR code on the parking meter',
    mock: { type: 'poster', title: 'PAY FOR PARKING', lines: ['[[Scan to pay, card machine out of order|sticker]]', '[[Pay within 10 minutes to avoid a fine|rush]]'], url: '[[citypark-payments.click|link]]' },
    tells: {
      sticker: 'A sticker on top of the real sign. Look for edges, bubbles or a code that doesn’t match the printed one.',
      rush: 'A fine threat, so you scan without looking.',
      link: 'Your camera shows the web address before you open it. This isn’t the city’s or the parking app’s site.',
    },
    buttons: ['rush', 'rattle'],
    move: ['Pay with the official parking app or the machine, not a code someone could have stuck on.', 'If you paid, call your bank and cancel the card.'],
    hook: 'Check the web address before you pay.',
  },
  {
    id: 'support', name: 'Fake tech support', short: 'The pop-up that says you’re infected',
    mock: { type: 'popup', title: '[[⚠ SECURITY ALERT: 3 viruses detected|scare]]', lines: ['Your files and banking details are at risk.', '[[Do not close this window|trap]] or your computer will be disabled.', 'Call Certified Support now: [[1-888-555-0147|phone]]'], foot: 'Then: “I’ll need you to install a [[remote access app|remote]] so I can clean it.”' },
    tells: {
      scare: 'A web page can’t scan your computer. This is an ad or a hijacked site pretending.',
      trap: 'Telling you not to close it is the trick. Closing the tab (or restarting) is exactly what you should do.',
      phone: 'Real security software never asks you to phone a number.',
      remote: 'Remote access hands them your screen, then your bank. This is how the money is taken.',
    },
    buttons: ['rattle', 'rank'],
    move: ['Close the tab or restart the browser. Nothing is infected by not calling.', 'Never install an app because a caller or pop-up asked you to.'],
    hook: 'Real support never calls you first, and never asks you to call.',
    stat: { fact: 'elderLoss' },
  },
  {
    id: 'pig', name: 'Pig butchering', short: 'The wrong number that becomes a friend',
    mock: { type: 'chat', who: 'Lena', lines: [
      ['Lena', '[[Hi Mark, is golf still on for Saturday?|wrong]]'],
      ['You', 'Sorry, wrong number!'],
      ['Lena', 'Oh, my mistake! You seem nice though 😊 Where are you based?'],
      ['', '· three weeks of friendly chat later ·'],
      ['Lena', 'My uncle showed me a crypto app, I made [[30% this month|reward]]. [[Start small, I’ll guide you|guide]].'],
      ['Lena', 'You can see your balance growing! To withdraw you just pay a [[small tax first|fee]].'],
    ] },
    tells: {
      wrong: 'The “wrong number” opener is scripted. It’s how they start thousands of chats.',
      reward: 'Big, steady returns are the bait. Real investments don’t promise 30% a month.',
      guide: 'They coach you onto their own app or site, where the balance is just numbers on a screen.',
      fee: 'A fee to withdraw is the end game. Pay it and there’s always another one.',
    },
    buttons: ['reward'],
    move: ['Never invest because someone you’ve only met online suggests it.', 'If you’re in deep, stop paying and report it. Fees to “unlock” money are part of the scam.'],
    hook: 'A stranger with a sure thing is the scam.',
    stat: { counter: 'crypto' },
  },
  {
    id: 'door', name: 'Tailgating and baiting', short: 'The held door and the found USB stick',
    mock: { type: 'scene', lines: [
      '[[A courier with full arms: “Could you get the door? My badge is in my bag.”|door]]',
      'Later, in the car park: [[a USB stick labelled “Salaries 2026”|usb]].',
      '[[A hi-vis vest and a clipboard: “Here to check the fire alarms.”|vest]]',
    ] },
    tells: {
      door: 'Being polite is the exploit. Busy hands make it awkward to say no.',
      usb: 'Curiosity is the bait. Plugging it in can install malware the moment it connects.',
      vest: 'Props buy trust. A uniform or a clipboard isn’t an ID.',
    },
    buttons: ['reward', 'rank'],
    move: ['Let reception or security handle people without a badge. It’s their job, not rudeness.', 'Hand found drives to IT, never plug them in.'],
    hook: 'Found drives go to IT, not into laptops.',
  },
];

const QUIZ = [
  { msg: 'Northbank: a payment of $849.00 to Tekshop was attempted. Not you? Call 0800 555 0199 now to cancel.', scam: true, why: 'Scam. The number is in the message. Your bank wants you to call the number on the back of your card.' },
  { msg: 'Your Flowdesk code is 482913. Don’t share it with anyone. We will never call to ask for it. (You just tried to log in.)', scam: false, why: 'Legit. You asked for it, and it warns you not to share it. Never read a code like this out to anyone.' },
  { msg: 'Jamie shared “Q3 bonus list.xlsx” with you. Sign in to view: flowdesk-docs.share-files.io', scam: true, why: 'Scam. A tempting file plus a sign-in page on a strange address: it’s after your password.' },
  { msg: 'Parcelly: your parcel arrives tomorrow, 9am to 12pm. Track it in the Parcelly app.', scam: false, why: 'Legit. No link, no payment, and it points you to the app you already have.' },
  { msg: 'Call: “This is the fraud team at your bank. To protect your account, read me the code we just texted you.”', scam: true, why: 'Scam. Nobody legitimate ever asks for a code. Reading it out lets them into your account.' },
];

function marked(s) {
  return esc(s).replace(/\[\[(.+?)\|([a-z]+)\]\]/g, (_, t, id) => `<button type="button" class="tell" data-t="${id}">${t}</button>`);
}

function mockHtml(m) {
  const M = marked;
  switch (m.type) {
    case 'email':
      return `<div class="mk mk-email"><div class="mk-row"><span>From</span><b>${M(m.from)}</b></div><div class="mk-row"><span>Subject</span><b>${M(m.subject)}</b></div><div class="mk-body">${m.body.map((p) => `<p>${M(p)}</p>`).join('')}</div></div>`;
    case 'sms':
      return `<div class="mk mk-phone"><p class="mk-top">${M(m.from)}</p>${m.msgs.map((x) => `<p class="mk-bubble in">${M(x)}</p>`).join('')}</div>`;
    case 'call':
      return `<div class="mk mk-phone mk-call"><p class="mk-top">Incoming call · ${M(m.caller)}</p>${m.lines.map(([w, t]) => `<p class="mk-line ${w === 'You' ? 'you' : ''}"><span>${esc(w)}</span>${M(t)}</p>`).join('')}</div>`;
    case 'chat':
      return `<div class="mk mk-phone"><p class="mk-top">${esc(m.who)}</p>${m.lines.map(([w, t]) => (w ? `<p class="mk-bubble ${w === 'You' ? 'out' : 'in'}">${M(t)}</p>` : `<p class="mk-gap">${esc(t)}</p>`)).join('')}</div>`;
    case 'push':
      return `<div class="mk mk-phone mk-lock"><p class="mk-clock">11:52</p>${m.pushes.map((x) => `<p class="mk-push">${M(x)}<span><i>Deny</i><i>Approve</i></span></p>`).join('')}<p class="mk-bubble in">${M(m.chat)}</p></div>`;
    case 'poster':
      return `<div class="mk mk-poster"><p class="mk-ptitle">${esc(m.title)}</p><div class="mk-qr" aria-hidden="true">${'<i></i>'.repeat(49)}</div>${m.lines.map((l) => `<p>${M(l)}</p>`).join('')}<p class="mk-url">Camera preview: ${M(m.url)}</p></div>`;
    case 'popup':
      return `<div class="mk mk-popup"><p class="mk-ptitle">${M(m.title)}</p>${m.lines.map((l) => `<p>${M(l)}</p>`).join('')}<p class="mk-foot">${M(m.foot)}</p></div>`;
    case 'scene':
      return `<div class="mk mk-scene">${m.lines.map((l) => `<p>${M(l)}</p>`).join('')}</div>`;
    default:
      return '';
  }
}

function statOf(st) {
  if (!st) return null;
  if (st.fact) {
    const f = FACTS[st.fact];
    return { v: f.value, l: `${f.label}, ${f.period}`, open: () => openSource({ title: f.label, value: f.value, sub: f.period, note: f.note, kind: f.kind, source: f.source }) };
  }
  const c = COUNTERS.find((x) => x.id === st.counter);
  const v = c.unit === 'usd' ? fmtBig(c.value, 'usd') : c.value.toLocaleString('en-US');
  return { v, l: `${c.label}, ${c.period}`, open: () => openSource({ title: c.short, value: v, sub: `${c.label}, ${c.period}`, note: c.note, kind: c.kind, source: c.source }) };
}

export function initTricks() {
  document.getElementById('conButtons').innerHTML = Object.entries(BUTTONS).map(([k, b]) => `
    <div class="btn4 b-${k}"><p class="btn4-n">${b.name}</p><p class="btn4-w">${b.what}</p><p class="btn4-s">${b.says}</p></div>`).join('');

  const tabs = document.getElementById('conTabs');
  tabs.innerHTML = TRICKS.map((t, i) => `<button type="button" class="tab" role="tab" data-i="${i}" aria-selected="${i === 0}"><b>${esc(t.name)}</b><span>${esc(t.short)}</span></button>`).join('');
  const mock = document.getElementById('conMock');
  const side = document.getElementById('conSide');
  let cur = 0;
  let found = new Set();

  function render() {
    const t = TRICKS[cur];
    found = new Set();
    mock.innerHTML = mockHtml(t.mock);
    const total = Object.keys(t.tells).length;
    const st = statOf(t.stat);
    side.innerHTML = `
      <p class="con-count mono"><span id="conFound">0</span> of ${total} tells found</p>
      <p class="fine con-hint">Tap anything in the message that looks off.</p>
      <ol class="con-tells" id="conTells"></ol>
      <button class="pill-btn" type="button" id="conReveal">Reveal all</button>
      <div class="con-block"><p class="gp-k">Buttons pressed</p><p>${t.buttons.map((b) => `<span class="btn-chip b-${b}">${BUTTONS[b].name}</span>`).join(' ')}</p></div>
      <div class="con-block"><p class="gp-k">Your move</p><ul class="con-move">${t.move.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>
      <blockquote class="con-hook">${esc(t.hook)}</blockquote>
      ${st ? `<button class="con-stat" type="button" id="conStat"><b>${esc(st.v)}</b> ${esc(st.l)}</button>` : ''}`;
    if (st) document.getElementById('conStat').addEventListener('click', st.open);
    document.getElementById('conReveal').addEventListener('click', () => Object.keys(t.tells).forEach(reveal));
  }
  function reveal(id) {
    const t = TRICKS[cur];
    mock.querySelectorAll(`.tell[data-t="${id}"]`).forEach((b) => b.classList.add('found'));
    if (found.has(id)) return;
    found.add(id);
    document.getElementById('conFound').textContent = found.size;
    const li = document.createElement('li');
    li.textContent = t.tells[id];
    document.getElementById('conTells').appendChild(li);
    if (found.size === Object.keys(t.tells).length) {
      document.getElementById('conReveal').hidden = true;
      side.querySelector('.con-count').classList.add('done');
    }
  }
  mock.addEventListener('click', (e) => {
    const b = e.target.closest('.tell');
    if (b) reveal(b.dataset.t);
  });
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    cur = Number(b.dataset.i);
    tabs.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    render();
  });
  render();

  document.getElementById('conCheat').innerHTML = `
    <div class="cheat-rule"><p class="gp-k">The one rule</p><p class="cheat-big">Stop. Step out. Check.</p><p class="fine">Stop before you act. Step out of the message: don’t use its links, numbers or reply button. Check through a channel you already trust.</p></div>
    <div class="cheat-btns">${Object.values(BUTTONS).map((b) => `<span>${b.name}</span>`).join('')}</div>
    <ol class="cheat-hooks">${TRICKS.map((t) => `<li><b>${esc(t.name)}</b> ${esc(t.hook)}</li>`).join('')}</ol>`;

  let score = 0;
  let answered = 0;
  const quiz = document.getElementById('conQuiz');
  quiz.innerHTML = QUIZ.map((q, i) => `
    <div class="quiz-q" data-q="${i}">
      <p class="quiz-m">${esc(q.msg)}</p>
      <p class="quiz-a"><button type="button" class="pill-btn" data-a="1">Scam</button><button type="button" class="pill-btn" data-a="0">Legit</button></p>
      <p class="quiz-why" hidden></p>
    </div>`).join('') + '<p class="quiz-score mono" id="quizScore" hidden></p>';
  quiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const box = b.closest('.quiz-q');
    if (box.classList.contains('done')) return;
    const q = QUIZ[Number(box.dataset.q)];
    const right = (b.dataset.a === '1') === q.scam;
    box.classList.add('done', right ? 'right' : 'wrong');
    b.classList.add('picked');
    const why = box.querySelector('.quiz-why');
    why.hidden = false;
    why.textContent = `${right ? 'Right. ' : 'Not quite. '}${q.why}`;
    answered++;
    if (right) score++;
    if (answered === QUIZ.length) {
      const s = document.getElementById('quizScore');
      s.hidden = false;
      s.textContent = `${score} of ${QUIZ.length}. ${score === QUIZ.length ? 'Nobody’s getting past you.' : 'Worth a second look at the tricks above.'}`;
    }
  });
}
