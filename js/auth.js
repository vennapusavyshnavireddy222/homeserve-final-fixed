/* ===== Mock auth (browser-only). Replace with a real API + JWT + hashed passwords on a server. ===== */

const AUTH_VIEWS = ['login', 'signup', 'forgot', 'preg'];
const FP = { step: 1, id: '' };
const USERS_KEY = 'hs_users3';
// The only built-in account: the business owner. Everyone else registers themselves.
const DEMO = {
  admin: ['vyshu.admin@homeserve.in', 'HomeServe@Admin#26'],
};

const U = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; } };
const setU = u => { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch (e) { /* ignore */ } };

async function sha(t) {
  if (window.crypto && crypto.subtle) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; for (const c of t) h = (h * 33 ^ c.charCodeAt(0)) >>> 0; return '' + h;
}

// Seed demo accounts once (promise so login waits for it)
const seeded = (async () => {
  const u = U();
  const seed = [
    { name: 'Admin', email: DEMO.admin[0], phone: '9000000003', pw: await sha(DEMO.admin[1]), role: 'admin', owner: true },
  ];
  let changed = false;
  for (const a of seed) if (!u.some(x => x.email === a.email)) { u.push(a); changed = true; }
  if (changed) setU(u);
})();

const $v = id => (document.getElementById(id)?.value || '').trim();
const EMAIL = v => /^\S+@\S+\.\S+$/.test(v);
const PHONE = v => /^[6-9]\d{9}$/.test(v);
const okId = v => EMAIL(v) || PHONE(v);

function authBar() {
  document.body.dataset.role = S.role;
  document.getElementById('auth').innerHTML = S.user
    ? `<span class="usr"><span class="av">${esc(S.user.name[0] || '?')}</span><span class="usr-t"><b>${esc(S.user.name)}</b><small>${S.user.role}</small></span></span><button class="btn alt sm" onclick="logout()">Log out</button>`
    : `<button class="btn alt sm" onclick="go('login')">Log in</button><button class="btn sm" onclick="go('signup')">Sign up</button>`;
}

function enter(u) {
  S.user = { name: u.name, role: u.role, email: u.email };
  S.role = u.role;
  if (u.role === 'provider') {
    // Provider record may be missing after a data reset: recreate it as pending
    if (!pv(u.pid)) {
      u.pid = S.providers.length;
      S.providers.push({ id: u.pid, name: u.name, cats: [], areas: [AREAS[0]], st: 'PENDING', rating: 0, rc: 0, on: true, max: 4, leave: '' });
    }
    S.pid = u.pid;
  }
  S.view = u.role === 'customer' ? (S.next || 'shop') : { provider: 'req', admin: 'dash' }[u.role];
  S.next = null;
  save();
  toast('Welcome, ' + u.name);
  draw();
  window.scrollTo(0, 0);
}

function logout() { S.user = null; S.role = 'customer'; S.view = 'shop'; save(); draw(); window.scrollTo(0, 0); }

async function doLogin() {
  await seeded;
  const id = $v('li').toLowerCase(), pw = document.getElementById('lp').value;
  if (!okId(id) || !pw) return toast('Enter a valid email or mobile and your password');
  const h = await sha(pw), u = U().find(x => (x.email === id || x.phone === id) && x.pw === h);
  u ? enter(u) : toast('Email/mobile or password is wrong');
}
// Returns the first problem with the form, in plain words (or '' if all good)
function formError(n, id, ph, pw) {
  if (n.length < 2) return 'Enter your full name';
  if (!EMAIL(id)) return 'Enter a valid email address, like name@gmail.com';
  if (!/^\d{10}$/.test(ph)) return 'Mobile number must be exactly 10 digits';
  if (!PHONE(ph)) return 'Enter a valid Indian mobile number (it starts with 6, 7, 8 or 9)';
  if (pw.length < 8) return 'Password must be at least 8 characters';
  return '';
}

async function doSignup() {
  const n = $v('sn'), id = $v('se').toLowerCase(), ph = $v('sp'), pw = document.getElementById('sw').value;
  const err = formError(n, id, ph, pw);
  if (err) return toast(err);
  if (U().some(x => x.email === id || x.phone === ph)) return toast('An account with this email or mobile already exists');
  const u = { name: n, email: id, phone: ph, pw: await sha(pw), role: 'customer' };
  setU([...U(), u]); enter(u);
}

async function doPreg() {
  const n = $v('pn'), id = $v('pe').toLowerCase(), ph = $v('pp'), pw = document.getElementById('pw').value;
  const cs = CATS.filter(c => document.getElementById('pc' + c[0])?.checked).map(c => c[0]);
  const err = formError(n, id, ph, pw) || (cs.length ? '' : 'Pick at least one service you offer');
  if (err) return toast(err);
  if (U().some(x => x.email === id || x.phone === ph)) return toast('An account with this email or mobile already exists');
  const pid = S.providers.length;
  S.providers.push({ id: pid, name: n, cats: cs, areas: [$v('pa')], st: 'PENDING', rating: 0, rc: 0, on: true, max: 4, leave: '' });
  const u = { name: n, email: id, phone: ph, pw: await sha(pw), role: 'provider', pid };
  setU([...U(), u]);
  enter(u);
  note('admin', 'New provider ' + n + ' awaits verification');
  save();
}

function doForgot() {
  const id = $v('fi').toLowerCase();
  if (!U().some(x => x.email === id || x.phone === id)) return toast('No account found for this email or mobile');
  FP.id = id; FP.step = 2;
  toast('Demo OTP: 123456');
  draw();
}
async function doReset() {
  const pw = document.getElementById('fw').value;
  if ($v('fo') !== '123456') return toast('OTP is incorrect');
  if (pw.length < 8) return toast('Use 8+ characters');
  const u = U(), x = u.find(a => a.email === FP.id || a.phone === FP.id);
  if (x) { x.pw = await sha(pw); setU(u); }
  FP.step = 1;
  toast('Password updated. Log in now');
  go('login');
}

