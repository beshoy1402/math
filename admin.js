// ================================
// WASH & EAT – Admin Dashboard JS
// ================================

// ---- CREDENTIALS ----
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'wash2024';

// ---- DEFAULT DATA (same as customer/app.js) ----
const DEFAULT_FOOD_ITEMS = [
  { id: 'f1', name: 'Classic Burger', desc: 'Beef patty, lettuce, tomato, cheese', price: 89, icon: '🍔', cost: 35 },
  { id: 'f2', name: 'Crispy Fries', desc: 'Golden seasoned fries', price: 35, icon: '🍟', cost: 10 },
  { id: 'f3', name: 'Club Sandwich', desc: 'Chicken, veggies, toasted bread', price: 75, icon: '🥪', cost: 28 },
  { id: 'f4', name: 'Pizza Slice', desc: 'Tomato sauce, mozzarella, toppings', price: 55, icon: '🍕', cost: 20 },
  { id: 'f5', name: 'Cold Drinks', desc: 'Pepsi, 7Up, Mirinda (can)', price: 25, icon: '🥤', cost: 8 },
  { id: 'f6', name: 'Burger + Fries Combo', desc: 'Classic Burger & Fries together', price: 110, icon: '🍔🍟', cost: 42 },
];

const DEFAULT_WASH_SERVICES = [
  { id: 'w1', name: 'Basic Wash', price: 80, desc: 'Exterior hand wash and rinse', features: ['Exterior wash', 'Rinse & dry', '~15 minutes'], icon: '💧', cost: 25, popular: false },
  { id: 'w2', name: 'Full Wash', price: 150, desc: 'Complete exterior with wax coating', features: ['Exterior wash', 'Wax coating', 'Tire shine', '~30 minutes'], icon: '✨', cost: 50, popular: false },
  { id: 'w3', name: 'Interior Cleaning', price: 180, desc: 'Deep interior vacuum and wipe-down', features: ['Full vacuum', 'Dashboard wipe', 'Glass cleaning', '~45 minutes'], icon: '🧹', cost: 60, popular: true },
  { id: 'w4', name: 'Premium Package', price: 250, desc: 'Full wash + interior + free drink!', features: ['Everything included', 'Interior + Exterior', 'Free drink 🥤', '~60 minutes'], icon: '👑', cost: 80, popular: false },
];

// ---- STATE ----
let currentEditType = null;
let currentEditId = null;

// ---- INIT ----
window.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in this session
  if (sessionStorage.getItem('we_admin_logged_in')) {
    showDashboard();
  }
});

// ---- LOGIN ----
function doLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem('we_admin_logged_in', 'true');
    err.classList.add('hidden');
    showDashboard();
  } else {
    err.classList.remove('hidden');
  }
}

// Allow Enter key to submit login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !document.getElementById('login-screen').classList.contains('hidden')) {
    doLogin();
  }
});

function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.body.style.overflow = 'auto';
  renderOverview();
  renderFoodTable();
  renderCarwashTable();
  renderOrders();
  renderBookings();
}

function logout() {
  sessionStorage.removeItem('we_admin_logged_in');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

// ---- TAB SWITCHING ----
function switchTab(tab, btn) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');
  document.getElementById('topbar-title').textContent = btn.textContent.trim();

  // Refresh data
  if (tab === 'overview') renderOverview();
  if (tab === 'orders') renderOrders();
  if (tab === 'bookings') renderBookings();
}

// ---- SIDEBAR MOBILE ----
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ---- DATA GETTERS / SETTERS ----
function getFoodItems() {
  return JSON.parse(localStorage.getItem('we_food_items') || JSON.stringify(DEFAULT_FOOD_ITEMS));
}
function setFoodItems(items) {
  localStorage.setItem('we_food_items', JSON.stringify(items));
}
function getWashServices() {
  return JSON.parse(localStorage.getItem('we_wash_services') || JSON.stringify(DEFAULT_WASH_SERVICES));
}
function setWashServices(services) {
  localStorage.setItem('we_wash_services', JSON.stringify(services));
}
function getOrders() {
  return JSON.parse(localStorage.getItem('we_orders') || '[]');
}
function getBookings() {
  return JSON.parse(localStorage.getItem('we_bookings') || '[]');
}

