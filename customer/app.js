// ================================
// WASH & EAT – Customer App Logic
// ================================

// ---- DEFAULT DATA ----
// Default menu items (can be overridden by admin via localStorage)
const DEFAULT_FOOD_ITEMS = [
  { id: 'f1', name: 'Classic Burger', desc: 'Beef patty, lettuce, tomato, cheese', price: 89, icon: '🍔', cost: 35 },
  { id: 'f2', name: 'Crispy Fries', desc: 'Golden seasoned fries', price: 35, icon: '🍟', cost: 10 },
  { id: 'f3', name: 'Club Sandwich', desc: 'Chicken, veggies, toasted bread', price: 75, icon: '🥪', cost: 28 },
  { id: 'f4', name: 'Pizza Slice', desc: 'Tomato sauce, mozzarella, toppings', price: 55, icon: '🍕', cost: 20 },
  { id: 'f5', name: 'Cold Drinks', desc: 'Pepsi, 7Up, Mirinda (can)', price: 25, icon: '🥤', cost: 8 },
  { id: 'f6', name: 'Burger + Fries Combo', desc: 'Classic Burger & Fries together', price: 110, icon: '🍔🍟', cost: 42 },
];

const DEFAULT_WASH_SERVICES = [
  {
    id: 'w1', name: 'Basic Wash', price: 80,
    desc: 'Exterior hand wash and rinse',
    features: ['Exterior wash', 'Rinse & dry', '~15 minutes'],
    icon: '💧', cost: 25, popular: false
  },
  {
    id: 'w2', name: 'Full Wash', price: 150,
    desc: 'Complete exterior with wax coating',
    features: ['Exterior wash', 'Wax coating', 'Tire shine', '~30 minutes'],
    icon: '✨', cost: 50, popular: false
  },
  {
    id: 'w3', name: 'Interior Cleaning', price: 180,
    desc: 'Deep interior vacuum and wipe-down',
    features: ['Full vacuum', 'Dashboard wipe', 'Glass cleaning', '~45 minutes'],
    icon: '🧹', cost: 60, popular: true
  },
  {
    id: 'w4', name: 'Premium Package', price: 250,
    desc: 'Full wash + interior + free drink!',
    features: ['Everything included', 'Interior + Exterior', 'Free drink 🥤', '~60 minutes'],
    icon: '👑', cost: 80, popular: false
  },
];

// ---- STATE ----
let cart = []; // { id, name, price, qty, icon }
let currentBookingService = null;

// ---- INIT ----
window.addEventListener('DOMContentLoaded', () => {
  // Show loader then hide after 1.8s
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1800);

  // Load data (admin may have updated via localStorage)
  renderFoodMenu();
  renderCarWash();
  renderMathSection();
});

// ---- GET DATA (admin-editable) ----
function getFoodItems() {
  const stored = localStorage.getItem('we_food_items');
  return stored ? JSON.parse(stored) : DEFAULT_FOOD_ITEMS;
}

function getWashServices() {
  const stored = localStorage.getItem('we_wash_services');
  return stored ? JSON.parse(stored) : DEFAULT_WASH_SERVICES;
}

