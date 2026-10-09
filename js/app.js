/* ===== Render loop ===== */

const PROVIDER_VIEWS = ['req', 'jobs', 'earn', 'avail'];
const ADMIN_VIEWS = ['dash', 'prov', 'book', 'set'];
const TITLES = { shop: 'Home services at your door', cart: 'Your cart', bookings: 'My bookings', login: 'Log in', signup: 'Sign up', forgot: 'Reset password', preg: 'Become a provider' };

function draw() {
  // Signed out but holding a staff role (e.g. after a data reset): fall back to customer
  if (S.role !== 'customer' && !S.user) { S.role = 'customer'; S.view = 'shop'; }
  // Provider account whose record no longer exists
  if (S.role === 'provider' && !pv(S.pid)) { S.user = null; S.role = 'customer'; S.view = 'login'; }
  if (S.role === 'provider' && !PROVIDER_VIEWS.includes(S.view) && !AUTH_VIEWS.includes(S.view)) S.view = 'req';
  if (S.role === 'admin' && !ADMIN_VIEWS.includes(S.view) && !AUTH_VIEWS.includes(S.view)) S.view = 'dash';

  const isAuth = AUTH_VIEWS.includes(S.view);
  document.body.classList.toggle('auth-screen', isAuth);
  nav();

  let html;
  if (isAuth) html = auth();
  else if (S.view.startsWith('page:')) html = infoPage(S.view.slice(5));
  else if (S.role === 'customer') html = ({ shop, cart, bookings }[S.view] || shop)();
  else if (S.role === 'provider') html = provider();
  else html = admin();

  document.getElementById('app').innerHTML = html;
  document.title = 'HomeServe – ' + (TITLES[S.view] || 'Home services');
}

// Enter key submits auth forms
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('.auth-panel input:not([type=checkbox])')) {
    const b = document.querySelector('.auth-primary');
    if (b) b.click();
  }
});

draw();
