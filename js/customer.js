/* ===== Customer: shop, cart, checkout, bookings, cancellation, ratings, info pages ===== */

const PKSEL = {};                       // selected package per service on the listing
const CK = { area: S.area || AREAS[0], date: today(), slot: '', pid: null, pids: {}, pay: 'UPI', house: '' };
const PAYS = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash After Service'];

/* ---------- search ---------- */
let searchTimer;
function search(el) {
  S.q = el.value;
  const fromHeader = el.id === 'hq';
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    S.view = 'shop';
    draw();
    if (!fromHeader) {
      const n = document.querySelector('#app [data-search]');
      if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
    }
    syncSearch();
  }, 220);
}
function syncSearch() {
  const h = document.getElementById('hq');
  if (h && document.activeElement !== h) h.value = S.q;
}

/* ---------- listing ---------- */
function pick(id, i) { PKSEL[id] = i; draw(); }

function svcCard(s, c) {
  const k = PKSEL[s[0]] ?? 0, price = s[3] * PK[k][1];
  return `<article class="svc">
    <div class="svc-body">
      <h3>${s[2]}</h3>
      <div class="svc-meta"><span class="rate">${ic('star', 12)} ${s[5]}</span><span class="mut">${num(s[6])} reviews</span><i class="dot"></i><span class="mut">${ic('clock', 14)} ${fmtDur(s[4])}</span></div>
      <div class="price"><b>${inr(price)}</b><s>${inr(price * 1.25)}</s><span class="save">20% off</span></div>
      <p class="mut">${s[7]}</p>
      <div class="seg" role="radiogroup" aria-label="Package">${PK.map((p, i) =>
        `<button type="button" role="radio" aria-checked="${i === k}" class="${i === k ? 'on' : ''}" onclick="pick('${s[0]}',${i})">${p[0]}</button>`).join('')}</div>
      <div class="mut small">${PK[k][2]}</div>
    </div>
    <div class="svc-side"><div class="thumb tile" style="--h:${c[3]}">${ic(c[2], 46)}</div><button class="btn sm" onclick="add('${s[0]}')">${ic('plus', 16)} Add</button></div>
  </article>`;
}

function mini() {
  const t = totals();
  return `<aside class="side">
    <div class="card"><h3 class="card-h">${ic('cart', 18)} Your cart</h3>${S.cart.length
      ? S.cart.map(i => `<div class="row mini-row"><span>${sv(i.sid)[2]} <span class="mut">× ${i.q}</span></span><span>${inr(sv(i.sid)[3] * PK[i.pk][1] * i.q)}</span></div>`).join('') +
        `<div class="row total"><b>Total</b><b>${inr(t.tot)}</b></div><button class="btn block" onclick="go('cart')">Proceed to booking</button>`
      : '<p class="mut">No items yet. Add services to see them here.</p>'}</div>
    <div class="card help"><h3 class="card-h">${ic('phone', 18)} Need help?</h3><p class="mut">Talk to our experts for custom service packages.</p><button class="btn alt sm" onclick="toast('Call us on 1800-123-4567 (9 AM – 8 PM)')">Contact support</button></div>
  </aside>`;
}

function listing() {
  const q = S.q.toLowerCase().trim();
  const L = SV.filter(s => (S.cat === 'all' || s[1] === S.cat) &&
    (!q || (s[2] + ' ' + cat(s[1])[1] + (s[1] === 'pl' ? ' plumber' : '') + (s[1] === 'el' ? ' electrician' : '') + (s[1] === 'cl' ? ' cleaner maid' : '')).toLowerCase().includes(q)));
  const groups = CATS.filter(c => L.some(s => s[1] === c[0]));
  const searching = !!S.q || S.cat !== 'all';
  return `${searching ? `<div class="pagebar"><h1>${S.q ? 'Results for “' + esc(S.q) + '”' : cat(S.cat)[1]}</h1>
      <div class="searchbox">${ic('search', 18)}<input data-search placeholder="Search services, e.g. bathroom, plumber" value="${esc(S.q)}" oninput="search(this)" aria-label="Search services"></div></div>` : ''}
    <div class="catrow">
      <button class="catc ${S.cat === 'all' ? 'on' : ''}" style="--h:210" onclick="openCat('all')"><span class="tile">${ic('grid', 26)}</span>All</button>
      ${CATS.map(c => `<button class="catc ${S.cat === c[0] ? 'on' : ''}" style="--h:${c[3]}" onclick="openCat('${c[0]}')"><span class="tile">${ic(c[2], 26)}</span>${c[1]}</button>`).join('')}
    </div>
    <div class="layout"><div>${groups.length
      ? groups.map(c => `<h2 class="h2 sec">${c[1]}</h2>${L.filter(s => s[1] === c[0]).map(s => svcCard(s, c)).join('')}`).join('')
      : `<div class="card empty"><b>No services match “${esc(S.q)}”.</b><div class="mut">Try a broader word like “cleaning” or “AC”, or choose All.</div><button class="btn alt sm" onclick="S.q='';openCat('all')">Clear search</button></div>`}
    </div>${mini()}</div>`;
}

