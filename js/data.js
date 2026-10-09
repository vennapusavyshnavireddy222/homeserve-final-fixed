/* ===== Static data: categories, services, packages, coupons, seed providers ===== */

const AREAS = ['Benz Circle', 'Labbipet', 'Patamata', 'Governorpet', 'Gunadala'];
const SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

// [id, name, icon, hue]
const CATS = [
  ['cl', 'Cleaning', 'clean', 200],
  ['pl', 'Plumbing', 'plumb', 215],
  ['el', 'Electrical', 'elec', 40],
  ['ac', 'AC Services', 'ac', 185],
  ['ap', 'Appliance Repair', 'appl', 265],
  ['pa', 'Painting', 'paint', 20],
  ['pe', 'Pest Control', 'pest', 150],
];

// [id, category, name, price, minutes, rating, reviews, description]
const SV = [
  ['s1', 'cl', 'Bathroom Cleaning', 499, 60, 4.8, 2310, 'Scrub, descale and sanitise tiles, fittings and floor'],
  ['s2', 'cl', 'Deep Home Cleaning', 2499, 300, 4.7, 1480, 'Top-to-bottom cleaning of a 2BHK with machines'],
  ['s3', 'cl', 'Sofa Cleaning', 699, 75, 4.6, 980, 'Shampoo and vacuum extraction for a 5-seater sofa'],
  ['s4', 'cl', 'Kitchen Cleaning', 899, 120, 4.7, 1120, 'Degrease hob, cabinets, tiles and sink'],
  ['s5', 'pl', 'Tap Repair', 199, 30, 4.5, 860, 'Fix drips and replace washers or cartridges'],
  ['s6', 'pl', 'Leakage Repair', 449, 60, 4.6, 640, 'Trace and seal pipe or wall leakage'],
  ['s7', 'pl', 'Drain Cleaning', 399, 45, 4.4, 520, 'Unblock kitchen and bathroom drains'],
  ['s8', 'el', 'Fan Installation', 249, 30, 4.7, 1320, 'Install a ceiling fan with wiring check'],
  ['s9', 'el', 'Switch & Socket Repair', 149, 30, 4.6, 910, 'Replace faulty switches and sockets'],
  ['s10', 'el', 'Electrical Inspection', 349, 60, 4.5, 300, 'Safety check of wiring and MCB'],
  ['s11', 'ac', 'AC Service', 599, 60, 4.8, 3400, 'Jet-pump service for split or window AC'],
  ['s12', 'ac', 'AC Gas Refill', 2199, 90, 4.5, 780, 'Leak test and full gas top-up'],
  ['s13', 'ac', 'AC Installation', 1499, 120, 4.6, 610, 'Wall mount, piping and test run'],
  ['s14', 'ap', 'Washing Machine Repair', 399, 60, 4.5, 720, 'Diagnosis and repair, spare parts extra'],
  ['s15', 'ap', 'Refrigerator Repair', 449, 60, 4.4, 540, 'Cooling, door seal and compressor checks'],
  ['s16', 'pa', 'Room Painting', 4999, 480, 4.6, 260, 'Two-coat emulsion for one room'],
  ['s17', 'pe', 'Cockroach Control', 799, 60, 4.7, 1500, 'Gel and spray treatment, 90-day warranty'],
  ['s18', 'pe', 'Termite Control', 1999, 120, 4.6, 430, 'Drill-and-inject anti-termite treatment'],
];

// [name, price multiplier, description]
const PK = [
  ['Basic', 1, 'Core service'],
  ['Standard', 1.5, 'Core service + extra areas / cover'],
  ['Premium', 2.2, 'Full scope + 30-day warranty'],
];

const COUP = {
  WELCOME20: { p: 20, max: 300, min: 399, label: '20% off your first booking' },
  WEEKEND10: { p: 10, max: 200, min: 299, label: 'Weekend 10% off' },
};

// [name, categories, areas, status, rating, jobs]
const PR = [
  ['Ramesh Kumar', ['cl', 'pl'], ['Benz Circle', 'Labbipet', 'Patamata'], 'VERIFIED', 4.8, 212],
  ['Sunita Devi', ['cl'], ['Labbipet', 'Governorpet'], 'VERIFIED', 4.9, 340],
  ['Imran Shaikh', ['el', 'ac', 'ap'], ['Benz Circle', 'Patamata', 'Gunadala'], 'VERIFIED', 4.7, 180],
  ['Venkat Rao', ['pl', 'el'], ['Governorpet', 'Gunadala', 'Labbipet'], 'VERIFIED', 4.6, 150],
  ['Lakshmi Prasad', ['pe', 'pa'], AREAS, 'VERIFIED', 4.5, 95],
  ['Arjun Reddy', ['ac', 'ap'], ['Benz Circle', 'Labbipet'], 'VERIFIED', 4.6, 128],
  ['Farhan Ali', ['cl', 'pe'], ['Patamata', 'Benz Circle'], 'PENDING', 0, 0],
  ['Mohan Das', ['el'], ['Labbipet'], 'SUSPENDED', 3.9, 40],
];

const STAGES = ['PLACED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'STARTED', 'DONE', 'COMPLETED'];
const STAGE_LABELS = ['Placed', 'Assigned', 'Accepted', 'On the way', 'Arrived', 'Started', 'Finished', 'Confirmed'];

// Customer-facing status text and badge colour
const STATUS = {
  PLACED: ['Placed', 'info'],
  ASSIGNED: ['Awaiting provider', 'info'],
  ACCEPTED: ['Confirmed', 'info'],
  ON_THE_WAY: ['On the way', 'info'],
  ARRIVED: ['Arrived', 'info'],
  STARTED: ['In progress', 'info'],
  DONE: ['Confirm completion', 'warn'],
  COMPLETED: ['Completed', 'ok'],
  CANCELLED: ['Cancelled', 'bad'],
  REJECTED: ['Reassigning', 'warn'],
};

const NAMES = ['Priya Sharma', 'Rahul Verma', 'Anjali Nair', 'Karthik S', 'Meera Iyer', 'Sanjay Gupta'];
