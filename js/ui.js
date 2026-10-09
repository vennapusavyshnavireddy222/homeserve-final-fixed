/* ===== Small UI helpers: formatting, escaping, SVG icons ===== */

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => iso(new Date());
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const num = n => Number(n).toLocaleString('en-IN');
const fmtDate = d => new Date(d + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtSlot = s => { const h = +s.slice(0, 2); return `${h % 12 || 12}:${s.slice(3)} ${h < 12 ? 'AM' : 'PM'}`; };
const fmtDur = m => (m >= 60 ? `${Math.floor(m / 60)} hr${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`);

// Escape anything a user can type before putting it into innerHTML
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  clean: "<path d='m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z'/>",
  plumb: "<path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/>",
  elec: "<path d='M13 2 3 14h9l-1 8 10-12h-9l1-8z'/>",
  ac: "<path d='M2 12h20M12 2v20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1'/><path d='m9 4 3 2 3-2M9 20l3-2 3 2M4 9l2 3-2 3M20 9l-2 3 2 3'/>",
  appl: "<rect x='4' y='2' width='16' height='20' rx='2'/><circle cx='12' cy='13' r='5'/><path d='M8 6h.01M12 6h.01'/>",
  paint: "<rect x='3' y='3' width='14' height='6' rx='1'/><path d='M17 6h3v6h-8v3'/><rect x='10' y='15' width='4' height='6' rx='1'/>",
  pest: "<path d='m8 2 1.9 1.9M16 2l-1.9 1.9M9 7.1V6a3 3 0 0 1 6 0v1.1'/><path d='M12 20a6 6 0 0 1-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3a6 6 0 0 1-6 6z'/><path d='M12 20v-9M6.5 13H2M22 13h-4.5M3 21c0-2.1 1.7-3.9 3.8-4M21 21c0-2.1-1.7-3.9-3.8-4'/>",
  grid: "<rect x='3' y='3' width='7' height='7' rx='1'/><rect x='14' y='3' width='7' height='7' rx='1'/><rect x='3' y='14' width='7' height='7' rx='1'/><rect x='14' y='14' width='7' height='7' rx='1'/>",
  star: "<path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L8 14.2 3 9.3l6.9-1z' fill='currentColor'/>",
  check: "<path d='M20 6 9 17l-5-5'/>",
  shield: "<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/><path d='m9 12 2 2 4-4'/>",
  clock: "<circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/>",
  tag: "<path d='M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z'/><circle cx='7' cy='7' r='1.5'/>",
  user: "<circle cx='12' cy='8' r='4'/><path d='M4 21a8 8 0 0 1 16 0'/>",
  calendar: "<rect x='3' y='4' width='18' height='18' rx='2'/><path d='M16 2v4M8 2v4M3 10h18'/>",
  cart: "<circle cx='9' cy='20' r='1.5'/><circle cx='18' cy='20' r='1.5'/><path d='M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6'/>",
  home: "<path d='m3 11 9-8 9 8'/><path d='M5 10v10h14V10'/><path d='M10 20v-6h4v6'/>",
  pin: "<path d='M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z'/><circle cx='12' cy='10' r='3'/>",
  search: "<circle cx='11' cy='11' r='7'/><path d='m21 21-4.3-4.3'/>",
  mail: "<rect x='2' y='4' width='20' height='16' rx='2'/><path d='m22 7-10 6L2 7'/>",
  lock: "<rect x='4' y='11' width='16' height='10' rx='2'/><path d='M8 11V7a4 4 0 0 1 8 0v4'/>",
  eye: "<path d='M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z'/><circle cx='12' cy='12' r='3'/>",
  phone: "<path d='M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z'/>",
  arrow: "<path d='M5 12h14M13 6l6 6-6 6'/>",
  x: "<path d='M18 6 6 18M6 6l12 12'/>",
  wallet: "<path d='M20 7H5a2 2 0 0 1 0-4h13v4z'/><path d='M3 5v14a2 2 0 0 0 2 2h15V7'/><circle cx='16' cy='14' r='1'/>",
  plus: "<path d='M12 5v14M5 12h14'/>",
  minus: "<path d='M5 12h14'/>",
  trash: "<path d='M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6'/>",
  users: "<circle cx='9' cy='8' r='4'/><path d='M2 21a7 7 0 0 1 14 0'/><path d='M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7'/>",
  trend: "<path d='m3 17 6-6 4 4 8-8'/><path d='M15 7h6v6'/>",
  list: "<path d='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'/>",
  help: "<circle cx='12' cy='12' r='10'/><path d='M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01'/>",
};

const ic = (n, s = 20) =>
  `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const stars = n => `<span class="stars" aria-label="${n} out of 5">${ic('star', 14).repeat(n)}</span>`;
const badge = (text, tone = '') => `<span class="tag ${tone}">${text}</span>`;
const statusBadge = st => { const s = STATUS[st] || [st, '']; return badge(s[0], s[1]); };
