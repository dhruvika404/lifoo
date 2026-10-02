export const customers = Array.from({ length: 24 }, (_, i) => ({
  id: `CUS-${1000 + i}`,
  name: ["Aarav Sharma","Diya Patel","Ishaan Kumar","Aanya Singh","Vivaan Mehta","Saanvi Reddy","Kabir Joshi","Myra Iyer","Arjun Gupta","Anika Rao"][i % 10],
  phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
  email: `user${i}@lifoo.in`,
  joined: `2025-0${(i % 9) + 1}-${10 + (i % 18)}`,
  orders: 3 + (i * 7) % 80,
  spend: 1200 + (i * 437) % 22000,
  wallet: (i * 53) % 1500,
  status: ["Active","Active","Active","Suspended","Active","Blocked"][i % 6],
}));

export const chefs = Array.from({ length: 18 }, (_, i) => ({
  id: `CHF-${500 + i}`,
  name: ["Meera's Kitchen","Raj Rasoi","Pooja Bakes","Spice Studio","Anna Daiva","Punjabi Tadka","Maharaja Mithai","Bhavna's Pickles","Coastal Catch","Mumbai Tiffin"][i % 10],
  owner: ["Meera S.","Raj K.","Pooja D.","Anil V.","Anna B.","Harman S.","Suresh M.","Bhavna P.","Faisal K.","Rita N."][i % 10],
  fssai: i % 4 === 0 ? "Pending" : "Verified",
  rating: (3.8 + (i % 12) * 0.1).toFixed(1),
  orders: 40 + (i * 17) % 600,
  earnings: 15000 + (i * 1234) % 180000,
  status: ["Active","Active","Suspended","Active","Inactive","Active"][i % 6],
  commission: 15 + (i % 4) * 2,
}));

export const products = Array.from({ length: 32 }, (_, i) => ({
  id: `PRD-${2000 + i}`,
  name: ["Kaju Katli","Masala Dosa","Aloo Paratha","Gulab Jamun","Mango Pickle","Garam Masala","Ghee 500g","Methi Khakra","Rasgulla","Bhel Puri","Cold Pressed Oil","Veg Biryani"][i % 12],
  chef: chefs[i % chefs.length].name,
  category: ["Sweets","Snacks & Bakery","Farsan","Dairy","Masalas","Oils & Ghee","Pickles","Ready To Cook","Drinks"][i % 9],
  price: 80 + (i * 37) % 900,
  status: ["Approved","Pending Approval","Approved","Draft","Live","Approved"][i % 6],
}));

export const categories = [
  { id: 1, name: "Sweets", products: 48, status: "Active" },
  { id: 2, name: "Snacks & Bakery", products: 72, status: "Active" },
  { id: 3, name: "Farsan", products: 31, status: "Active" },
  { id: 4, name: "Dairy", products: 19, status: "Active" },
  { id: 5, name: "Masalas", products: 27, status: "Active" },
  { id: 6, name: "Oils & Ghee", products: 14, status: "Active" },
  { id: 7, name: "Pickles", products: 22, status: "Active" },
  { id: 8, name: "Ready To Cook", products: 38, status: "Active" },
  { id: 9, name: "Drinks", products: 16, status: "Active" },
  { id: 10, name: "Beauty & Personal Care", products: 11, status: "Disabled" },
];

export const orders = Array.from({ length: 28 }, (_, i) => ({
  id: `ORD-${10000 + i}`,
  customer: customers[i % customers.length].name,
  chef: chefs[i % chefs.length].name,
  type: i % 3 === 0 ? "Instant" : "Pre-Order",
  amount: 220 + (i * 91) % 1800,
  status: ["Placed","Cooking","Out for Delivery","Delivered","Cancelled","Refunded"][i % 6],
  date: `2025-06-${10 + (i % 18)}`,
  city: ["Mumbai","Pune","Bengaluru","Delhi","Hyderabad","Ahmedabad"][i % 6],
}));

export const slots = Array.from({ length: 14 }, (_, i) => ({
  id: `SLT-${300 + i}`,
  chef: chefs[i % chefs.length].name,
  product: products[i % products.length].name,
  capacity: 20 + (i % 5) * 10,
  booked: 5 + (i * 3) % 40,
  cutoff: `2025-06-${15 + (i % 10)} ${10 + (i % 8)}:00`,
  status: ["Published","Cooking","Cutoff Reached","Completed","Draft","Closed"][i % 6],
}));

export const riders = Array.from({ length: 12 }, (_, i) => ({
  id: `RDR-${700 + i}`,
  name: ["Rohit M.","Salman A.","Vikas T.","Anil S.","Imran K.","Deepak R."][i % 6],
  phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
  zone: ["Andheri","Koramangala","HSR","Bandra","Powai","Indiranagar"][i % 6],
  eta: `${5 + (i % 25)} min`,
  status: ["Available","On Delivery","Returning","Offline"][i % 4],
}));

export const streams = Array.from({ length: 8 }, (_, i) => ({
  id: `STR-${i + 1}`,
  chef: chefs[i % chefs.length].name,
  order: orders[i % orders.length].id,
  viewers: 4 + (i * 11) % 80,
  start: `${10 + i}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60}`,
  health: i % 4 === 0 ? "Degraded" : "Healthy",
}));

