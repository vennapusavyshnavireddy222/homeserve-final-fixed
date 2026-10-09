/* ===== Admin: dashboard, provider verification, booking assignment, commission ===== */

function admin() {
  const B = S.bookings, done = B.filter(b => b.st === 'COMPLETED');
  const gross = done.reduce((a, b) => a + b.amt, 0);
  const net = done.reduce((a, b) => a + (b.base ?? b.amt / 1.18), 0);
  const com = net * S.comm / 100;

  if (S.view === 'dash') {
    const byC = CATS.map(c => [c[1], done.filter(b => sv(b.sid)[1] === c[0]).reduce((a, b) => a + b.amt, 0)]);
    const mx = Math.max(1, ...byC.map(x => x[1]));
    const cards = [
      ['list', 'Bookings', B.length], ['check', 'Completed', done.length], ['x', 'Cancelled', B.filter(b => b.st === 'CANCELLED').length],
      ['trend', 'Revenue', inr(gross)], ['wallet', 'Commission', inr(com)], ['users', 'Pending verification', S.providers.filter(p => p.st === 'PENDING').length],
    ];
    return `<h1 class="h1">Dashboard</h1><div class="grid stats">${cards.map(c => `<div class="card stat"><span class="tile">${ic(c[0], 20)}</span><span class="mut">${c[1]}</span><b>${c[2]}</b></div>`).join('')}</div>
      <h2 class="h2">Revenue by category</h2><div class="card">${byC.map(c => `<div class="barrow"><span>${c[0]}</span><div class="bartrack"><div class="bar" style="width:${c[1] / mx * 100}%"></div></div><b>${inr(c[1])}</b></div>`).join('')}</div>${noteList('admin')}`;
  }

  if (S.view === 'prov')
    return `<h1 class="h1">Providers</h1><div class="card tbl"><table><thead><tr><th>Provider</th><th>Services</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead><tbody>${S.providers.map(p => `<tr>
      <td><b>${esc(p.name)}</b></td><td>${p.cats.map(c => cat(c)[1]).join(', ')}</td><td>${p.rating ? '★ ' + p.rating : '–'}</td>
      <td>${badge(p.st, p.st === 'VERIFIED' ? 'ok' : p.st === 'PENDING' ? 'warn' : 'bad')}</td>
      <td class="acts">${p.st !== 'VERIFIED' ? `<button class="btn sm" onclick="ps(${p.id},'VERIFIED')">Verify</button>` : `<button class="btn bad sm" onclick="ps(${p.id},'SUSPENDED')">Suspend</button>`}
      ${p.st === 'PENDING' ? `<button class="btn alt sm" onclick="ps(${p.id},'REJECTED')">Reject</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;

  if (S.view === 'book') {
    const REASSIGNABLE = ['PLACED', 'ASSIGNED', 'ACCEPTED', 'REJECTED'];
    return `<h1 class="h1">Bookings</h1><div class="card tbl"><table><thead><tr><th>Booking</th><th>Service</th><th>When</th><th>Status</th><th>Payment</th><th>Provider</th></tr></thead><tbody>${B.map(b => {
      const c = elig(sv(b.sid)[1], b.area, b.date, b.slot, b.id);
      const cur = b.pid != null ? pv(b.pid).name : '';
      return `<tr><td><b>${b.id}</b><div class="mut small">${esc(b.cust)}</div></td><td>${esc(bookingItems(b))}</td><td>${fmtDate(b.date)}<div class="mut small">${fmtSlot(b.slot)}</div></td>
        <td>${statusBadge(b.st)}</td><td>${b.pay.charAt(0) + b.pay.slice(1).toLowerCase()}</td>
        <td>${REASSIGNABLE.includes(b.st)
          ? `<select aria-label="Assign provider" onchange="reassign('${b.id}',this.value)"><option value="">${b.st === 'REJECTED' ? 'Assign…' : esc(cur)}</option>${c.filter(p => p.id !== b.pid).map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>`
          : esc(cur)}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  const admins = U().filter(u => u.role === 'admin');
  return `<h1 class="h1">Settings</h1>
    <div class="card checkout"><div class="fgroup"><label class="lbl">Platform commission (% of pre-tax service value)</label>
      <input type="number" min="0" max="50" value="${S.comm}" onchange="S.comm=Math.min(50,Math.max(0,+this.value||0));save();toast('Commission set to '+S.comm+'%');draw()">
      <div class="mut small">Example: a ₹1,000 service at 15% pays the provider ₹850.</div></div></div>

    <h2 class="h2">Admin team</h2>
    <div class="card tbl"><table><thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th></th></tr></thead><tbody>${admins.map(u => `<tr>
      <td><b>${esc(u.name)}</b>${u.email === S.user.email ? ' <span class="mut small">(you)</span>' : ''}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td>
      <td>${isOwner(u) ? badge('Owner', 'info') : badge('Admin')}</td>
      <td class="acts">${isOwner(u) || u.email === S.user.email ? '' : `<button class="btn bad sm" onclick="removeAdmin('${esc(u.email)}')">Remove</button>`}</td></tr>`).join('')}</tbody></table></div>

    <h2 class="h2">Add a new admin</h2>
    <div class="card checkout">
      <div class="fgroup"><label class="lbl" for="an">Full name</label><input id="an" placeholder="Staff member name" autocomplete="off"></div>
      <div class="fgroup"><label class="lbl" for="ae">Email</label><input id="ae" type="email" placeholder="name@homeserve.in" autocomplete="off"></div>
      <div class="fgroup"><label class="lbl" for="ap">Mobile</label><input id="ap" type="tel" maxlength="10" placeholder="10-digit mobile" autocomplete="off"></div>
      <div class="fgroup"><label class="lbl" for="aw">Temporary password</label><input id="aw" type="password" placeholder="8+ characters" autocomplete="new-password"></div>
      <div><button class="btn" onclick="addAdmin()">Create admin account</button></div>
      <div class="mut small">Only existing admins can create admin accounts. There is no public admin signup.</div></div>

    <h2 class="h2">Danger zone</h2>
    <div class="card"><button class="btn alt sm" onclick="if(confirm('Reset all bookings and provider data?')){localStorage.removeItem('${KEY}');location.reload()}">Reset demo data</button></div>`;
}

const isOwner = u => u.owner || u.email === DEMO.admin[0];

async function addAdmin() {
  const n = $v('an'), id = $v('ae').toLowerCase(), ph = $v('ap'), pw = document.getElementById('aw').value;
  if (S.role !== 'admin') return;
  const err = formError(n, id, ph, pw);
  if (err) return toast(err);
  if (U().some(x => x.email === id || x.phone === ph)) return toast('An account with this email or mobile already exists');
  setU([...U(), { name: n, email: id, phone: ph, pw: await sha(pw), role: 'admin', addedBy: S.user.email }]);
  note('admin', `${n} was added as an admin by ${S.user.name}`);
  toast('Admin account created for ' + n);
  save(); draw();
}

function removeAdmin(email) {
  const u = U().find(x => x.email === email);
  if (!u || isOwner(u) || email === S.user.email) return toast('This admin cannot be removed');
  if (!confirm('Remove admin access for ' + u.name + '?')) return;
  setU(U().filter(x => x.email !== email));
  toast(u.name + ' removed');
  draw();
}

function ps(i, st) { pv(i).st = st; note('p' + i, 'Your account is now ' + st.toLowerCase()); save(); draw(); }

function reassign(id, pid) {
  if (!pid) return;
  const b = S.bookings.find(x => x.id === id);
  b.pid = +pid; b.st = 'ASSIGNED';
  note('p' + pid, 'New request ' + id);
  note('c:' + b.owner, 'Provider changed for ' + id);
  save(); draw();
}