// ---- RENDER FOOD MENU ----
function renderFoodMenu() {
  const items = getFoodItems();
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'menu-card fade-up';
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="menu-card-img">${item.icon}</div>
      <div class="menu-card-body">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <div class="menu-card-footer">
          <div class="menu-card-price">EGP ${item.price}</div>
          <button class="add-btn" onclick="addToCart('${item.id}', '${escapeHTML(item.name)}', ${item.price}, '${item.icon}')">+</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---- RENDER CAR WASH ----
function renderCarWash() {
  const services = getWashServices();
  const grid = document.getElementById('wash-grid');
  grid.innerHTML = '';

  services.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = `wash-card fade-up${s.popular ? ' popular' : ''}`;
    card.style.animationDelay = `${i * 0.08}s`;
    const featuresHTML = s.features.map(f => `<li>${f}</li>`).join('');
    card.innerHTML = `
      ${s.popular ? '<span class="popular-badge">POPULAR</span>' : ''}
      <div class="wash-icon">${s.icon}</div>
      <div class="wash-name">${s.name}</div>
      <div class="wash-desc">${s.desc}</div>
      <ul class="wash-features">${featuresHTML}</ul>
      <div class="wash-footer">
        <div class="wash-price">EGP ${s.price}</div>
        <button class="btn btn-primary btn-sm" onclick="openBooking('${s.id}', '${escapeHTML(s.name)}', ${s.price})">Book Now</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---- RENDER MATH SECTION ----
function renderMathSection() {
  const foodItems = getFoodItems();
  const washServices = getWashServices();
  const allItems = [...foodItems, ...washServices];

  const grid = document.getElementById('math-grid');
  grid.innerHTML = '';

  let totalCost = 0;
  let totalRevenue = 0;

  allItems.forEach(item => {
    const profit = item.price - item.cost;
    const margin = ((profit / item.price) * 100).toFixed(0);
    totalCost += item.cost;
    totalRevenue += item.price;

    const card = document.createElement('div');
    card.className = 'math-card';
    card.innerHTML = `
      <div class="math-card-name">${item.icon || '📦'} ${item.name}</div>
      <div class="math-row"><span class="math-label">Cost Price</span><span class="math-val cost">EGP ${item.cost}</span></div>
      <div class="math-row"><span class="math-label">Selling Price</span><span class="math-val price">EGP ${item.price}</span></div>
      <div class="math-row"><span class="math-label">Profit</span><span class="math-val profit">EGP ${profit}</span></div>
      <div class="math-row"><span class="math-label">Margin %</span><span class="math-val profit">${margin}%</span></div>
    `;
    grid.appendChild(card);
  });

  const totalProfit = totalRevenue - totalCost;
  document.getElementById('totals-box').innerHTML = `
    <div class="total-stat">
      <div class="total-label">Total Revenue</div>
      <div class="total-value revenue">EGP ${totalRevenue}</div>
    </div>
    <div class="total-stat">
      <div class="total-label">Total Cost</div>
      <div class="total-value cost-total">EGP ${totalCost}</div>
    </div>
    <div class="total-stat">
      <div class="total-label">Total Profit</div>
      <div class="total-value profit-total">EGP ${totalProfit}</div>
    </div>
    <div class="total-stat">
      <div class="total-label">Avg. Margin</div>
      <div class="total-value profit-total">${((totalProfit / totalRevenue) * 100).toFixed(0)}%</div>
    </div>
  `;
}

// ---- CART LOGIC ----
function addToCart(id, name, price, icon) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, qty: 1, icon });
  }
  updateCartUI();
  showToast(`${icon} ${name} added to cart!`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCartUI();
}

function updateCartUI() {
  // Update count badge
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = totalQty;
  document.getElementById('cart-count-mobile').textContent = totalQty;

  // Render cart items
  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">🛒 Your cart is empty</div>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-icon">${item.icon}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">EGP ${item.price * item.qty}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  // Update total
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-total').textContent = `EGP ${total}`;
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

// ---- CHECKOUT ----
function checkout() {
  if (cart.length === 0) {
    showToast('❌ Cart is empty!');
    return;
  }

  // Save order to localStorage (admin can see)
  const order = {
    id: Date.now(),
    items: [...cart],
    total: cart.reduce((s, i) => s + i.price * i.qty, 0),
    date: new Date().toLocaleString(),
    type: 'food'
  };
  const orders = JSON.parse(localStorage.getItem('we_orders') || '[]');
  orders.push(order);
  localStorage.setItem('we_orders', JSON.stringify(orders));

  // Show receipt
  showReceipt(order);
  cart = [];
  updateCartUI();
  toggleCart();
}

function showReceipt(order) {
  const itemsHTML = order.items.map(i =>
    `<div class="receipt-item"><span>${i.icon} ${i.name} x${i.qty}</span><span>EGP ${i.price * i.qty}</span></div>`
  ).join('');
  document.getElementById('receipt-items').innerHTML = itemsHTML;
  document.getElementById('receipt-total').innerHTML = `Total: EGP ${order.total}`;
  document.getElementById('receipt-modal').classList.remove('hidden');
}

function closeReceipt() {
  document.getElementById('receipt-modal').classList.add('hidden');
}

// ---- BOOKING ----
function openBooking(id, name, price) {
  currentBookingService = { id, name, price };
  document.getElementById('booking-service-name').textContent = `${name} — EGP ${price}`;

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('booking-date').min = today;
  document.getElementById('booking-date').value = today;
  document.getElementById('booking-time').value = '10:00';

  document.getElementById('booking-modal').classList.remove('hidden');
}

function closeBooking() {
  document.getElementById('booking-modal').classList.add('hidden');
  currentBookingService = null;
}

function confirmBooking() {
  const name = document.getElementById('booking-name').value.trim();
  const phone = document.getElementById('booking-phone').value.trim();
  const date = document.getElementById('booking-date').value;
  const time = document.getElementById('booking-time').value;

  if (!name || !phone || !date || !time) {
    showToast('❌ Please fill all fields');
    return;
  }

  const booking = {
    id: Date.now(),
    service: currentBookingService.name,
    price: currentBookingService.price,
    name, phone, date, time,
    createdAt: new Date().toLocaleString(),
    type: 'carwash'
  };

  // Save booking to localStorage
  const bookings = JSON.parse(localStorage.getItem('we_bookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('we_bookings', JSON.stringify(bookings));

  // Also add to orders for revenue tracking
  const order = {
    id: Date.now(),
    items: [{ icon: '🚗', name: booking.service, price: booking.price, qty: 1 }],
    total: booking.price,
    date: new Date().toLocaleString(),
    type: 'carwash'
  };
  const orders = JSON.parse(localStorage.getItem('we_orders') || '[]');
  orders.push(order);
  localStorage.setItem('we_orders', JSON.stringify(orders));

  closeBooking();
  showToast(`✅ Booking confirmed for ${name}!`);
}

// ---- NAVBAR MOBILE ----
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

// ---- TOAST ----
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ---- UTILITY ----
function escapeHTML(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ---- INTERSECTION OBSERVER for fade-up elements ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
    }
  });
}, { threshold: 0.1 });

// Observe fade-up elements after DOM loads
setTimeout(() => {
  document.querySelectorAll('.fade-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}, 2000);