export const refunds = Array.from({ length: 12 }, (_, i) => ({
  id: `RFD-${800 + i}`,
  order: orders[i % orders.length].id,
  customer: customers[i % customers.length].name,
  reason: ["Missing Item","Wrong Item","Damaged Packaging","Food Quality","Delivery Issue","Tamper Seal Issue"][i % 6],
  amount: 100 + (i * 73) % 900,
  status: ["Open","Under Review","Resolved","Closed"][i % 4],
}));

export const payouts = Array.from({ length: 10 }, (_, i) => ({
  id: `PAY-${900 + i}`,
  chef: chefs[i % chefs.length].name,
  amount: 8000 + (i * 1234) % 65000,
  period: `Jun ${1 + i * 3}-${3 + i * 3}, 2025`,
  status: ["Pending","Pending","Processed","On Hold"][i % 4],
}));

export const coupons = [
  { code: "WELCOME50", type: "Flat", value: "₹50", uses: 1240, expires: "2025-12-31", status: "Active" },
  { code: "DIWALI20", type: "Percentage", value: "20%", uses: 540, expires: "2025-11-15", status: "Active" },
  { code: "FIRST100", type: "First Order", value: "₹100", uses: 9820, expires: "2026-01-31", status: "Active" },
  { code: "SUMMER15", type: "Percentage", value: "15%", uses: 320, expires: "2025-06-01", status: "Expired" },
];

export const reviews = Array.from({ length: 14 }, (_, i) => ({
  id: `RVW-${600 + i}`,
  customer: customers[i % customers.length].name,
  chef: chefs[i % chefs.length].name,
  rating: 1 + (i % 5),
  text: ["Loved the food!","Delivery was late","Excellent packaging","Tasty but cold","Will order again","Wrong item delivered","Top notch quality"][i % 7],
  status: ["Pending","Approved","Pending","Rejected"][i % 4],
}));

export const tickets = Array.from({ length: 12 }, (_, i) => ({
  id: `TKT-${1100 + i}`,
  customer: customers[i % customers.length].name,
  category: ["Order","Delivery","Refund","Wallet","Account"][i % 5],
  priority: ["Low","Medium","High","Urgent"][i % 4],
  status: ["Open","In Progress","Resolved","Closed"][i % 4],
  created: `2025-06-${10 + (i % 18)}`,
}));

export const VerificationQueue = chefs.slice(0, 8).map((c, i) => ({
  ...c,
  submitted: `2025-06-${5 + i}`,
  documents: ["Aadhaar","PAN","Bank","Selfie","FSSAI","Agreement"],
  status: ["Pending","Pending","Pending","Pending"][i % 4],
}));

export const admins = [
  { name: "Anjali Verma", email: "anjali@lifoo.in", phone: "+91 98765 43210", role: "Super Admin", lastLogin: "2 min ago" },
  { name: "Rohit Sen", email: "rohit@lifoo.in", phone: "+91 98765 43211", role: "Operations Admin", lastLogin: "12 min ago" },
  { name: "Neha Kapoor", email: "neha@lifoo.in", phone: "+91 98765 43212", role: "Finance Admin", lastLogin: "1 hr ago" },
  { name: "Yash Patel", email: "yash@lifoo.in", phone: "+91 98765 43213", role: "Content Moderator", lastLogin: "3 hr ago" },
  { name: "Sara Khan", email: "sara@lifoo.in", phone: "+91 98765 43214", role: "Support Executive", lastLogin: "Yesterday" },
];

export const cities = [
  { name: "Mumbai", zones: 14, chefs: 84, status: "Active" },
  { name: "Pune", zones: 9, chefs: 47, status: "Active" },
  { name: "Bengaluru", zones: 12, chefs: 68, status: "Active" },
  { name: "Delhi", zones: 16, chefs: 91, status: "Active" },
  { name: "Hyderabad", zones: 8, chefs: 39, status: "Active" },
  { name: "Ahmedabad", zones: 6, chefs: 24, status: "Disabled" },
];

export const auditLogs = Array.from({ length: 20 }, (_, i) => ({
  time: `2025-06-17 ${10 + (i % 8)}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60}`,
  user: admins[i % admins.length].name,
  action: ["Approved Refund","Suspended Chef","Updated Commission","Created Coupon","Resolved Ticket","Edited Category","Issued Payout"][i % 7],
  module: ["Refunds","Chefs","Chefs","Coupons","Support","Categories","Finance"][i % 7],
  ip: `192.168.${i % 256}.${(i * 7) % 256}`,
}));

export const walletLedger = Array.from({ length: 16 }, (_, i) => ({
  id: `WLT-${4000 + i}`,
  customer: customers[i % customers.length].name,
  type: ["Credit","Debit","Cashback","Refund","Gift Card"][i % 5],
  amount: (i % 2 === 0 ? "+" : "-") + "₹" + (50 + (i * 37) % 900),
  balance: "₹" + (200 + (i * 91) % 2400),
  date: `2025-06-${10 + (i % 18)}`,
}));

export const notifications = [
  { id: "NTF-01", title: "Diwali Discount Live", channel: "Push + SMS", audience: "All Customers", scheduled: "2025-10-20 10:00", status: "Scheduled" },
  { id: "NTF-02", title: "Chef Onboarding Drive", channel: "Email", audience: "Pending Chefs", scheduled: "2025-06-18 09:00", status: "Sent" },
  { id: "NTF-03", title: "Weekend Cashback", channel: "WhatsApp", audience: "Active Customers", scheduled: "2025-06-21 11:00", status: "Draft" },
  { id: "NTF-04", title: "App Update v2.4", channel: "Push", audience: "All Users", scheduled: "2025-06-19 18:00", status: "Failed" },
];
