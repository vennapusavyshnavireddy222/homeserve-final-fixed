# HomeServe - home services marketplace (front-end prototype)

Open the folder in VS Code, install the **Live Server** extension, right-click `index.html` > Open with Live Server.
Or run: `npx serve .`

## Structure
- `index.html` page shell
- `css/styles.css` design tokens and styles
- `js/ui.js` icons, date/price formatting, HTML escaping
- `js/auth.js` mock login/signup/forgot password
- `js/data.js` categories, services, packages, coupons, seed providers
- `js/state.js` state, persistence (localStorage), notifications, provider eligibility, totals
- `js/customer.js` shop, cart, checkout, bookings, cancellation, ratings
- `js/provider.js` requests, job workflow, earnings, availability
- `js/admin.js` dashboard, provider verification, booking assignment, commission
- `js/app.js` navigation and render loop

## Next steps toward production
Backend (Node/Express + PostgreSQL + JWT), real auth and roles, payment gateway (Razorpay), invoices, chat (Socket.IO), support tickets, coupon and service management.

## Accounts
- Admin (owner): vyshu.admin@homeserve.in / HomeServe@Admin#26
- Customers sign up on the Sign up page; providers register via Become a provider and are verified by the admin.
- More admins can be added by an existing admin in Settings.