/* ---------- views ---------- */
function field(id, label, icon, placeholder, type = 'text', extra = '') {
  const pwd = type === 'password';
  return `<div class="auth-field"><label for="${id}">${label}</label><div class="auth-input-wrap">${ic(icon, 18)}<input class="auth-input" id="${id}" type="${type}" placeholder="${placeholder}" ${extra}>${pwd ? `<button class="auth-eye" type="button" aria-label="Show or hide password" onclick="togglePw('${id}')">${ic('eye', 18)}</button>` : ''}</div></div>`;
}
function togglePw(id) { const el = document.getElementById(id); el.type = el.type === 'password' ? 'text' : 'password'; }
const alink = (v, t) => `<a class="auth-link" href="#" onclick="go('${v}');return false">${t}</a>`;

function authShell(inner) {
  return `<div class="auth-shell">
    <section class="auth-visual"><a class="auth-brand" href="#" onclick="go('shop');return false"><span class="logo-mark">${ic('home', 22)}</span>HomeServe</a>
      <div class="auth-copy"><div class="auth-kicker">YOUR HOME, OUR PRIORITY</div><h1>Trusted help.<span>Right at your door.</span></h1>
        <p>Book reliable professionals for plumbing, electrical, cleaning, repairs and more — all from one place.</p>
        <div class="auth-points"><div class="auth-point"><i>${ic('check', 12)}</i>Verified professionals</div><div class="auth-point"><i>${ic('star', 12)}</i>Top rated services</div><div class="auth-point"><i>${ic('lock', 12)}</i>Safe &amp; secure booking</div></div></div>
      <div class="auth-copy-bottom">© ${new Date().getFullYear()} HomeServe Home Services</div></section>
    <section class="auth-form-side"><div class="auth-panel">${inner}</div></section></div>`;
}

function auth() {
  if (S.view === 'login')
    return authShell(`<h1 class="auth-title">Welcome back</h1><p class="auth-subtitle">Sign in to continue to your account.</p>
      ${field('li', 'Email or mobile number', 'mail', 'you@example.com', 'text', 'autocomplete="username"')}
      ${field('lp', 'Password', 'lock', 'Enter your password', 'password', 'autocomplete="current-password"')}
      <div class="auth-options"><span></span>${alink('forgot', 'Forgot password?')}</div>
      <button class="btn auth-primary" onclick="doLogin()">Sign in ${ic('arrow', 18)}</button>
      <p class="auth-signup">New to HomeServe? ${alink('signup', 'Create an account')}</p>`);

  if (S.view === 'signup')
    return authShell(`<h1 class="auth-title">Create your account</h1><p class="auth-subtitle">Book trusted home services in minutes.</p>
      ${field('sn', 'Full name', 'user', 'Your name', 'text', 'autocomplete="name"')}
      ${field('se', 'Email address', 'mail', 'you@example.com', 'email', 'autocomplete="email"')}
      ${field('sp', 'Mobile number', 'phone', '10-digit mobile', 'tel', 'maxlength="10" inputmode="numeric" autocomplete="tel"')}
      ${field('sw', 'Password', 'lock', '8+ characters', 'password', 'autocomplete="new-password"')}
      <button class="btn auth-primary" onclick="doSignup()">Create account</button>
      <p class="auth-signup">Already registered? ${alink('login', 'Log in')}<br>Want to earn with us? ${alink('preg', 'Become a provider')}</p>`);

  if (S.view === 'preg')
    return authShell(`<h1 class="auth-title">Become a provider</h1><p class="auth-subtitle">Get jobs near you after a quick verification.</p>
      ${field('pn', 'Full name', 'user', 'Your name', 'text', 'autocomplete="name"')}
      ${field('pe', 'Email address', 'mail', 'you@example.com', 'email', 'autocomplete="email"')}
      ${field('pp', 'Mobile number', 'phone', '10-digit mobile', 'tel', 'maxlength="10" inputmode="numeric"')}
      ${field('pw', 'Password', 'lock', '8+ characters', 'password', 'autocomplete="new-password"')}
      <div class="auth-field"><label for="pa">Main area</label><select id="pa" class="auth-input plain">${AREAS.map(a => `<option>${a}</option>`).join('')}</select></div>
      <div class="auth-field"><label>Services you offer</label><div class="chips">${CATS.map(c => `<label class="chip"><input type="checkbox" id="pc${c[0]}"> ${c[1]}</label>`).join('')}</div></div>
      <button class="btn auth-primary" onclick="doPreg()">Submit for verification</button>
      <p class="auth-signup mut">You can receive bookings after an admin verifies you. ${alink('login', 'Back to log in')}</p>`);

  return authShell(FP.step === 1
    ? `<h1 class="auth-title">Reset password</h1><p class="auth-subtitle">We'll send a one-time code to verify it's you.</p>
       ${field('fi', 'Email or mobile number', 'mail', 'you@example.com')}
       <button class="btn auth-primary" onclick="doForgot()">Send OTP</button><p class="auth-signup">${alink('login', 'Back to log in')}</p>`
    : `<h1 class="auth-title">Enter OTP</h1><p class="auth-subtitle">We sent a code to ${esc(FP.id)}.</p>
       ${field('fo', 'One-time code', 'lock', '6-digit code', 'text', 'maxlength="6" inputmode="numeric"')}
       ${field('fw', 'New password', 'lock', '8+ characters', 'password', 'autocomplete="new-password"')}
       <button class="btn auth-primary" onclick="doReset()">Update password</button>`);
}
