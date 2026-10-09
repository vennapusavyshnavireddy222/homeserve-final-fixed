/* ===== Provider: requests, job workflow, earnings, availability ===== */

const earn = b => (b.base ?? b.amt / 1.18) * (1 - S.comm / 100);

function provider() {
  const p = pv(S.pid), me = S.bookings.filter(b => b.pid === p.id);
  const head = `<div class="who-bar"><span class="av lg">${esc(p.name[0])}</span><div><b>${esc(p.name)}</b><div class="mut small">Service provider · ${p.cats.map(c => cat(c)[1]).join(', ')}</div></div>${badge(p.st, p.st === 'VERIFIED' ? 'ok' : p.st === 'PENDING' ? 'warn' : 'bad')}</div>`;

  if (p.st !== 'VERIFIED')
    return head + `<div class="card empty"><b>You can't receive jobs yet.</b><div class="mut">Your account is ${p.st.toLowerCase()}. Bookings open once an admin verifies your documents.</div></div>`;

  if (S.view === 'req') {
    const L = me.filter(b => b.st === 'ASSIGNED');
    return head + `<h1 class="h1">Job requests</h1>` + (L.length ? L.map(b => `<div class="card req">
      <div class="row"><b>${esc(bookingItems(b))}</b><span class="tag info">${inr(earn(b))} earning</span></div>
      <div class="mut small">${fmtDate(b.date)}, ${fmtSlot(b.slot)} · ${esc(b.house)}, ${b.area} · ${esc(b.cust)}</div>
      <div class="actions"><button class="btn sm" onclick="pstep('${b.id}','ACCEPTED')">Accept</button><button class="btn bad sm" onclick="pstep('${b.id}','REJECTED')">Reject</button></div></div>`).join('')
      : `<div class="card empty"><b>No pending requests.</b><div class="mut">New bookings for your services and areas appear here.</div></div>`) + noteList('p' + p.id);
  }

  if (S.view === 'jobs') {
    const L = me.filter(b => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'STARTED', 'DONE'].includes(b.st));
    const nx = { ACCEPTED: ['ON_THE_WAY', 'Start travel'], ON_THE_WAY: ['ARRIVED', 'Mark arrived'], ARRIVED: ['STARTED', 'Start service'], STARTED: ['DONE', 'Complete service'] };
    return head + `<h1 class="h1">Active jobs</h1>` + (L.length ? L.map(b => `<div class="card req">
      <div class="row"><b>${esc(bookingItems(b))}</b>${statusBadge(b.st)}</div>
      <div class="mut small">${fmtDate(b.date)}, ${fmtSlot(b.slot)} · ${esc(b.house || '')}, ${b.area}</div>${steps(b)}
      <div class="actions">${nx[b.st] ? `<button class="btn sm" onclick="pstep('${b.id}','${nx[b.st][0]}')">${nx[b.st][1]}</button>` : '<span class="mut">Waiting for customer confirmation</span>'}</div></div>`).join('')
      : `<div class="card empty"><b>No active jobs.</b><div class="mut">Accept a request to see it here.</div></div>`);
  }

  if (S.view === 'earn') {
    const d = me.filter(b => b.st === 'COMPLETED'), g = d.reduce((a, b) => a + (b.base ?? b.amt / 1.18), 0), n = d.reduce((a, b) => a + earn(b), 0);
    return head + `<h1 class="h1">Earnings</h1><div class="grid stats">${[
      ['check', 'Completed jobs', d.length], ['trend', 'Gross service value', inr(g)], ['tag', `Platform commission (${S.comm}%)`, inr(g - n)], ['wallet', 'Net earnings', inr(n)],
    ].map(c => `<div class="card stat"><span class="tile">${ic(c[0], 20)}</span><span class="mut">${c[1]}</span><b>${c[2]}</b></div>`).join('')}</div>
    <div class="card notice">Earnings are credited only after the customer confirms completion. Your rating: ${ic('star', 14)} ${p.rating} (${p.rc} reviews)</div>`;
  }

  return head + `<h1 class="h1">Availability</h1><div class="card checkout">
    <label class="switch"><input type="checkbox" ${p.on ? 'checked' : ''} onchange="p_(${p.id},'on',this.checked)"><span></span> Available for new bookings</label>
    <div class="fgroup"><label class="lbl">Leave date</label><input type="date" min="${today()}" value="${p.leave}" onchange="p_(${p.id},'leave',this.value)"></div>
    <div class="fgroup"><label class="lbl">Max bookings per day</label><input type="number" min="1" max="8" value="${p.max}" onchange="p_(${p.id},'max',Math.min(8,Math.max(1,+this.value||1)))"></div>
    <div class="mut small">Areas: ${p.areas.join(', ')}. Double booking is blocked automatically.</div></div>`;
}

function p_(i, k, v) { pv(i)[k] = v; save(); toast('Availability updated'); }

function pstep(id, st) {
  const b = S.bookings.find(x => x.id === id);
  b.st = st;
  const m = { ACCEPTED: 'Provider accepted', ON_THE_WAY: 'Provider is on the way', ARRIVED: 'Provider arrived', STARTED: 'Service started', DONE: 'Service finished. Please confirm completion', REJECTED: 'Provider declined. We are finding another professional' }[st];
  note('c:' + b.owner, m + ' · ' + id);
  if (st === 'REJECTED') note('admin', id + ' rejected. Reassign needed');
  save(); draw();
}
