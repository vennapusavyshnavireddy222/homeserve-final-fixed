/* ===== App state, persistence, notifications, provider eligibility, totals ===== */

const KEY = 'hs3';
const bookingId = (d, n) => 'SRV-' + d.replace(/-/g, '') + '-' + String(n).padStart(5, '0');

function seedState() {
  const providers = PR.map((p, i) => ({
    id: i, name: p[0], cats: p[1], areas: p[2], st: p[3], rating: p[4], rc: p[5], on: true, max: 4, leave: '',
  }));
  const bookings = [];
  for (let i = 0; i < 12; i++) {
    const s = SV[(i * 5) % SV.length];
    const pool = providers.filter(p => p.st === 'VERIFIED' && p.cats.includes(s[1]));
    const p = pool[i % pool.length] || providers[0];
    const done = i % 4 !== 3, k = i % 3, base = s[3] * PK[k][1], d = addDays(-(i + 1));
    bookings.push({
      id: bookingId(d, 100 + i), owner: '', cust: NAMES[i % 6],
      items: [{ sid: s[0], pk: k, q: 1 }], sid: s[0], pk: k,
      area: AREAS[i % 5], house: '', date: d, slot: SLOTS[i % 5], pid: p.id,
      st: done ? 'COMPLETED' : 'CANCELLED', base, amt: (base + 49) * 1.18,
      pay: done ? 'SUCCESSFUL' : 'REFUNDED', rated: true,
    });
  }
  return {
    cart: [], bookings, seq: 125, comm: 15, notifs: [], role: 'customer', pid: 0,
    view: 'shop', cat: 'all', q: '', coupon: '', area: AREAS[0], user: null, next: null, providers,
  };
}

let S = null;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* storage blocked */ }
if (!S || !Array.isArray(S.providers)) S = seedState();

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
const sv = id => SV.find(s => s[0] === id);
const cat = id => CATS.find(c => c[0] === id);
const pv = id => S.providers[id];

/* ---- toast + notifications ---- */
function toast(t) {
  const e = document.getElementById('toast');
  e.textContent = t;
  e.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove('show'), 2800);
}

// Key that identifies whoever is looking at the screen right now
function viewer() {
  if (S.role === 'provider') return 'p' + S.pid;
  if (S.role === 'admin') return 'admin';
  return 'c:' + (S.user ? S.user.email : '');
}

// Only pop a toast if the notification is for the person currently using the app
function note(to, t) {
  S.notifs.unshift({ to, t, at: Date.now() });
  if (S.notifs.length > 200) S.notifs.length = 200;
  if (to === viewer()) toast(t);
}

/* ---- booking helpers ---- */
const live = b => !['CANCELLED', 'REJECTED'].includes(b.st);
const slotPast = (date, slot) => new Date(date + 'T' + slot) <= new Date();

// Verified, available providers for a category/area/date/slot (ex = booking id to ignore)
function elig(c, area, date, slot, ex) {
  if (slotPast(date, slot)) return [];
  return S.providers.filter(p =>
    p.st === 'VERIFIED' && p.on && p.cats.includes(c) && p.areas.includes(area) && p.leave !== date &&
    !S.bookings.some(b => b.pid === p.id && b.id !== ex && live(b) && b.date === date && b.slot === slot) &&
    S.bookings.filter(b => b.pid === p.id && b.date === date && live(b)).length < p.max);
}

function totals() {
  let sub = 0;
  S.cart.forEach(i => { sub += sv(i.sid)[3] * PK[i.pk][1] * i.q; });
  const c = COUP[S.coupon];
  const d = c && sub >= c.min ? Math.min(sub * c.p / 100, c.max) : 0;
  const fee = sub ? 49 : 0;
  const tax = (sub - d + fee) * 0.18;
  return { sub, d, fee, tax, tot: sub - d + fee + tax, base: sub - d };
}

/* ---- navigation ---- */
function go(v) {
  if (S.role === 'customer' && v === 'bookings' && !S.user) {
    S.next = 'bookings';
    toast('Log in to see your bookings');
    v = 'login';
  }
  if (v === 'forgot') FP.step = 1;
  S.view = v;
  save();
  draw();
  window.scrollTo(0, 0);
}

function openCat(id) { S.cat = id; S.q = ''; syncSearch(); go('shop'); }

function setArea(a) {
  S.area = a; CK.area = a; save();
  const h = document.getElementById('loc');
  if (h) h.value = a;
  draw();
}

function nav() {
  const m = {
    customer: [['shop', 'Services'], ['bookings', 'My bookings'], ['cart', 'Cart' + (S.cart.length ? ` <span class="cnt">${S.cart.length}</span>` : '')]],
    provider: [['req', 'Requests'], ['jobs', 'Jobs'], ['earn', 'Earnings'], ['avail', 'Availability']],
    admin: [['dash', 'Dashboard'], ['prov', 'Providers'], ['book', 'Bookings'], ['set', 'Settings']],
  }[S.role];
  document.getElementById('nav').innerHTML = m
    .map(t => `<button class="tab ${S.view === t[0] ? 'on' : ''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('');
  const b = document.getElementById('cartbadge');
  if (b) { b.textContent = S.cart.length; b.hidden = !S.cart.length; }
  authBar();
}

function noteList(to) {
  const n = S.notifs.filter(x => x.to === to).slice(0, 6);
  return `<h2 class="h2">Notifications</h2><div class="card notes">${n.length
    ? n.map(x => `<div class="note-row">${ic('check', 16)}<span>${esc(x.t)}</span></div>`).join('')
    : '<span class="mut">Nothing yet. Updates on bookings appear here.</span>'}</div>`;
}
