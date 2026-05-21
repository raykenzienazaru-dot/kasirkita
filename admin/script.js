// ===== HELPERS =====
const fmt = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");
const pct = (a, b) => b ? ((a / b) * 100).toFixed(1) + "%" : "0%";
const todayISO = () => new Date().toISOString().split("T")[0];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function createItemCode(name) {
  const safeName = (name || "ITEM").toString().replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BRG-${safeName}-${timestamp}-${randomPart}`;
}

// ===== SAMPLE DATA =====
function genSampleData() {
  const pool = [
    { nama: "Nasi Goreng", harga: 8000, kategori: "Makanan" },
    { nama: "Mie Goreng", harga: 7000, kategori: "Makanan" },
    { nama: "Ayam Bakar", harga: 12000, kategori: "Makanan" },
    { nama: "Gado-Gado", harga: 9000, kategori: "Makanan" },
    { nama: "Es Teh", harga: 3000, kategori: "Minuman" },
    { nama: "Air Mineral", harga: 2000, kategori: "Minuman" },
    { nama: "Jus Jeruk", harga: 5000, kategori: "Minuman" },
    { nama: "Es Campur", harga: 6000, kategori: "Minuman" },
    { nama: "Keripik", harga: 2500, kategori: "Snack" },
    { nama: "Roti Bakar", harga: 4000, kategori: "Snack" },
    { nama: "Pena", harga: 3000, kategori: "ATK" },
    { nama: "Penggaris", harga: 5000, kategori: "ATK" },
  ];
  const methods = ["tunai", "tunai", "tunai", "qris", "transfer"];
  const banks = ["BRI", "BCA", "Mandiri", "BNI"];
  const kasirs = ["Budi Santoso", "Siti Rahayu", "Ahmad Fauzi"];
  const trxs = [];
  const now = new Date();

  for (let day = 0; day < 7; day++) {
    const base = new Date(now);
    base.setDate(base.getDate() - day);
    const totalTrx = 6 + Math.floor(Math.random() * 10);

    for (let i = 0; i < totalTrx; i++) {
      const t = new Date(base);
      t.setHours(7 + Math.floor(Math.random() * 9));
      t.setMinutes(Math.floor(Math.random() * 60));
      const items = [];
      const itemCount = 1 + Math.floor(Math.random() * 3);

      for (let j = 0; j < itemCount; j++) {
        const it = pool[Math.floor(Math.random() * pool.length)];
        const jumlah = 1 + Math.floor(Math.random() * 3);
        items.push({ ...it, jumlah, subtotal: it.harga * jumlah });
      }

      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const autoDiskon = subtotal > 100000 ? Math.round(subtotal * 0.1) : 0;
      const afterDiscount = subtotal - autoDiskon;
      const ppn = Math.round(afterDiscount * 0.11);
      const total = afterDiscount + ppn;
      const metode = methods[Math.floor(Math.random() * methods.length)];

      trxs.push({
        id: trxs.length + 1,
        tanggal: t.toISOString(),
        items,
        subtotal,
        manualDiskon: 0,
        autoDiskon,
        diskon: autoDiskon,
        ppn,
        total,
        metode,
        bank: metode === "transfer" ? banks[Math.floor(Math.random() * banks.length)] : null,
        uangDiterima: metode === "tunai" ? total + (Math.floor(Math.random() * 5) + 1) * 2000 : 0,
        kembalian: 0,
        catatan: "",
        kasir: kasirs[Math.floor(Math.random() * kasirs.length)],
      });
    }
  }

  return trxs.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

const MENU_ITEMS = [
  { id: 1, nama: "Nasi Goreng", harga: 8000, kategori: "Makanan", stok: 50 },
  { id: 2, nama: "Mie Goreng", harga: 7000, kategori: "Makanan", stok: 40 },
  { id: 3, nama: "Ayam Bakar", harga: 12000, kategori: "Makanan", stok: 30 },
  { id: 4, nama: "Gado-Gado", harga: 9000, kategori: "Makanan", stok: 25 },
  { id: 5, nama: "Es Teh", harga: 3000, kategori: "Minuman", stok: 100 },
  { id: 6, nama: "Air Mineral", harga: 2000, kategori: "Minuman", stok: 200 },
  { id: 7, nama: "Jus Jeruk", harga: 5000, kategori: "Minuman", stok: 60 },
  { id: 8, nama: "Es Campur", harga: 6000, kategori: "Minuman", stok: 45 },
  { id: 9, nama: "Keripik", harga: 2500, kategori: "Snack", stok: 80 },
  { id: 10, nama: "Roti Bakar", harga: 4000, kategori: "Snack", stok: 35 },
  { id: 11, nama: "Pena", harga: 3000, kategori: "ATK", stok: 150 },
  { id: 12, nama: "Penggaris", harga: 5000, kategori: "ATK", stok: 70 },
].map((item) => ({ ...item, kode: createItemCode(item.nama) }));

const SIDEBAR = [
  { key: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
  { key: "harian", icon: "ti-calendar-stats", label: "Riwayat Harian" },
  { key: "laporan", icon: "ti-chart-bar", label: "Laporan Harian" },
  { key: "barang", icon: "ti-package", label: "Tambah Barang" },
  { key: "pembayaran", icon: "ti-credit-card", label: "History Bayar" },
  { key: "qrbarang", icon: "ti-barcode", label: "Barcode Barang" },
];

const KATCOLOR = {
  Makanan:  { bg: "#dcfce7", text: "#15803d", bd: "#86efac", chart: "#22c55e" },
  Minuman:  { bg: "#dbeafe", text: "#1d4ed8", bd: "#93c5fd", chart: "#3b82f6" },
  Snack:    { bg: "#fef9c3", text: "#a16207", bd: "#fde047", chart: "#eab308" },
  ATK:      { bg: "#fce7f3", text: "#be185d", bd: "#f9a8d4", chart: "#ec4899" },
  Lainnya:  { bg: "#f1f5f9", text: "#475569", bd: "#cbd5e1", chart: "#94a3b8" },
};

// ===== STATE =====
const state = {
  page: "dashboard",
  currentUser: null,
  trxs: [],
  items: [],
  sidebarOpen: true,
  qrReady: false,
  toasts: [],
  chart: null,
  donutChart: null,
  harianDate: todayISO(),
  laporanDate: todayISO(),
  detailId: null,
  pembayaran: { method: "semua", dateFrom: "", dateTo: "", search: "" },
  qrKategori: "Semua",
  barangModalOpen: false,
  editingItemId: null,
  barangForm: { nama: "", kategori: "Makanan", harga: "", stok: "" },
};

// ===== STORAGE & SESSION =====
function loadCurrentUser() {
  const saved = sessionStorage.getItem("currentUser");
  if (!saved) return null;
  try { return JSON.parse(saved); } catch { sessionStorage.removeItem("currentUser"); return null; }
}

function loadTransactions() {
  try {
    const stored = JSON.parse(localStorage.getItem("riwayat") || "null");
    return stored && stored.length ? stored : genSampleData();
  } catch { return genSampleData(); }
}

function loadItems() {
  try {
    const stored = JSON.parse(localStorage.getItem("barang") || "null");
    const data = stored && stored.length ? stored : MENU_ITEMS;
    return data.map((item) => ({ ...item, kode: item.kode || createItemCode(item.nama) }));
  } catch { return MENU_ITEMS; }
}

function saveItems() { localStorage.setItem("barang", JSON.stringify(state.items)); }

// ===== RENDER CORE =====
document.addEventListener("DOMContentLoaded", initAdmin);

async function syncItemsFromSupabase() {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient.from('products').select('*').eq('is_active', true).order('name', { ascending: true });
    if (!error && data) {
      state.items = data.map(item => ({ id: item.id, nama: item.name, harga: item.price, kategori: item.category || 'Lainnya', stok: item.stock || 0, kode: item.code }));
      render();
    }
  } catch (err) { console.error("Error syncItemsFromSupabase:", err); }
}

async function syncTransactionsFromSupabase() {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient.from('transactions').select('*, transaction_items(*)').order('created_at', { ascending: false });
    if (!error && data) {
      state.trxs = data.map(trx => ({
        id: trx.trx_number || trx.id,
        tanggal: trx.created_at,
        subtotal: trx.subtotal_amount,
        manualDiskon: trx.manual_discount_amount,
        autoDiskon: trx.auto_discount_amount,
        diskon: trx.manual_discount_amount + trx.auto_discount_amount,
        ppn: trx.ppn_amount,
        total: trx.total_amount,
        metode: trx.payment_method,
        bank: trx.payment_bank,
        uangDiterima: trx.total_amount,
        kembalian: 0,
        catatan: trx.notes,
        kasir: trx.created_by,
        items: (trx.transaction_items || []).map(item => ({ nama: item.product_name, harga: item.unit_price, jumlah: item.quantity, subtotal: item.line_subtotal, kategori: item.product_category || 'Lainnya', kode: item.product_code }))
      }));
      render();
    }
  } catch (err) { console.error("Error syncTransactionsFromSupabase:", err); }
}

function initAdmin() {
  state.currentUser = loadCurrentUser();
  if (!state.currentUser) { window.location.replace("../login.html"); return; }
  state.trxs = loadTransactions();
  state.items = loadItems();
  state.qrReady = Boolean(window.JsBarcode);
  render();
  if (window.supabaseClient) { syncItemsFromSupabase(); syncTransactionsFromSupabase(); }
  if (!state.qrReady) waitForQrLibrary();
}

function waitForQrLibrary() {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (window.JsBarcode) { clearInterval(timer); state.qrReady = true; render(); }
    if (attempts > 40) clearInterval(timer);
  }, 250);
}

function render() {
  const focus = captureFocus();
  const root = document.getElementById("root");

  if (state.chart) { state.chart.destroy(); state.chart = null; }
  if (state.donutChart) { state.donutChart.destroy(); state.donutChart = null; }

  if (!state.currentUser || state.currentUser.role !== "admin") {
    root.innerHTML = renderAccessDenied();
    bindEvents(); return;
  }

  root.innerHTML = `
    <div class="admin-shell ${state.sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}">
      <button class="mobile-burger-btn" data-action="toggle-sidebar" aria-label="Toggle Sidebar">
        <i class="ti ti-menu-2"></i>
      </button>
      <div class="sidebar-overlay" data-action="toggle-sidebar"></div>
      ${renderSidebar()}
      <main class="admin-main">
        ${renderTopbar()}
        <section class="admin-content">
          ${renderPage()}
        </section>
      </main>
    </div>
    ${renderModal()}
    ${renderToasts()}
  `;

  bindEvents();
  afterRender();
  restoreFocus(focus);
}

function captureFocus() {
  const el = document.activeElement;
  if (!el || !el.id) return null;
  return { id: el.id, start: typeof el.selectionStart === "number" ? el.selectionStart : null, end: typeof el.selectionEnd === "number" ? el.selectionEnd : null };
}

function restoreFocus(focus) {
  if (!focus) return;
  const el = document.getElementById(focus.id);
  if (!el) return;
  el.focus();
  if (focus.start !== null && typeof el.setSelectionRange === "function") el.setSelectionRange(focus.start, focus.end);
}

function afterRender() {
  if (state.page === "laporan") { renderSalesChart(); renderDonutChart(); }
  if (state.page === "dashboard") { renderDashboardCharts(); }
  if (state.page === "barang" || state.page === "qrbarang") renderQrCodes();
}

function renderAccessDenied() {
  return `
    <div class="access-page">
      <div class="access-box">
        <div class="access-icon"><i class="ti ti-shield-x"></i></div>
        <h1>Akses Ditolak</h1>
        <p>Hanya admin yang dapat mengakses halaman ini.</p>
        <button class="btn btn-primary" data-action="logout">Kembali ke Login</button>
      </div>
    </div>`;
}

// ===== TOPBAR =====
function renderTopbar() {
  const pageLabels = { dashboard: "Dashboard", harian: "Riwayat Harian", laporan: "Laporan Harian", barang: "Tambah Barang", pembayaran: "History Pembayaran", qrbarang: "Barcode Barang" };
  const name = state.currentUser?.displayName || "Administrator";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return `
    <header class="admin-topbar">
      <div class="topbar-left">
        <span class="topbar-title">${escapeHTML(pageLabels[state.page] || "Dashboard")}</span>
      </div>
      <div class="topbar-right">
        <button class="topbar-notif-btn" aria-label="Notifikasi">
          <i class="ti ti-bell" style="font-size:17px"></i>
          <span class="notif-badge">3</span>
        </button>
        <div class="topbar-user">
          <div class="topbar-avatar">${escapeHTML(initials)}</div>
          <div class="topbar-user-info">
            <small>Selamat datang,</small>
            <strong>${escapeHTML(name)} <i class="ti ti-chevron-down" style="font-size:10px;vertical-align:middle"></i></strong>
          </div>
        </div>
      </div>
    </header>
  `;
}

// ===== SIDEBAR =====
function renderSidebar() {
  const name = state.currentUser?.displayName || "Administrator";
  const email = state.currentUser?.email || "admin@kasirkita.id";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return `
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><i class="ti ti-building-store" style="font-size:18px"></i></div>
        <div class="brand-text">
          <strong>Kasirkita</strong>
          <span>Admin Panel</span>
        </div>
        <button class="sidebar-toggle" data-action="toggle-sidebar" title="Toggle sidebar">
          <i class="ti ${state.sidebarOpen ? "ti-layout-sidebar-left-collapse" : "ti-layout-sidebar-left-expand"}"></i>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Navigasi Admin">
        <div class="sidebar-section-label">Menu Utama</div>
        ${SIDEBAR.map((item) => `
          <button class="sidebar-link ${state.page === item.key ? "active" : ""}" data-action="set-page" data-page="${item.key}" title="${escapeHTML(item.label)}">
            <i class="ti ${item.icon}"></i>
            <span>${escapeHTML(item.label)}</span>
          </button>
        `).join("")}
      </nav>

      <div class="sidebar-account">
        <div class="account-row">
          <div class="account-avatar">${escapeHTML(initials)}</div>
          <div class="account-text">
            <strong>${escapeHTML(name)}</strong>
            <span>${escapeHTML(email)}</span>
          </div>
        </div>
        <button class="logout-btn" data-action="logout">
          <i class="ti ti-logout"></i>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  `;
}

function renderPage() {
  const pages = { dashboard: renderDashboard, harian: renderRiwayatHarian, laporan: renderLaporanHarian, barang: renderTambahBarang, pembayaran: renderHistoryPembayaran, qrbarang: renderQrBarang };
  return (pages[state.page] || renderDashboard)();
}

function pageHeader(title, subtitle, extra = "") {
  return `
    <div class="page-head">
      <div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(subtitle)}</p></div>
      ${extra}
    </div>`;
}

function renderToasts() {
  if (!state.toasts.length) return '<div class="toast-stack"></div>';
  return `<div class="toast-stack">${state.toasts.map((toast) => `
    <div class="toast toast-${escapeHTML(toast.type || "success")}">${escapeHTML(toast.msg)}</div>
  `).join("")}</div>`;
}

function showToast(msg, type = "success") {
  const id = Date.now() + Math.random();
  state.toasts.push({ id, msg, type });
  render();
  setTimeout(() => { state.toasts = state.toasts.filter(t => t.id !== id); render(); }, 3000);
}

// ===== SMALL COMPONENTS =====
function badge(text, type = "default") {
  return `<span class="badge badge-${escapeHTML(type)}">${escapeHTML(text)}</span>`;
}

function statCard(icon, label, value, sub = "", accent = "teal", trend = null, sparkData = []) {
  const sparkBars = sparkData.length
    ? `<div class="metric-sparkline">${sparkData.map(h => `<span style="height:${Math.round((h/Math.max(...sparkData))*100)}%;background:var(--accent-${accent});"></span>`).join("")}</div>`
    : "";

  const trendHtml = trend
    ? `<div class="metric-trend ${trend.dir}"><i class="ti ${trend.dir === "up" ? "ti-trending-up" : "ti-trending-down"}"></i>${trend.val} <small>dari bulan lalu</small></div>`
    : (sub ? `<small style="color:var(--text-muted);font-size:11px">${escapeHTML(sub)}</small>` : "");

  return `
    <article class="metric-card accent-${accent}">
      <div class="metric-icon-wrap"><i class="ti ${icon}" style="font-size:22px"></i></div>
      <div class="metric-body">
        <span>${escapeHTML(label)}</span>
        <strong>${escapeHTML(value)}</strong>
        ${trendHtml}
      </div>
      ${sparkBars}
    </article>`;
}

function progressBar(label, value, max, color = "#3b82f6") {
  const width = max ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return `
    <div class="progress-row">
      <div class="progress-meta"><span>${escapeHTML(label)}</span><strong>${fmt(value)}</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${width}%;background:${escapeHTML(color)}"></div></div>
    </div>`;
}

function emptyState(icon, title, subtitle = "") {
  return `
    <div class="empty-admin">
      <i class="ti ${icon}"></i>
      <p>${escapeHTML(title)}</p>
      ${subtitle ? `<small>${escapeHTML(subtitle)}</small>` : ""}
    </div>`;
}

function itemNames(transaction) {
  return transaction.items.map(item => item.nama).join(", ");
}

function transactionById(id) {
  return state.trxs.find(trx => String(trx.id) === String(id));
}

// ===== DASHBOARD =====
function renderDashboard() {
  const todayText = new Date().toDateString();
  const today = state.trxs.filter(trx => new Date(trx.tanggal).toDateString() === todayText);
  const totalToday = today.reduce((sum, trx) => sum + trx.total, 0);
  const totalAll = state.trxs.reduce((sum, trx) => sum + trx.total, 0);
  const totalItems = state.trxs.reduce((sum, trx) => sum + trx.items.reduce((s, i) => s + i.jumlah, 0), 0);
  const avgTrx = state.trxs.length ? Math.round(totalAll / state.trxs.length) : 0;

  const metMap = {};
  const katMap = {};
  state.trxs.forEach(trx => {
    metMap[trx.metode] = (metMap[trx.metode] || 0) + trx.total;
    trx.items.forEach(item => { katMap[item.kategori] = (katMap[item.kategori] || 0) + item.subtotal; });
  });

  const barColors = { tunai: "#3b82f6", qris: "#8b5cf6", transfer: "#ec4899" };
  const recent = state.trxs.slice(0, 5);
  const totalKat = Object.values(katMap).reduce((a, b) => a + b, 0);

  // Build sparkline data (last 7 days totals)
  const sparkData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    sparkData.push(state.trxs.filter(t => new Date(t.tanggal).toDateString() === ds).reduce((s, t) => s + t.total, 0));
  }

  return `
    <div class="metric-grid">
      ${statCard("ti-coin", "Pendapatan Hari Ini", fmt(totalToday), `${today.length} transaksi`, "blue",
        { dir: "up", val: "12.5%" }, sparkData)}
      ${statCard("ti-receipt", "Total Transaksi", String(state.trxs.length), `Rata-rata ${fmt(avgTrx)}`, "green",
        { dir: "up", val: "8.7%" }, [])}
      ${statCard("ti-package", "Item Terjual", String(totalItems), "Semua item", "orange",
        { dir: "down", val: "5.3%" }, [])}
      ${statCard("ti-chart-pie", "Total Pendapatan", fmt(totalAll), "Semua waktu", "purple",
        null, [])}
    </div>

    <div class="dashboard-grid">
      <div>
        <!-- Line Chart -->
        <div class="panel" style="margin-bottom:18px">
          <div class="panel-header">
            <h3>Laporan Penjualan Harian</h3>
            <div style="display:flex;align-items:center;gap:12px">
              <div class="chart-legend">
                <div class="chart-legend-item">
                  <div class="legend-dot" style="background:#3b82f6"></div> Pendapatan
                </div>
                <div class="chart-legend-item">
                  <div class="legend-dot" style="background:#a855f7"></div> Transaksi
                </div>
              </div>
              <button class="chart-filter-btn">
                7 Hari Terakhir <i class="ti ti-chevron-down" style="font-size:12px"></i>
              </button>
            </div>
          </div>
          <div class="panel-body">
            <div style="height:240px;position:relative">
              <canvas id="sales-chart"></canvas>
              <p id="chart-fallback" class="muted-line" hidden>Chart.js belum termuat.</p>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="panel">
          <div class="panel-header">
            <h3>Transaksi Terbaru</h3>
            <button class="panel-link" data-action="set-page" data-page="harian">Lihat Semua <i class="ti ti-arrow-right" style="font-size:12px"></i></button>
          </div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Nama Item</th>
                  <th>Jumlah</th>
                  <th>Total</th>
                  <th>Kasir</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${recent.map(trx => `
                  <tr>
                    <td>${new Date(trx.tanggal).toLocaleString("id-ID", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</td>
                    <td>${badge(trx.metode.toUpperCase(), trx.metode)}</td>
                    <td class="clip-cell">${escapeHTML(itemNames(trx))}</td>
                    <td>${trx.items.reduce((s,i) => s+i.jumlah, 0)}</td>
                    <td><strong>${fmt(trx.total)}</strong></td>
                    <td>${escapeHTML(trx.kasir || "-")}</td>
                    <td>
                      <div class="row-actions">
                        <button class="icon-btn" data-action="open-detail" data-id="${trx.id}" title="Detail">
                          <i class="ti ti-dots-vertical" style="font-size:14px"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div>
        <!-- Donut Chart: Distribusi Kategori -->
        <div class="panel" style="margin-bottom:18px">
          <div class="panel-header">
            <h3>Distribusi Kategori</h3>
            <button class="panel-link" data-action="set-page" data-page="laporan">Lihat Semua <i class="ti ti-arrow-right" style="font-size:12px"></i></button>
          </div>
          <div class="panel-body">
            <div class="donut-wrap">
              <div class="donut-canvas-wrap">
                <canvas id="donut-chart" width="180" height="180"></canvas>
                <div class="donut-center">
                  <span>Total</span>
                  <strong>${state.items.length}</strong>
                  <small>Barang</small>
                </div>
              </div>
              <div class="donut-legend">
                ${Object.entries(katMap).sort((a,b) => b[1]-a[1]).map(([kat, val]) => {
                  const color = (KATCOLOR[kat] || KATCOLOR.Lainnya).chart;
                  return `
                    <div class="donut-legend-item">
                      <div class="donut-legend-left">
                        <div class="donut-swatch" style="background:${escapeHTML(color)}"></div>
                        ${escapeHTML(kat)}
                      </div>
                      <div class="donut-legend-right">${pct(val, totalKat)}</div>
                    </div>`;
                }).join("") || '<p class="muted-line">Belum ada data</p>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Metode Pembayaran -->
        <div class="panel">
          <div class="panel-header"><h3>Metode Pembayaran</h3></div>
          <div class="panel-body">
            ${["tunai", "qris", "transfer"].map(method => {
              const value = metMap[method] || 0;
              const count = state.trxs.filter(t => t.metode === method).length;
              const total = Object.values(metMap).reduce((a,b) => a+b, 0);
              const width = total ? Math.round((value/total)*100) : 0;
              return `
                <div class="method-row">
                  <div class="method-row-left">
                    <div class="method-dot" style="background:${barColors[method]}"></div>
                    <div>
                      <strong>${method.charAt(0).toUpperCase() + method.slice(1)}</strong>
                      <small>${count} transaksi</small>
                    </div>
                  </div>
                  <b>${fmt(value)}</b>
                </div>
                <div class="progress-track" style="margin-bottom:10px">
                  <div class="progress-fill" style="width:${width}%;background:${barColors[method]}"></div>
                </div>`;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== DASHBOARD CHARTS =====
function renderDashboardCharts() {
  renderDashboardLineChart();
  renderDashboardDonutChart();
}

function renderDashboardLineChart() {
  const canvas = document.getElementById("sales-chart");
  const fallback = document.getElementById("chart-fallback");
  if (!canvas || !window.Chart) { if (fallback) fallback.hidden = false; return; }
  if (state.chart) { state.chart.destroy(); state.chart = null; }

  const labels = [];
  const dataRevenue = [];
  const dataCount = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString("id-ID", { day:"2-digit", month:"short" }));
    const dayTrxs = state.trxs.filter(t => new Date(t.tanggal).toDateString() === d.toDateString());
    dataRevenue.push(dayTrxs.reduce((s, t) => s + t.total, 0));
    dataCount.push(dayTrxs.length);
  }

  state.chart = new window.Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Pendapatan",
          data: dataRevenue,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.08)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          yAxisID: "y",
        },
        {
          label: "Transaksi",
          data: dataCount,
          borderColor: "#a855f7",
          backgroundColor: "rgba(168,85,247,0.06)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#a855f7",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#0d1b2a",
          bodyColor: "#5a6a85",
          borderColor: "rgba(0,0,0,0.1)",
          borderWidth: 1,
          padding: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          callbacks: {
            label: ctx => ctx.datasetIndex === 0
              ? " " + fmt(ctx.parsed.y)
              : " " + ctx.parsed.y + " trx",
          },
        },
      },
      scales: {
        x: { ticks: { color: "#9aa5b8", font: { size: 11 } }, grid: { color: "rgba(0,0,0,0.04)" } },
        y: { position: "left", ticks: { color: "#9aa5b8", font: { size: 11 }, callback: v => "Rp " + (v/1000).toFixed(0) + "k" }, grid: { color: "rgba(0,0,0,0.04)" }, beginAtZero: true },
        y1: { position: "right", ticks: { color: "#9aa5b8", font: { size: 11 } }, grid: { drawOnChartArea: false }, beginAtZero: true },
      },
    },
  });
}

function renderDashboardDonutChart() {
  const canvas = document.getElementById("donut-chart");
  if (!canvas || !window.Chart) return;

  const katMap = {};
  state.trxs.forEach(trx => trx.items.forEach(item => {
    katMap[item.kategori] = (katMap[item.kategori] || 0) + item.subtotal;
  }));

  const labels = Object.keys(katMap);
  const data = Object.values(katMap);
  const colors = labels.map(k => (KATCOLOR[k] || KATCOLOR.Lainnya).chart);

  if (state.donutChart) { state.donutChart.destroy(); state.donutChart = null; }

  state.donutChart = new window.Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderColor: "#fff", borderWidth: 3, hoverOffset: 6 }],
    },
    options: {
      responsive: false,
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#0d1b2a",
          bodyColor: "#5a6a85",
          borderColor: "rgba(0,0,0,0.1)",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: ctx => " " + ctx.label + ": " + fmt(ctx.parsed),
          },
        },
      },
    },
  });
}

// ===== RIWAYAT HARIAN =====
function renderRiwayatHarian() {
  const filtered = state.trxs.filter(trx => trx.tanggal.startsWith(state.harianDate));
  const totalHari = filtered.reduce((sum, trx) => sum + trx.total, 0);

  return `
    ${pageHeader("Riwayat Harian", "Transaksi berdasarkan tanggal")}
    <div class="toolbar">
      <input id="harian-date" class="input compact-input" type="date" value="${escapeHTML(state.harianDate)}" data-action="harian-date">
      <span class="toolbar-note">${filtered.length} transaksi — Total ${fmt(totalHari)}</span>
    </div>

    ${filtered.length ? `
      <div class="transaction-list">
        ${filtered.map(trx => {
          const iconMap = { tunai: "ti-cash", qris: "ti-qrcode", transfer: "ti-building-bank" };
          return `
            <button class="transaction-card" data-action="open-detail" data-id="${trx.id}">
              <div class="transaction-icon method-${escapeHTML(trx.metode)}">
                <i class="ti ${iconMap[trx.metode] || "ti-cash"}"></i>
              </div>
              <div class="transaction-body">
                <div>
                  <strong>#${String(trx.id).padStart(3,"0")}</strong>
                  ${badge(trx.metode.toUpperCase(), trx.metode)}
                  ${trx.bank ? badge(trx.bank, "default") : ""}
                </div>
                <p>${escapeHTML(trx.items.map(i => `${i.nama} x${i.jumlah}`).join(", "))}</p>
              </div>
              <div class="transaction-total">
                <strong>${fmt(trx.total)}</strong>
                <span>${new Date(trx.tanggal).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" })}</span>
                ${trx.kasir ? `<span>${escapeHTML(trx.kasir)}</span>` : ""}
              </div>
            </button>`;
        }).join("")}
      </div>
    ` : emptyState("ti-calendar-x", "Tidak ada transaksi pada tanggal ini")}
  `;
}

function renderDetailModal() {
  const trx = transactionById(state.detailId);
  if (!trx) return "";

  const summaryRows = [
    ["Subtotal", fmt(trx.subtotal), false],
    trx.manualDiskon > 0 ? ["Diskon Manual", `- ${fmt(trx.manualDiskon)}`, false] : null,
    trx.autoDiskon > 0 ? ["Diskon Otomatis 10%", `- ${fmt(trx.autoDiskon)}`, false] : null,
    trx.ppn > 0 ? ["PPN 11%", fmt(trx.ppn), false] : null,
    ["TOTAL", fmt(trx.total), true],
  ].filter(Boolean);

  return `
    <div class="modal-overlay" data-action="close-modal">
      <div class="modal-content detail-modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>Detail Transaksi #${String(trx.id).padStart(3,"0")}</h3>
          <button class="icon-btn" data-action="close-modal"><i class="ti ti-x"></i></button>
        </div>
        <div class="detail-grid">
          <div><span>Tanggal</span><strong>${new Date(trx.tanggal).toLocaleString("id-ID")}</strong></div>
          <div><span>Kasir</span><strong>${escapeHTML(trx.kasir || "-")}</strong></div>
          <div><span>Metode</span><strong>${escapeHTML(trx.metode + (trx.bank ? " - " + trx.bank : ""))}</strong></div>
          <div><span>Catatan</span><strong>${escapeHTML(trx.catatan || "-")}</strong></div>
        </div>
        <div class="detail-section">
          <h4>Item yang Dibeli</h4>
          ${trx.items.map(item => `
            <div class="detail-row">
              <span>${escapeHTML(item.nama)} <small style="color:var(--text-muted)">×${item.jumlah}</small></span>
              <strong>${fmt(item.subtotal)}</strong>
            </div>`).join("")}
        </div>
        <div class="detail-section">
          ${summaryRows.map(([label, value, total]) => `
            <div class="detail-row ${total ? "is-total" : ""}">
              <span>${escapeHTML(label)}</span>
              <strong>${escapeHTML(value)}</strong>
            </div>`).join("")}
          ${trx.metode === "tunai" ? `
            <div class="detail-row">
              <span>Kembalian</span>
              <strong style="color:var(--accent-green)">${fmt((trx.uangDiterima || 0) - trx.total)}</strong>
            </div>` : ""}
        </div>
      </div>
    </div>`;
}

// ===== LAPORAN HARIAN =====
function renderLaporanHarian() {
  const filtered = getLaporanFiltered();
  const total = filtered.reduce((sum, trx) => sum + trx.total, 0);
  const avgTrx = filtered.length ? Math.round(total / filtered.length) : 0;
  const totalItems = filtered.reduce((sum, trx) => sum + trx.items.reduce((s, i) => s + i.jumlah, 0), 0);
  const totalPPN = filtered.reduce((sum, trx) => sum + (trx.ppn || 0), 0);
  const totalDiskon = filtered.reduce((sum, trx) => sum + (trx.diskon || 0), 0);

  const katMap = {};
  const metMap = {};
  const hourMap = {};
  const kasirMap = {};

  filtered.forEach(trx => {
    metMap[trx.metode] = (metMap[trx.metode] || 0) + trx.total;
    hourMap[new Date(trx.tanggal).getHours()] = (hourMap[new Date(trx.tanggal).getHours()] || 0) + trx.total;
    if (trx.kasir) kasirMap[trx.kasir] = (kasirMap[trx.kasir] || 0) + trx.total;
    trx.items.forEach(item => { katMap[item.kategori] = (katMap[item.kategori] || 0) + item.subtotal; });
  });

  const maxKat = Math.max(...Object.values(katMap), 1);
  const maxHour = Math.max(...Object.values(hourMap), 1);
  const maxKasir = Math.max(...Object.values(kasirMap), 1);
  const totalMet = Object.values(metMap).reduce((a, b) => a + b, 0);
  const barColors = { tunai: "#3b82f6", qris: "#8b5cf6", transfer: "#ec4899" };

  return `
    ${pageHeader("Laporan Harian", "Analisis mendalam per tanggal")}
    <div class="toolbar">
      <input id="laporan-date" class="input compact-input" type="date" value="${escapeHTML(state.laporanDate)}" data-action="laporan-date">
    </div>

    <div class="laporan-metric-row">
      <div class="laporan-metric"><span>Total Pendapatan</span><strong>${fmt(total)}</strong><small>${filtered.length} transaksi</small></div>
      <div class="laporan-metric"><span>Rata-rata Transaksi</span><strong>${fmt(avgTrx)}</strong></div>
      <div class="laporan-metric"><span>Item Terjual</span><strong>${totalItems}</strong></div>
      <div class="laporan-metric"><span>Total Diskon</span><strong style="color:var(--accent-green)">${fmt(totalDiskon)}</strong></div>
      <div class="laporan-metric"><span>Total PPN</span><strong>${fmt(totalPPN)}</strong></div>
    </div>

    <div class="dashboard-grid" style="margin-bottom:18px">
      <!-- Line Chart -->
      <div class="panel">
        <div class="panel-header"><h3>Grafik Pendapatan</h3></div>
        <div class="panel-body">
          <div style="height:260px;position:relative">
            <canvas id="sales-chart"></canvas>
            <p id="chart-fallback" class="muted-line" hidden>Chart.js belum termuat.</p>
          </div>
        </div>
      </div>

      <!-- Donut Chart: Distribusi Kategori -->
      <div class="panel">
        <div class="panel-header"><h3>Distribusi Kategori</h3></div>
        <div class="panel-body">
          ${filtered.length ? `
            <div class="donut-wrap">
              <div class="donut-canvas-wrap">
                <canvas id="donut-chart" width="170" height="170"></canvas>
                <div class="donut-center">
                  <span>Total</span>
                  <strong>${fmt(total).replace("Rp ","")}</strong>
                  <small>Pendapatan</small>
                </div>
              </div>
              <div class="donut-legend">
                ${Object.entries(katMap).sort((a,b) => b[1]-a[1]).map(([kat, val]) => {
                  const color = (KATCOLOR[kat] || KATCOLOR.Lainnya).chart;
                  return `
                    <div class="donut-legend-item">
                      <div class="donut-legend-left">
                        <div class="donut-swatch" style="background:${escapeHTML(color)}"></div>
                        ${escapeHTML(kat)}
                      </div>
                      <div class="donut-legend-right">${pct(val, total)}</div>
                    </div>`;
                }).join("")}
              </div>
            </div>` : emptyState("ti-chart-off", "Tidak ada data")}
        </div>
      </div>
    </div>

    ${filtered.length ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
      <div class="laporan-2col-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
        <div class="panel">
          <div class="panel-header"><h3>Penjualan per Kategori</h3></div>
          <div class="panel-body">
            ${Object.entries(katMap).sort((a,b) => b[1]-a[1]).map(([label, value]) =>
              progressBar(label, value, maxKat, (KATCOLOR[label] || KATCOLOR.Lainnya).chart)
            ).join("")}
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>Metode Pembayaran</h3></div>
          <div class="panel-body">
            ${["tunai","qris","transfer"].map(method => {
              const value = metMap[method] || 0;
              const w = totalMet ? Math.round((value/totalMet)*100) : 0;
              return `
                <div style="margin-bottom:12px">
                  <div class="progress-meta">
                    <span style="display:flex;align-items:center;gap:6px">
                      <span style="width:8px;height:8px;border-radius:50%;background:${barColors[method]};display:inline-block"></span>
                      ${method.charAt(0).toUpperCase() + method.slice(1)}
                    </span>
                    <strong>${fmt(value)} <span style="color:var(--text-muted);font-weight:400;font-size:11px">(${w}%)</span></strong>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width:${w}%;background:${barColors[method]}"></div>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>Penjualan per Jam</h3></div>
          <div class="panel-body">
            ${Object.entries(hourMap).sort((a,b) => Number(a[0])-Number(b[0])).map(([hour, value]) =>
              progressBar(`Pukul ${String(hour).padStart(2,"0")}:00`, value, maxHour, "#0ea5e9")
            ).join("") || '<p class="muted-line">Belum ada data</p>'}
          </div>
        </div>
        <div class="panel">
          <div class="panel-header"><h3>Performa Kasir</h3></div>
          <div class="panel-body">
            ${Object.entries(kasirMap).sort((a,b) => b[1]-a[1]).map(([label, value]) =>
              progressBar(label, value, maxKasir, "#8b5cf6")
            ).join("") || '<p class="muted-line">Belum ada data</p>'}
          </div>
        </div>
      </div>
    ` : emptyState("ti-chart-off", "Tidak ada data untuk tanggal ini")}
  `;
}

function getLaporanFiltered() {
  return state.trxs.filter(trx => trx.tanggal.startsWith(state.laporanDate));
}

function renderSalesChart() {
  const canvas = document.getElementById("sales-chart");
  const fallback = document.getElementById("chart-fallback");
  if (state.chart) { state.chart.destroy(); state.chart = null; }
  if (!canvas || !window.Chart) { if (fallback) fallback.hidden = false; return; }

  const filtered = getLaporanFiltered();
  const labels = filtered.map(trx => new Date(trx.tanggal).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" }));
  const data = filtered.map(trx => trx.total);

  state.chart = new window.Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Pendapatan",
        data,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#0d1b2a",
          bodyColor: "#5a6a85",
          borderColor: "rgba(0,0,0,0.1)",
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => " " + fmt(ctx.parsed.y) },
        },
      },
      scales: {
        x: { ticks: { color: "#9aa5b8", font: { size: 11 } }, grid: { color: "rgba(0,0,0,0.04)" } },
        y: { ticks: { color: "#9aa5b8", font: { size: 11 }, callback: v => "Rp " + (v/1000).toFixed(0) + "k" }, grid: { color: "rgba(0,0,0,0.04)" }, beginAtZero: true },
      },
    },
  });
}

function renderDonutChart() {
  const canvas = document.getElementById("donut-chart");
  if (!canvas || !window.Chart) return;

  const katMap = {};
  getLaporanFiltered().forEach(trx => trx.items.forEach(item => {
    katMap[item.kategori] = (katMap[item.kategori] || 0) + item.subtotal;
  }));

  const labels = Object.keys(katMap);
  const data = Object.values(katMap);
  const colors = labels.map(k => (KATCOLOR[k] || KATCOLOR.Lainnya).chart);

  if (state.donutChart) { state.donutChart.destroy(); state.donutChart = null; }

  state.donutChart = new window.Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: "#fff", borderWidth: 3, hoverOffset: 6 }] },
    options: {
      responsive: false,
      cutout: "66%",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#0d1b2a",
          bodyColor: "#5a6a85",
          borderColor: "rgba(0,0,0,0.1)",
          borderWidth: 1,
          padding: 10,
          callbacks: { label: ctx => " " + ctx.label + ": " + fmt(ctx.parsed) },
        },
      },
    },
  });
}

// ===== BARANG =====
function renderTambahBarang() {
  return `
    ${pageHeader("Manajemen Barang", "Kelola data barang dan barcode otomatis.",
      `<button class="btn btn-primary" data-action="open-add-item"><i class="ti ti-plus"></i>Tambah Barang</button>`
    )}
    ${state.items.length ? `
      <div class="item-grid">
        ${state.items.map(item => `
          <div class="item-card">
            ${renderQrCard(item)}
            <div class="item-actions">
              <button class="btn btn-sm" data-action="open-edit-item" data-id="${item.id}"><i class="ti ti-pencil" style="font-size:12px"></i> Edit</button>
              <button class="btn btn-sm ghost-danger" data-action="delete-item" data-id="${item.id}"><i class="ti ti-trash" style="font-size:12px"></i> Hapus</button>
            </div>
          </div>`).join("")}
      </div>
    ` : emptyState("ti-package", "Belum ada barang", "Tambahkan data barang untuk membuat barcode otomatis.")}
  `;
}

function renderBarangModal() {
  if (!state.barangModalOpen) return "";
  const isEditing = Boolean(state.editingItemId);
  return `
    <div class="modal-overlay" data-action="close-modal">
      <div class="modal-content" role="dialog" aria-modal="true" style="width:min(460px,90vw)">
        <div class="modal-head">
          <h3>${isEditing ? "Edit Barang" : "Tambah Barang Baru"}</h3>
          <button class="icon-btn" data-action="close-modal"><i class="ti ti-x"></i></button>
        </div>
        <form id="barang-form" class="admin-form">
          <div class="field">
            <label class="field-label" for="barang-nama">Nama Barang</label>
            <input id="barang-nama" class="input" name="nama" value="${escapeHTML(state.barangForm.nama)}" placeholder="Contoh: Nasi Goreng">
          </div>
          <div class="field">
            <label class="field-label" for="barang-kategori">Kategori</label>
            <select id="barang-kategori" class="input" name="kategori">
              ${["Makanan","Minuman","Snack","ATK","Lainnya"].map(kat => `
                <option ${state.barangForm.kategori === kat ? "selected" : ""}>${kat}</option>
              `).join("")}
            </select>
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field-label" for="barang-harga">Harga Satuan</label>
              <input id="barang-harga" class="input" name="harga" type="number" min="0" value="${escapeHTML(state.barangForm.harga)}" placeholder="Rp 0">
            </div>
            <div class="field">
              <label class="field-label" for="barang-stok">Jumlah Stok</label>
              <input id="barang-stok" class="input" name="stok" type="number" min="0" value="${escapeHTML(state.barangForm.stok)}" placeholder="0">
            </div>
          </div>
          <button class="btn btn-primary form-submit" type="submit">
            <i class="ti ti-device-floppy"></i>
            ${isEditing ? "Simpan Perubahan" : "Tambah Barang"}
          </button>
        </form>
      </div>
    </div>`;
}

function openAddItem() {
  state.editingItemId = null;
  state.barangForm = { nama: "", kategori: "Makanan", harga: "", stok: "" };
  state.barangModalOpen = true;
  render();
}

function openEditItem(id) {
  const item = state.items.find(e => String(e.id) === String(id));
  if (!item) return;
  state.editingItemId = item.id;
  state.barangForm = { nama: item.nama, kategori: item.kategori, harga: String(item.harga), stok: String(item.stok) };
  state.barangModalOpen = true;
  render();
}

async function submitBarangForm(form) {
  const nama = form.nama.value.trim();
  const kategori = form.kategori.value;
  const harga = Number(form.harga.value);
  const stok = Number(form.stok.value);

  if (!nama) { showToast("Nama barang wajib diisi", "error"); return; }
  if (!harga || harga <= 0) { showToast("Harga harus lebih dari 0", "error"); return; }
  if (Number.isNaN(stok) || stok < 0) { showToast("Stok harus angka valid", "error"); return; }

  let success = false;

  if (window.supabaseClient) {
    try {
      if (state.editingItemId) {
        const { error } = await window.supabaseClient.from('products').update({ name: nama, category: kategori, price: harga, stock: stok }).eq('id', state.editingItemId);
        if (!error) { showToast("Barang diperbarui di Supabase"); success = true; }
        else { showToast(error.message, "error"); }
      } else {
        const { error } = await window.supabaseClient.from('products').insert([{ code: createItemCode(nama), name: nama, category: kategori, price: harga, stock: stok, is_active: true }]);
        if (!error) { showToast("Barang ditambahkan ke Supabase"); success = true; }
        else { showToast(error.message, "error"); }
      }
      if (success) await syncItemsFromSupabase();
    } catch (err) { console.error("Error submitBarangForm:", err); }
  }

  if (!success) {
    if (state.editingItemId) {
      state.items = state.items.map(item => String(item.id) === String(state.editingItemId)
        ? { ...item, nama, kategori, harga, stok, kode: item.kode || createItemCode(nama) } : item);
      showToast("Barang diperbarui secara lokal");
    } else {
      state.items = [...state.items, { id: Date.now(), nama, kategori, harga, stok, kode: createItemCode(nama) }];
      showToast("Barang baru ditambahkan secara lokal");
    }
    saveItems();
  }

  state.barangModalOpen = false;
  state.editingItemId = null;
  render();
}

async function deleteItem(id) {
  if (!confirm("Hapus barang ini?")) return;
  let success = false;

  if (window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient.from('products').update({ is_active: false }).eq('id', id);
      if (!error) { showToast("Barang dihapus", "error"); success = true; await syncItemsFromSupabase(); }
      else { showToast(error.message, "error"); }
    } catch (err) { console.error("Error deleteItem:", err); }
  }

  if (!success) {
    state.items = state.items.filter(item => String(item.id) !== String(id));
    saveItems();
    showToast("Barang dihapus secara lokal", "error");
  }
  render();
}

// ===== HISTORY PEMBAYARAN =====
function renderHistoryPembayaran() {
  const filtered = getPembayaranFiltered();
  const totalFiltered = filtered.reduce((sum, trx) => sum + trx.total, 0);
  const counts = { tunai: 0, qris: 0, transfer: 0 };
  filtered.forEach(trx => { if (counts[trx.metode] !== undefined) counts[trx.metode]++; });

  return `
    ${pageHeader("History Pembayaran", "Semua riwayat transaksi dengan filter")}
    <div class="filter-bar">
      <input id="pay-search" class="input" value="${escapeHTML(state.pembayaran.search)}" placeholder="Cari transaksi...">
      <input id="pay-from" class="input compact-input" type="date" value="${escapeHTML(state.pembayaran.dateFrom)}">
      <input id="pay-to" class="input compact-input" type="date" value="${escapeHTML(state.pembayaran.dateTo)}">
      <div class="chip-group">
        ${["semua","tunai","qris","transfer"].map(method => `
          <button class="chip ${state.pembayaran.method === method ? "active" : ""}" data-action="pay-method" data-method="${method}">
            ${method === "semua" ? "Semua" : method.toUpperCase()}
          </button>`).join("")}
      </div>
    </div>
    <div class="mini-stat-grid">
      <div><span>Hasil Filter</span><strong>${filtered.length} trx</strong></div>
      <div><span>Total</span><strong>${fmt(totalFiltered)}</strong></div>
      <div><span>Tunai</span><strong>${counts.tunai} trx</strong></div>
      <div><span>QRIS & Transfer</span><strong>${counts.qris + counts.transfer} trx</strong></div>
    </div>
    <div class="panel">
      ${filtered.length ? `
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No. Trx</th><th>Tanggal & Waktu</th><th>Kasir</th><th>Item</th>
                <th>Subtotal</th><th>Diskon</th><th>PPN</th><th>Total</th><th>Metode</th><th>Bank</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(trx => `
                <tr>
                  <td><strong>#${String(trx.id).padStart(3,"0")}</strong></td>
                  <td>${new Date(trx.tanggal).toLocaleString("id-ID", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</td>
                  <td>${escapeHTML(trx.kasir || "-")}</td>
                  <td class="clip-cell">${escapeHTML(itemNames(trx))}</td>
                  <td>${fmt(trx.subtotal)}</td>
                  <td class="success-text">${trx.diskon > 0 ? `- ${fmt(trx.diskon)}` : "-"}</td>
                  <td>${trx.ppn > 0 ? fmt(trx.ppn) : "-"}</td>
                  <td><strong>${fmt(trx.total)}</strong></td>
                  <td>${badge(trx.metode.toUpperCase(), trx.metode)}</td>
                  <td>${escapeHTML(trx.bank || "-")}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      ` : emptyState("ti-search-off", "Tidak ada hasil yang ditemukan")}
    </div>
  `;
}

function getPembayaranFiltered() {
  const search = state.pembayaran.search.trim().toLowerCase();
  return state.trxs.filter(trx => {
    if (state.pembayaran.method !== "semua" && trx.metode !== state.pembayaran.method) return false;
    if (state.pembayaran.dateFrom && trx.tanggal < state.pembayaran.dateFrom) return false;
    if (state.pembayaran.dateTo && trx.tanggal > `${state.pembayaran.dateTo}T23:59:59`) return false;
    if (search) {
      const text = `${trx.id} ${trx.kasir || ""} ${itemNames(trx)}`.toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });
}

// ===== BARCODE =====
function renderQrBarang() {
  const cats = ["Semua", ...new Set(state.items.map(item => item.kategori))];
  const filtered = state.qrKategori === "Semua" ? state.items : state.items.filter(item => item.kategori === state.qrKategori);

  return `
    ${pageHeader("Barcode Barang", "Barcode CODE128 untuk setiap item, bisa ditempel di produk.")}
    <div class="chip-group page-chip-row">
      ${cats.map(cat => `
        <button class="chip ${state.qrKategori === cat ? "active" : ""}" data-action="qr-kategori" data-kategori="${escapeHTML(cat)}">${escapeHTML(cat)}</button>
      `).join("")}
    </div>
    ${!state.qrReady ? `<div class="notice-line"><i class="ti ti-loader"></i><span>Memuat library barcode...</span></div>` : ""}
    <div class="item-grid">
      ${filtered.map(item => renderQrCard(item)).join("")}
    </div>
  `;
}

function renderQrCard(item) {
  const colors = KATCOLOR[item.kategori] || KATCOLOR.Lainnya;
  return `
    <div class="qr-card" data-item-id="${item.id}">
      <div class="qr-box">
        ${state.qrReady ? `<canvas class="barcode-target" id="barcode-${item.id}" data-id="${item.id}"></canvas>` : '<span style="color:var(--text-muted);font-size:11px">Memuat...</span>'}
      </div>
      <div class="qr-info">
        <strong>${escapeHTML(item.nama)}</strong>
        <span>${fmt(item.harga)}</span>
        <small>Stok: ${Number(item.stok) || 0}</small>
      </div>
      <span class="category-pill" style="background:${colors.bg};color:${colors.text};border-color:${colors.bd}">${escapeHTML(item.kategori)}</span>
      <code>${escapeHTML(item.kode)}</code>
      <button class="btn btn-sm btn-primary" data-action="download-qr" data-id="${item.id}">
        <i class="ti ti-download" style="font-size:12px"></i> Unduh Barcode
      </button>
    </div>
  `;
}

function renderQrCodes() {
  if (!state.qrReady || !window.JsBarcode) return;
  document.querySelectorAll(".barcode-target").forEach(target => {
    const item = state.items.find(e => String(e.id) === String(target.dataset.id));
    if (!item || target.dataset.rendered === "1") return;
    try {
      window.JsBarcode(target, item.kode || `ID-${item.id}`, {
        format: "CODE128", width: 1.35, height: 72,
        displayValue: true, font: "monospace", fontSize: 12,
        textMargin: 4, margin: 8, lineColor: "#0f172a", background: "#ffffff",
      });
      target.dataset.rendered = "1";
    } catch {
      const ctx = target.getContext("2d");
      ctx.clearRect(0, 0, target.width, target.height);
      ctx.fillStyle = "#ef4444"; ctx.font = "12px sans-serif";
      ctx.fillText("Barcode error", 12, 24);
    }
  });
}

function downloadQr(id) {
  const card = Array.from(document.querySelectorAll(".qr-card")).find(e => e.dataset.itemId === String(id));
  const item = state.items.find(e => String(e.id) === String(id));
  const canvas = card ? card.querySelector("canvas") : null;
  if (!canvas || !item) { showToast("Barcode belum siap", "error"); return; }
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `barcode-${item.nama.replace(/\s+/g,"-").toLowerCase()}.png`;
  link.click();
}

// ===== MODAL =====
function renderModal() {
  if (state.detailId) return renderDetailModal();
  if (state.barangModalOpen) return renderBarangModal();
  return "";
}

function closeModal() {
  state.detailId = null;
  state.barangModalOpen = false;
  state.editingItemId = null;
  render();
}

// ===== EVENTS =====
function bindEvents() {
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", handleActionClick));

  const harianDate = document.getElementById("harian-date");
  if (harianDate) harianDate.addEventListener("change", e => { state.harianDate = e.target.value || todayISO(); render(); });

  const laporanDate = document.getElementById("laporan-date");
  if (laporanDate) laporanDate.addEventListener("change", e => { state.laporanDate = e.target.value || todayISO(); render(); });

  const paySearch = document.getElementById("pay-search");
  if (paySearch) paySearch.addEventListener("input", e => { state.pembayaran.search = e.target.value; render(); });

  const payFrom = document.getElementById("pay-from");
  if (payFrom) payFrom.addEventListener("change", e => { state.pembayaran.dateFrom = e.target.value; render(); });

  const payTo = document.getElementById("pay-to");
  if (payTo) payTo.addEventListener("change", e => { state.pembayaran.dateTo = e.target.value; render(); });

  const barangForm = document.getElementById("barang-form");
  if (barangForm) {
    barangForm.addEventListener("submit", e => { e.preventDefault(); submitBarangForm(e.currentTarget); });
    barangForm.addEventListener("input", e => { if (!e.target.name) return; state.barangForm[e.target.name] = e.target.value; });
  }
}

function handleActionClick(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;

  if (action === "close-modal" && event.target !== event.currentTarget && !target.classList.contains("icon-btn")) return;

  switch (action) {
    case "toggle-sidebar": state.sidebarOpen = !state.sidebarOpen; render(); break;
    case "set-page": state.page = target.dataset.page || "dashboard"; render(); break;
    case "logout": sessionStorage.removeItem("currentUser"); window.location.href = "../login.html"; break;
    case "open-detail": state.detailId = target.dataset.id; render(); break;
    case "close-modal": closeModal(); break;
    case "open-add-item": openAddItem(); break;
    case "open-edit-item": openEditItem(target.dataset.id); break;
    case "delete-item": deleteItem(target.dataset.id); break;
    case "pay-method": state.pembayaran.method = target.dataset.method || "semua"; render(); break;
    case "qr-kategori": state.qrKategori = target.dataset.kategori || "Semua"; render(); break;
    case "download-qr": downloadQr(target.dataset.id); break;
    default: break;
  }
}