/* ---------- home page ---------- */
const RV = [
  ['Priya Sharma', 'Bathroom Cleaning', 5, 'Spotless tiles and the team arrived right on time. Price matched the app exactly.'],
  ['Karthik S', 'AC Service', 5, 'Technician explained the issue and fixed the cooling in under an hour.'],
  ['Meera Iyer', 'Deep Home Cleaning', 4, 'Thorough work on kitchen and balcony. Would book again for Diwali.'],
];
const FQ = [
  ['How are professionals verified?', 'Every professional submits ID and address proof and is approved by our team before receiving jobs.'],
  ['Can I cancel or reschedule?', 'Cancel free up to 24 hours before the slot. Later cancellations get a 50% refund.'],
  ['Is there a warranty?', 'Yes. Premium packages include a 30-day service warranty.'],
  ['How do I pay?', 'UPI, cards, net banking, wallet, or cash after service.'],
];

function homeTop() {
  const popular = ['s11', 's1', 's5', 's17'].map(sv);
  return `<section class="hero">
    <div class="hero-copy">
      <span class="pill">${ic('shield', 14)} Trusted by homes across Vijayawada</span>
      <h1>Professional home services, <span>at your doorstep</span></h1>
      <p>Book verified cleaners, plumbers, electricians and AC experts in minutes. Upfront prices, no haggling.</p>
      <div class="hsearch">
        <label class="hs-f">${ic('search', 18)}<input data-search placeholder="What service do you need?" oninput="search(this)" aria-label="Search services"></label>
        <label class="hs-f hs-loc">${ic('pin', 18)}<select aria-label="Area" onchange="setArea(this.value)">${AREAS.map(a => `<option ${a === S.area ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
        <button class="btn" onclick="document.getElementById('svc').scrollIntoView()">Search</button>
      </div>
      <div class="trust"><span>${ic('star', 15)} 4.8 average rating</span><span>${ic('shield', 15)} Verified professionals</span><span>${ic('tag', 15)} Transparent pricing</span></div>
    </div>
    <div class="hero-card"><h3>Popular right now</h3>${popular.map(s => `<button class="pop" onclick="add('${s[0]}')"><span class="tile" style="--h:${cat(s[1])[3]}">${ic(cat(s[1])[2], 20)}</span><span class="pop-t"><b>${s[2]}</b><small>${ic('star', 11)} ${s[5]} · from ${inr(s[3])}</small></span><span class="pop-add">${ic('plus', 16)}</span></button>`).join('')}</div>
  </section>
  <section><h2 class="h2 sec">Special offers</h2><div class="offers">
    ${Object.entries(COUP).map(([code, c], i) => `<button class="offer o${i + 1}" onclick="coupon('${code}')"><b>${c.label}</b><span>Code ${code} · up to ${inr(c.max)} · min order ${inr(c.min)}</span><em>Tap to apply</em></button>`).join('')}
    <div class="offer o3"><b>AC service from ₹599</b><span>Book before the winter rush</span></div></div></section>
  <h2 class="h2 sec" id="svc">Choose a category</h2>`;
}

function homeBottom() {
  const how = ['Choose a service', 'Pick date and time', 'Get a verified professional', 'Service completed', 'Rate your experience'];
  const why = [['shield', 'Verified professionals', 'ID and address checked'], ['tag', 'Transparent pricing', 'Pay what you see'], ['clock', 'Easy booking', 'Done in under two minutes'], ['wallet', 'Secure payments', 'UPI, cards or cash'], ['check', 'Service warranty', 'Up to 30 days'], ['phone', 'Customer support', 'Help when you need it']];
  return `<h2 class="h2 sec">How it works</h2><div class="how">${how.map((t, i) => `<div><i>${i + 1}</i><b>${t}</b></div>`).join('')}</div>
  <h2 class="h2 sec">Why choose HomeServe</h2><div class="why">${why.map(w => `<div><span class="tile">${ic(w[0], 22)}</span><b>${w[1]}</b><p class="mut">${w[2]}</p></div>`).join('')}</div>
  <h2 class="h2 sec">Customer reviews</h2><div class="grid">${RV.map(r => `<div class="card review"><div class="row"><div class="who"><span class="av">${r[0][0]}</span><b>${r[0]}</b></div>${stars(r[2])}</div><p>${r[3]}</p><span class="mut small">Booked: ${r[1]}</span></div>`).join('')}</div>
  <h2 class="h2 sec">Frequently asked questions</h2>${FQ.map(f => `<details><summary>${f[0]}</summary><p class="mut">${f[1]}</p></details>`).join('')}
  <div class="appbar"><div><h2>Get the HomeServe app</h2><p>Book faster and track your professional live.</p></div><button class="btn light" onclick="toast('App launching soon')">${ic('phone', 18)} Get it on Google Play</button></div>`;
}

function shop() {
  const home = S.cat === 'all' && !S.q;
  return (home ? homeTop() : '') + listing() + (home ? homeBottom() : '');
}

/* ---------- cart ---------- */
function add(id, buy) {
  const k = PKSEL[id] ?? 0, x = S.cart.find(i => i.sid === id && i.pk === k);
  x ? x.q++ : S.cart.push({ sid: id, pk: k, q: 1 });
  save();
  if (buy) return go('cart');
  toast(sv(id)[2] + ' added to cart');
  draw();
}
function qty(x, d) { S.cart[x].q += d; if (S.cart[x].q < 1) S.cart.splice(x, 1); save(); draw(); }
function removeItem(x) { S.cart.splice(x, 1); save(); draw(); }

function coupon(code) {
  const c = (code ?? document.getElementById('cp').value).toUpperCase().trim();
  if (!c) S.coupon = '';
  else if (!COUP[c]) return toast('Coupon not valid');
  else if (code && !S.cart.length) { S.coupon = c; save(); return toast(c + ' saved. It applies once your cart reaches ' + inr(COUP[c].min)); }
  else if (totals().sub < COUP[c].min) return toast('Minimum order ' + inr(COUP[c].min));
  else { S.coupon = c; toast(c + ' applied'); }
  save();
  if (S.view === 'cart') draw();
}

function cart() {
  if (!S.cart.length) return `<div class="card empty"><span class="tile big">${ic('cart', 34)}</span><b>Your cart is empty.</b><div class="mut">Browse services and add what you need.</div><button class="btn" onclick="go('shop')">Browse services</button></div>`;
  const t = totals();
  return `<h1 class="h1">Your cart</h1><div class="layout cartlay"><div>
    <div class="card">${S.cart.map((i, x) => `<div class="cart-item"><span class="tile" style="--h:${cat(sv(i.sid)[1])[3]}">${ic(cat(sv(i.sid)[1])[2], 22)}</span>
      <div class="ci-t"><b>${sv(i.sid)[2]}</b><div class="mut small">${PK[i.pk][0]} package · ${fmtDur(sv(i.sid)[4])}</div></div>
      <div class="qty"><button aria-label="Decrease" onclick="qty(${x},-1)">${ic('minus', 14)}</button><span>${i.q}</span><button aria-label="Increase" onclick="qty(${x},1)">${ic('plus', 14)}</button></div>
      <b class="ci-p">${inr(sv(i.sid)[3] * PK[i.pk][1] * i.q)}</b><button class="icon-btn" aria-label="Remove" onclick="removeItem(${x})">${ic('trash', 18)}</button></div>`).join('')}</div>
    <h2 class="h2">Schedule and pay</h2>${checkout()}</div>
    <aside class="side"><div class="card"><h3 class="card-h">${ic('tag', 18)} Bill details</h3>
      <div class="coupon"><input id="cp" placeholder="Coupon code (try WELCOME20)" value="${esc(S.coupon)}"><button class="btn alt sm" onclick="coupon()">Apply</button></div>
      <div class="row bill"><span>Item total</span><span>${inr(t.sub)}</span></div>
      ${t.d ? `<div class="row bill ok-t"><span>Coupon ${esc(S.coupon)}</span><span>−${inr(t.d)}</span></div>` : ''}
      <div class="row bill"><span>Service fee</span><span>${inr(t.fee)}</span></div>
      <div class="row bill"><span>GST 18%</span><span>${inr(t.tax)}</span></div>
      <div class="row total"><b>Grand total</b><b>${inr(t.tot)}</b></div></div></aside></div>`;
}

/* ---------- checkout ---------- */
// Find one distinct professional per category for this slot (keeps the user's picks where possible)
function pickProviders(cs, slot) {
  const lists = cs.map(c => elig(c, CK.area, CK.date, slot));
  const used = new Set(), out = {};
  const walk = i => {
    if (i === cs.length) return true;
    const c = cs[i];
    const L = [...lists[i]].sort((a, b) => (CK.pids[c] === b.id) - (CK.pids[c] === a.id));
    for (const p of L) {
      if (used.has(p.id)) continue;
      used.add(p.id); out[c] = p.id;
      if (walk(i + 1)) return true;
      used.delete(p.id);
    }
    return false;
  };
  return walk(0) ? out : null;
}

function checkout() {
  const cs = [...new Set(S.cart.map(i => sv(i.sid)[1]))];
  // If every slot today has already passed, start from tomorrow
  const start = SLOTS.every(s => slotPast(today(), s)) ? 1 : 0;
  if (CK.date < addDays(start)) CK.date = addDays(start);
  const free = s => !!pickProviders(cs, s);
  if (!CK.slot || !free(CK.slot)) CK.slot = SLOTS.find(free) || CK.slot || SLOTS[0];
  const asg = pickProviders(cs, CK.slot);
  CK.pids = asg || {};
  const days = [...Array(7)].map((_, i) => addDays(start + i));
  const pickers = cs.map(c => {
    const L = elig(c, CK.area, CK.date, CK.slot);
    return `<div class="fgroup"><span class="lbl">${cs.length > 1 ? cat(c)[1] + ' professional' : 'Available professionals'}</span>${L.length
      ? L.map(p => {
        const taken = Object.entries(CK.pids).some(([k, v]) => k !== c && v === p.id);
        return `<label class="pv ${p.id === CK.pids[c] ? 'on' : ''}" ${taken ? 'style="opacity:.5"' : ''}><input type="radio" name="pp_${c}" ${p.id === CK.pids[c] ? 'checked' : ''} ${taken ? 'disabled' : ''} onchange="CK.pids['${c}']=${p.id};draw()"><span class="av">${esc(p.name[0])}</span><span class="pv-t"><b>${esc(p.name)}</b><small>${ic('star', 12)} ${p.rating} · ${p.rc} jobs${taken ? ' · assigned to another service' : ''}</small></span>${badge('Verified', 'ok')}</label>`;
      }).join('')
      : `<div class="mut">No verified ${cat(c)[1].toLowerCase()} professional is free in ${CK.area} at this time. Try another day or area.</div>`}</div>`;
  }).join('');
  return `<div class="card checkout">
    ${cs.length > 1 ? `<div class="notice" style="margin:0">${ic('help', 18)} Your cart has ${cs.length} types of service. We'll create one booking for each, with its own professional, at the same date and time.</div>` : ''}
    <div class="fgroup"><label class="lbl">Area</label><select onchange="CK.area=this.value;draw()">${AREAS.map(a => `<option ${a === CK.area ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
    <div class="fgroup"><label class="lbl" for="hs">House / flat &amp; landmark</label><input id="hs" value="${esc(CK.house)}" oninput="CK.house=this.value" placeholder="Flat 402, Sai Residency, near Metro station"></div>
    <div class="fgroup"><span class="lbl">Date</span><div class="datestrip">${days.map(d => `<button type="button" class="${d === CK.date ? 'on' : ''}" onclick="CK.date='${d}';draw()"><small>${d === today() ? 'Today' : new Date(d + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short' })}</small><b>${+d.slice(8)}</b></button>`).join('')}</div></div>
    <div class="fgroup"><span class="lbl">Time slot</span><div class="slots">${SLOTS.map(s => `<button type="button" class="${s === CK.slot ? 'on' : ''}" ${free(s) ? '' : 'disabled'} onclick="CK.slot='${s}';draw()">${fmtSlot(s)}</button>`).join('')}</div></div>
    ${pickers}
    <div class="fgroup"><span class="lbl">Payment method</span><div class="slots pays">${PAYS.map(m => `<button type="button" class="${m === CK.pay ? 'on' : ''}" onclick="CK.pay='${m}';draw()">${m}</button>`).join('')}</div></div>
    <button class="btn lg block" ${asg ? '' : 'disabled'} onclick="place()">${CK.pay === 'Cash After Service' ? 'Confirm booking' : 'Pay ' + inr(totals().tot) + ' and confirm'}</button>
  </div>`;
}

function place() {
  if (!S.user) { S.next = 'cart'; toast('Log in to confirm your booking'); return go('login'); }
  if (S.user.role !== 'customer') return toast('Please use a customer account to book services');
  if (!CK.house.trim()) { document.getElementById('hs')?.focus(); return toast('Enter your house or flat number'); }
  const cs = [...new Set(S.cart.map(i => sv(i.sid)[1]))];
  if (cs.some(c => CK.pids[c] == null) || new Set(cs.map(c => CK.pids[c])).size !== cs.length) return toast('Choose a professional for each service');
  const t = totals(), me = 'c:' + S.user.email, ids = [];
  cs.forEach(c => {
    const items = S.cart.filter(i => sv(i.sid)[1] === c).map(x => ({ ...x }));
    const share = items.reduce((a, i) => a + sv(i.sid)[3] * PK[i.pk][1] * i.q, 0) / t.sub;
    const id = bookingId(today(), S.seq++), pid = CK.pids[c];
    ids.push(id);
    S.bookings.unshift({
      id, owner: S.user.email, cust: S.user.name, items, sid: items[0].sid, pk: items[0].pk,
      area: CK.area, house: CK.house.trim(), date: CK.date, slot: CK.slot, pid, st: 'ASSIGNED',
      base: t.base * share, amt: t.tot * share, pay: CK.pay === 'Cash After Service' ? 'PENDING' : 'SUCCESSFUL', rated: false,
    });
    note('p' + pid, `New request ${id} for ${fmtDate(CK.date)}, ${fmtSlot(CK.slot)}`);
    note('admin', `New booking ${id}`);
  });
  note(me, ids.length > 1 ? `${ids.length} bookings placed: ${ids.join(', ')}` : `Booking ${ids[0]} placed and ${pv(CK.pids[cs[0]]).name} assigned`);
  S.cart = []; S.coupon = ''; CK.house = ''; CK.pids = {};
  save(); go('bookings');
}

/* ---------- bookings ---------- */
function steps(b) {
  const k = STAGES.indexOf(b.st);
  return `<ol class="track">${STAGE_LABELS.map((s, i) => `<li class="${i <= k ? 'd' : ''}"><i>${i <= k ? ic('check', 12) : ''}</i><span>${s}</span></li>`).join('')}</ol>`;
}
const bookingItems = b => (b.items || [{ sid: b.sid, pk: b.pk, q: 1 }]).map(i => `${sv(i.sid)[2]} · ${PK[i.pk][0]}${i.q > 1 ? ' × ' + i.q : ''}`).join(', ');

function bookings() {
  const L = S.user ? S.bookings.filter(b => b.owner === S.user.email) : [];
  return `<h1 class="h1">My bookings</h1>` + (L.length ? L.map(b => {
    const p = b.pid != null ? pv(b.pid) : null;
    const cancellable = ['PLACED', 'ASSIGNED', 'ACCEPTED', 'REJECTED'].includes(b.st);
    return `<div class="card booking">
      <div class="row"><b>${esc(bookingItems(b))}</b>${statusBadge(b.st)}</div>
      <div class="mut small">${b.id} · ${fmtDate(b.date)}, ${fmtSlot(b.slot)} · ${esc(b.house)}, ${b.area}</div>
      <div class="bk-meta"><span>${ic('user', 15)} ${p && b.st !== 'REJECTED' ? esc(p.name) + ' ★' + p.rating : 'Being assigned'}</span><span>${ic('wallet', 15)} ${inr(b.amt)} · ${b.pay.charAt(0) + b.pay.slice(1).toLowerCase()}</span></div>
      ${['CANCELLED'].includes(b.st) ? '' : steps(b)}
      <div class="actions">${cancellable ? `<button class="btn bad sm" onclick="cancel('${b.id}')">Cancel booking</button>` : ''}
      ${b.st === 'DONE' ? `<button class="btn sm" onclick="confirmDone('${b.id}')">Confirm completion</button>` : ''}
      ${b.st === 'COMPLETED' && !b.rated ? `<span class="mut small">Rate your professional:</span>${[1, 2, 3, 4, 5].map(n => `<button class="rate-btn" aria-label="${n} stars" onclick="rate('${b.id}',${n})">${n}${ic('star', 13)}</button>`).join('')}` : ''}</div></div>`;
  }).join('') : `<div class="card empty"><span class="tile big">${ic('calendar', 34)}</span><b>No bookings yet.</b><div class="mut">Your confirmed services will show here with live status.</div><button class="btn" onclick="go('shop')">Book a service</button></div>`)
    + (S.user ? noteList('c:' + S.user.email) : '');
}

function cancel(id) {
  const b = S.bookings.find(x => x.id === id);
  const h = (new Date(b.date + 'T' + b.slot) - new Date()) / 36e5, pct = h >= 24 ? 100 : 50;
  if (!confirm(`Cancel this booking? You will get a ${pct}% refund (${h >= 24 ? 'more' : 'less'} than 24 hours before the slot).`)) return;
  b.st = 'CANCELLED';
  if (b.pay === 'SUCCESSFUL') { b.pay = 'REFUNDED'; b.refund = b.amt * pct / 100; }
  note('c:' + b.owner, b.refund ? `Cancelled. Refund of ${inr(b.refund)} processed` : 'Booking cancelled');
  note('p' + b.pid, `${id} was cancelled`);
  note('admin', `${id} was cancelled by the customer`);
  save(); draw();
}
function confirmDone(id) {
  const b = S.bookings.find(x => x.id === id);
  b.st = 'COMPLETED';
  if (b.pay === 'PENDING') b.pay = 'SUCCESSFUL';
  note('c:' + b.owner, 'Service confirmed. Please rate your professional');
  note('p' + b.pid, `Earnings credited for ${id}`);
  save(); draw();
}
function rate(id, n) {
  const b = S.bookings.find(x => x.id === id), p = pv(b.pid);
  p.rating = Math.round((p.rating * p.rc + n) / (p.rc + 1) * 100) / 100; p.rc++; b.rated = true;
  toast('Thanks for your review'); save(); draw();
}

/* ---------- info pages (footer links) ---------- */
const PAGES = {
  about: ['About HomeServe', 'HomeServe connects busy households in Vijayawada with background-verified cleaners, plumbers, electricians and technicians. Every professional is ID-checked, trained and rated by customers after each job, so you always know who is coming to your door and what it will cost.'],
  contact: ['Contact us', 'Call 1800-123-4567 (9 AM – 8 PM, every day) or write to support@homeserve.in. Please keep your booking ID handy so we can help faster.'],
  help: ['Help centre', 'Booking, rescheduling, payments, invoices and warranty claims: reach us through Contact us and quote your booking ID. Most queries are answered within two hours.'],
  cancel: ['Cancellation policy', 'Cancel free of charge up to 24 hours before your slot and get a 100% refund. Cancellations within 24 hours of the slot receive a 50% refund. Refunds return to the original payment method in 3–5 working days.'],
  refund: ['Refund policy', 'If a service is not completed as agreed, raise a request within 48 hours and we will redo the work or refund the amount. Spare parts bought separately are non-refundable once fitted.'],
  terms: ['Terms of use', 'By booking on HomeServe you agree to provide accurate address details, ensure safe access for the professional and pay the amount shown at checkout. HomeServe may suspend accounts that misuse the platform.'],
  privacy: ['Privacy policy', 'We collect only what is needed to deliver your booking: name, mobile, email and address. We never sell your data, and share it with the assigned professional only for the duration of the job.'],
};
function infoPage(k) {
  const p = PAGES[k] || PAGES.about;
  return `<div class="card prose"><h1 class="h1">${p[0]}</h1><p>${p[1]}</p><button class="btn alt sm" onclick="go('shop')">${ic('arrow', 16)} Back to services</button></div>`;
}