// ---- OVERVIEW ----
function renderOverview() {
  const orders = getOrders();
  const bookings = getBookings();
  const foodItems = getFoodItems();
  const washServices = getWashServices();

  // Calculate totals
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;

  // Calculate total cost from orders
  let totalCost = 0;
  orders.forEach(order => {
    order.items.forEach(item => {
      // Find item cost
      const fi = foodItems.find(f => f.name === item.name);
      const wi = washServices.find(w => w.name === item.name);
      const cost = fi ? fi.cost : (wi ? wi.cost : 0);
      totalCost += cost * item.qty;
    });
  });

  const totalProfit = totalRevenue - totalCost;

  // Render stat cards
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card orange">
      <div class="stat-card-label">Total Revenue</div>
      <div class="stat-card-value">EGP ${totalRevenue}</div>
      <div class="stat-card-sub">${totalOrders} orders</div>
    </div>
    <div class="stat-card red">
      <div class="stat-card-label">Total Cost</div>
      <div class="stat-card-value">EGP ${totalCost}</div>
      <div class="stat-card-sub">Ingredients & supplies</div>
    </div>
    <div class="stat-card green">
      <div class="stat-card-label">Net Profit</div>
      <div class="stat-card-value">EGP ${totalProfit}</div>
      <div class="stat-card-sub">${totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(0) : 0}% margin</div>
    </div>
    <div class="stat-card blue">
      <div class="stat-card-label">Bookings</div>
      <div class="stat-card-value">${bookings.length}</div>
      <div class="stat-card-sub">Car wash bookings</div>
    </div>
  `;

  // Draw charts
  drawRevenueChart(orders);
  drawProfitChart(foodItems, washServices);

  // Recent orders
  const recentList = document.getElementById('recent-orders-list');
  if (orders.length === 0) {
    recentList.innerHTML = '<div class="empty-state">No orders yet. Orders from customers appear here.</div>';
  } else {
    recentList.innerHTML = orders.slice(-8).reverse().map(o => `
      <div class="order-card">
        <span class="order-badge ${o.type}">${o.type === 'food' ? '🍔 Food' : '🚗 Car Wash'}</span>
        <span class="order-items">${o.items.map(i => `${i.name} x${i.qty}`).join(', ')}</span>
        <span class="order-total">EGP ${o.total}</span>
        <span class="order-date">${o.date}</span>
      </div>
    `).join('');
  }
}

// ---- SIMPLE BAR CHART (pure canvas) ----
function drawRevenueChart(orders) {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Count revenue by type
  const food = orders.filter(o => o.type === 'food').reduce((s, o) => s + o.total, 0);
  const wash = orders.filter(o => o.type === 'carwash').reduce((s, o) => s + o.total, 0);

  const data = [
    { label: 'Food', value: food, color: '#FF6B2B' },
    { label: 'Car Wash', value: wash, color: '#3B82F6' },
  ];

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = 80, gap = 60, startX = (W - (data.length * barW + (data.length - 1) * gap)) / 2;

  ctx.fillStyle = '#888';
  ctx.font = '12px DM Sans';
  ctx.textAlign = 'center';

  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * (H - 60);
    const x = startX + i * (barW + gap);
    const y = H - 40 - barH;

    // Bar
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = '#888';
    ctx.fillText(d.label, x + barW / 2, H - 20);

    // Value
    ctx.fillStyle = '#fff';
    ctx.fillText(`EGP ${d.value}`, x + barW / 2, y - 8);
  });
}

function drawProfitChart(foodItems, washServices) {
  const canvas = document.getElementById('profitChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const items = [...foodItems.slice(0, 4), ...washServices.slice(0, 3)].map(item => ({
    name: item.name.split(' ')[0],
    profit: item.price - item.cost,
    color: item.id?.startsWith('f') ? '#FF6B2B' : '#3B82F6'
  }));

  const maxVal = Math.max(...items.map(d => d.profit), 1);
  const barW = Math.floor((W - 40) / items.length) - 8;
  const startX = 20;

  ctx.font = '10px DM Sans';
  ctx.textAlign = 'center';

  items.forEach((d, i) => {
    const barH = (d.profit / maxVal) * (H - 60);
    const x = startX + i * (barW + 8);
    const y = H - 40 - barH;

    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#555';
    ctx.fillText(d.name, x + barW / 2, H - 22);

    ctx.fillStyle = '#aaa';
    ctx.fillText(d.profit, x + barW / 2, y - 6);
  });
}

// ---- FOOD TABLE ----
function renderFoodTable() {
  const items = getFoodItems();
  const tbody = document.getElementById('food-tbody');
  tbody.innerHTML = items.map(item => `
    <tr>
      <td class="table-icon">${item.icon}</td>
      <td><strong>${item.name}</strong></td>
      <td style="color:var(--text-muted)">${item.desc}</td>
      <td class="cost-cell">EGP ${item.cost}</td>
      <td class="price-cell">EGP ${item.price}</td>
      <td class="profit-cell">EGP ${item.price - item.cost} (${(((item.price-item.cost)/item.price)*100).toFixed(0)}%)</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-edit" onclick="openItemModal('food', '${item.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('food', '${item.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ---- CARWASH TABLE ----
function renderCarwashTable() {
  const services = getWashServices();
  const tbody = document.getElementById('carwash-tbody');
  tbody.innerHTML = services.map(s => `
    <tr>
      <td class="table-icon">${s.icon}</td>
      <td><strong>${s.name}</strong></td>
      <td style="color:var(--text-muted)">${s.desc}</td>
      <td class="cost-cell">EGP ${s.cost}</td>
      <td class="price-cell">EGP ${s.price}</td>
      <td class="profit-cell">EGP ${s.price - s.cost} (${(((s.price-s.cost)/s.price)*100).toFixed(0)}%)</td>
      <td><span class="popular-dot ${s.popular ? 'yes' : 'no'}"></span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-edit" onclick="openItemModal('carwash', '${s.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('carwash', '${s.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ---- ORDERS ----
function renderOrders() {
  const orders = getOrders();
  const container = document.getElementById('orders-list');
  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state">📭 No orders yet</div>';
    return;
  }
  container.innerHTML = orders.slice().reverse().map(o => `
    <div class="order-card">
      <span class="order-badge ${o.type}">${o.type === 'food' ? '🍔 Food' : '🚗 Wash'}</span>
      <span class="order-items">${o.items.map(i => `${i.icon || ''} ${i.name} ×${i.qty}`).join(' | ')}</span>
      <span class="order-total">EGP ${o.total}</span>
      <span class="order-date">${o.date}</span>
    </div>
  `).join('');
}

function clearOrders() {
  if (confirm('Clear all orders?')) {
    localStorage.removeItem('we_orders');
    renderOrders();
    renderOverview();
    showToast('🗑️ Orders cleared');
  }
}

// ---- BOOKINGS ----
function renderBookings() {
  const bookings = getBookings();
  const container = document.getElementById('bookings-list');
  if (bookings.length === 0) {
    container.innerHTML = '<div class="empty-state">📭 No bookings yet</div>';
    return;
  }
  container.innerHTML = bookings.slice().reverse().map(b => `
    <div class="booking-card">
      <span class="order-badge carwash">🚗 ${b.service}</span>
      <span class="order-items">👤 ${b.name} | 📞 ${b.phone}</span>
      <span class="order-items">📅 ${b.date} at ${b.time}</span>
      <span class="order-total">EGP ${b.price}</span>
    </div>
  `).join('');
}

function clearBookings() {
  if (confirm('Clear all bookings?')) {
    localStorage.removeItem('we_bookings');
    renderBookings();
    showToast('🗑️ Bookings cleared');
  }
}

// ---- ITEM MODAL ----
function openItemModal(type, id = null) {
  currentEditType = type;
  currentEditId = id;

  const modal = document.getElementById('item-modal');
  const carwashExtra = document.getElementById('item-carwash-extra');

  // Show carwash-specific fields
  if (type === 'carwash') {
    carwashExtra.classList.remove('hidden');
  } else {
    carwashExtra.classList.add('hidden');
  }

  if (id) {
    // Edit mode
    document.getElementById('item-modal-title').textContent = `Edit ${type === 'food' ? 'Food Item' : 'Service'}`;
    const items = type === 'food' ? getFoodItems() : getWashServices();
    const item = items.find(i => i.id === id);
    if (!item) return;

    document.getElementById('item-icon').value = item.icon;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-desc').value = item.desc;
    document.getElementById('item-cost').value = item.cost;
    document.getElementById('item-price').value = item.price;

    if (type === 'carwash') {
      document.getElementById('item-features').value = (item.features || []).join(', ');
      document.getElementById('item-popular').checked = item.popular || false;
    }
  } else {
    // Add mode
    document.getElementById('item-modal-title').textContent = `Add ${type === 'food' ? 'Food Item' : 'Service'}`;
    document.getElementById('item-icon').value = type === 'food' ? '🍽️' : '🚗';
    document.getElementById('item-name').value = '';
    document.getElementById('item-desc').value = '';
    document.getElementById('item-cost').value = '';
    document.getElementById('item-price').value = '';
    if (type === 'carwash') {
      document.getElementById('item-features').value = '';
      document.getElementById('item-popular').checked = false;
    }
  }

  updateProfitPreview();
  modal.classList.remove('hidden');

  // Live profit preview on input
  ['item-cost', 'item-price'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateProfitPreview);
  });
}

function updateProfitPreview() {
  const cost = parseFloat(document.getElementById('item-cost').value) || 0;
  const price = parseFloat(document.getElementById('item-price').value) || 0;
  const profit = price - cost;
  const margin = price > 0 ? ((profit / price) * 100).toFixed(0) : 0;
  document.getElementById('profit-preview').textContent =
    cost > 0 && price > 0
      ? `💰 Profit: EGP ${profit} (${margin}% margin)`
      : 'Enter cost and price to see profit';
}

function closeItemModal() {
  document.getElementById('item-modal').classList.add('hidden');
  currentEditType = null;
  currentEditId = null;
}

function saveItem() {
  const icon = document.getElementById('item-icon').value.trim();
  const name = document.getElementById('item-name').value.trim();
  const desc = document.getElementById('item-desc').value.trim();
  const cost = parseFloat(document.getElementById('item-cost').value);
  const price = parseFloat(document.getElementById('item-price').value);

  if (!name || !desc || isNaN(cost) || isNaN(price)) {
    showToast('❌ Please fill all required fields');
    return;
  }
  if (cost < 0 || price <= 0) {
    showToast('❌ Invalid price/cost values');
    return;
  }

  if (currentEditType === 'food') {
    const items = getFoodItems();
    if (currentEditId) {
      const idx = items.findIndex(i => i.id === currentEditId);
      if (idx !== -1) items[idx] = { ...items[idx], icon, name, desc, cost, price };
    } else {
      items.push({ id: 'f' + Date.now(), icon, name, desc, cost, price });
    }
    setFoodItems(items);
    renderFoodTable();
    showToast('✅ Food item saved');
  } else {
    const services = getWashServices();
    const features = document.getElementById('item-features').value.split(',').map(f => f.trim()).filter(Boolean);
    const popular = document.getElementById('item-popular').checked;

    if (currentEditId) {
      const idx = services.findIndex(s => s.id === currentEditId);
      if (idx !== -1) services[idx] = { ...services[idx], icon, name, desc, cost, price, features, popular };
    } else {
      services.push({ id: 'w' + Date.now(), icon, name, desc, cost, price, features, popular });
    }
    setWashServices(services);
    renderCarwashTable();
    showToast('✅ Service saved');
  }

  closeItemModal();
  renderOverview();
}

function deleteItem(type, id) {
  if (!confirm('Delete this item?')) return;

  if (type === 'food') {
    const items = getFoodItems().filter(i => i.id !== id);
    setFoodItems(items);
    renderFoodTable();
    showToast('🗑️ Food item deleted');
  } else {
    const services = getWashServices().filter(s => s.id !== id);
    setWashServices(services);
    renderCarwashTable();
    showToast('🗑️ Service deleted');
  }
  renderOverview();
}

// ---- TOAST ----
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
