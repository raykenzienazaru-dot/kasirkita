// ===== HELPERS =====
const fmt = (n) => "Rp " + (Number(n) || 0).toLocaleString("id-ID");
const pct = (a, b) => b ? ((a / b) * 100).toFixed(1) + "%" : "0%";
const todayISO = () => new Date().toISOString().split("T")[0];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
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
  Makanan: { bg: "#dcfce7", text: "#15803d", bd: "#86efac" },
  Minuman: { bg: "#dbeafe", text: "#1d4ed8", bd: "#93c5fd" },
  Snack: { bg: "#fef9c3", text: "#a16207", bd: "#fde047" },
  ATK: { bg: "#fce7f3", text: "#be185d", bd: "#f9a8d4" },
  Lainnya: { bg: "#f1f5f9", text: "#475569", bd: "#cbd5e1" },
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
  harianDate: todayISO(),
  laporanDate: todayISO(),
  detailId: null,
  pembayaran: {
    method: "semua",
    dateFrom: "",
    dateTo: "",
    search: "",
  },
  qrKategori: "Semua",
  barangModalOpen: false,
  editingItemId: null,
  barangForm: {
    nama: "",
    kategori: "Makanan",
    harga: "",
    stok: "",
  },
};

// ===== STORAGE & SESSION =====
function loadCurrentUser() {
  const saved = sessionStorage.getItem("currentUser");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (error) {
    sessionStorage.removeItem("currentUser");
    return null;
  }
}

function loadTransactions() {
  try {
    const stored = JSON.parse(localStorage.getItem("riwayat") || "null");
    return stored && stored.length ? stored : genSampleData();
  } catch (error) {
    return genSampleData();
  }
}

function loadItems() {
  try {
    const stored = JSON.parse(localStorage.getItem("barang") || "null");
    const data = stored && stored.length ? stored : MENU_ITEMS;
    return data.map((item) => ({ ...item, kode: item.kode || createItemCode(item.nama) }));
  } catch (error) {
    return MENU_ITEMS;
  }
}

function saveItems() {
  localStorage.setItem("barang", JSON.stringify(state.items));
}

// ===== RENDER CORE =====
document.addEventListener("DOMContentLoaded", initAdmin);

function initAdmin() {
  state.currentUser = loadCurrentUser();

  if (!state.currentUser) {
    window.location.replace("../login.html");
    return;
  }

  state.trxs = loadTransactions();
  state.items = loadItems();
  state.qrReady = Boolean(window.JsBarcode);
  render();

  if (!state.qrReady) {
    waitForQrLibrary();
  }
}

function waitForQrLibrary() {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (window.JsBarcode) {
      clearInterval(timer);
      state.qrReady = true;
      render();
    }
    if (attempts > 40) clearInterval(timer);
  }, 250);
}

function render() {
  const focus = captureFocus();
  const root = document.getElementById("root");
  if (state.chart) {
    state.chart.destroy();
    state.chart = null;
  }

  if (!state.currentUser || state.currentUser.role !== "admin") {
    root.innerHTML = renderAccessDenied();
    bindEvents();
    return;
  }

  root.innerHTML = `
    <div class="admin-shell ${state.sidebarOpen ? "" : "sidebar-collapsed"}">
      ${renderSidebar()}
      <main class="admin-main">
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
  return {
    id: el.id,
    start: typeof el.selectionStart === "number" ? el.selectionStart : null,
    end: typeof el.selectionEnd === "number" ? el.selectionEnd : null,
  };
}

function restoreFocus(focus) {
  if (!focus) return;
  const el = document.getElementById(focus.id);
  if (!el) return;
  el.focus();
  if (focus.start !== null && typeof el.setSelectionRange === "function") {
    el.setSelectionRange(focus.start, focus.end);
  }
}

function afterRender() {
  if (state.page === "laporan") renderSalesChart();
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
    </div>
  `;
}

function renderSidebar() {
  return `
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><i class="ti ti-building-store"></i></div>
        <div class="brand-text">
          <strong>Kasirkita</strong>
          <span>Admin Panel</span>
        </div>
        <button class="sidebar-toggle" data-action="toggle-sidebar" aria-label="Toggle sidebar">
          <i class="ti ${state.sidebarOpen ? "ti-layout-sidebar-left-collapse" : "ti-layout-sidebar-left-expand"}"></i>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Navigasi Admin">
        ${SIDEBAR.map((item) => `
          <button class="sidebar-link ${state.page === item.key ? "active" : ""}" data-action="set-page" data-page="${item.key}" title="${escapeHTML(item.label)}">
            <i class="ti ${item.icon}"></i>
            <span>${escapeHTML(item.label)}</span>
          </button>
        `).join("")}
      </nav>

      <div class="sidebar-account">
        <div class="account-row">
          <div class="account-icon"><i class="ti ti-shield-check"></i></div>
          <div class="account-text">
            <strong>${escapeHTML(state.currentUser.displayName || "Administrator")}</strong>
            <span>${escapeHTML(state.currentUser.roleName || "Admin Panel")}</span>
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
  const pages = {
    dashboard: renderDashboard,
    harian: renderRiwayatHarian,
    laporan: renderLaporanHarian,
    barang: renderTambahBarang,
    pembayaran: renderHistoryPembayaran,
    qrbarang: renderQrBarang,
  };
  return (pages[state.page] || renderDashboard)();
}

function pageHeader(title, subtitle, extra = "") {
  return `
    <div class="page-head">
      <div>
        <h2>${escapeHTML(title)}</h2>
        <p>${escapeHTML(subtitle)}</p>
      </div>
      ${extra}
    </div>
  `;
}

function renderToasts() {
  if (!state.toasts.length) return '<div class="toast-stack"></div>';
  return `
    <div class="toast-stack">
      ${state.toasts.map((toast) => `
        <div class="toast ${toast.type === "error" ? "toast-error" : "toast-success"}">
          ${escapeHTML(toast.msg)}
        </div>
      `).join("")}
    </div>
  `;
}

function showToast(msg, type = "success") {
  const id = Date.now() + Math.random();
  state.toasts.push({ id, msg, type });
  render();
  setTimeout(() => {
    state.toasts = state.toasts.filter((toast) => toast.id !== id);
    render();
  }, 3000);
}

// ===== SMALL COMPONENTS =====
function badge(text, type = "default") {
  return `<span class="badge badge-${escapeHTML(type)}">${escapeHTML(text)}</span>`;
}

function statCard(icon, label, value, sub = "", accent = "teal") {
  return `
    <article class="metric-card accent-${accent}">
      <div class="metric-icon"><i class="ti ${icon}"></i></div>
      <div>
        <span>${escapeHTML(label)}</span>
        <strong>${escapeHTML(value)}</strong>
        ${sub ? `<small>${escapeHTML(sub)}</small>` : ""}
      </div>
    </article>
  `;
}

function progressBar(label, value, max, color = "#3b82f6") {
  const width = max ? Math.round((value / max) * 100) : 0;
  return `
    <div class="progress-row">
      <div class="progress-meta">
        <span>${escapeHTML(label)}</span>
        <strong>${fmt(value)}</strong>
      </div>
      <div class="progress-track">
        <span style="width:${width}%;background:${color}"></span>
      </div>
    </div>
  `;
}

function emptyState(icon, title, subtitle = "") {
  return `
    <div class="empty-admin">
      <i class="ti ${icon}"></i>
      <p>${escapeHTML(title)}</p>
      ${subtitle ? `<small>${escapeHTML(subtitle)}</small>` : ""}
    </div>
  `;
}

function itemNames(transaction) {
  return transaction.items.map((item) => item.nama).join(", ");
}

function transactionById(id) {
  return state.trxs.find((trx) => String(trx.id) === String(id));
}

// ===== DASHBOARD =====
function renderDashboard() {
  const todayText = new Date().toDateString();
  const today = state.trxs.filter((trx) => new Date(trx.tanggal).toDateString() === todayText);
  const totalToday = today.reduce((sum, trx) => sum + trx.total, 0);
  const totalAll = state.trxs.reduce((sum, trx) => sum + trx.total, 0);
  const totalItems = state.trxs.reduce((sum, trx) => sum + trx.items.reduce((itemSum, item) => itemSum + item.jumlah, 0), 0);
  const avgTrx = state.trxs.length ? Math.round(totalAll / state.trxs.length) : 0;
  const metMap = {};
  const katMap = {};

  state.trxs.forEach((trx) => {
    metMap[trx.metode] = (metMap[trx.metode] || 0) + trx.total;
    trx.items.forEach((item) => {
      katMap[item.kategori] = (katMap[item.kategori] || 0) + item.subtotal;
    });
  });

  const maxKat = Math.max(...Object.values(katMap), 1);
  const barColors = { tunai: "#3b82f6", qris: "#8b5cf6", transfer: "#ec4899" };
  const recent = state.trxs.slice(0, 6);

  return `
    ${pageHeader("Dashboard", "Ringkasan performa kasir")}
    <div class="metric-grid">
      ${statCard("ti-sun", "Pendapatan Hari Ini", fmt(totalToday), `${today.length} transaksi`, "teal")}
      ${statCard("ti-coin", "Total Pendapatan", fmt(totalAll), "Semua waktu", "blue")}
      ${statCard("ti-receipt", "Total Transaksi", String(state.trxs.length), `Rata-rata ${fmt(avgTrx)}`, "amber")}
      ${statCard("ti-package", "Item Terjual", String(totalItems), "Semua item", "purple")}
    </div>

    <div class="panel-grid two">
      <section class="panel">
        <h3>Penjualan per Kategori</h3>
        ${Object.entries(katMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => (
          progressBar(label, value, maxKat, (KATCOLOR[label] || KATCOLOR.Lainnya).bd)
        )).join("") || '<p class="muted-line">Belum ada data</p>'}
      </section>
      <section class="panel">
        <h3>Metode Pembayaran</h3>
        ${["tunai", "qris", "transfer"].map((method) => {
          const value = metMap[method] || 0;
          const count = state.trxs.filter((trx) => trx.metode === method).length;
          return `
            <div class="method-row">
              <div>
                <span class="method-dot" style="background:${barColors[method]}"></span>
                <div>
                  <strong>${escapeHTML(method)}</strong>
                  <small>${count} transaksi</small>
                </div>
              </div>
              <b>${fmt(value)}</b>
            </div>
          `;
        }).join("")}
      </section>
    </div>

    <section class="panel">
      <h3>Transaksi Terbaru</h3>
      ${recent.length ? `
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No. Trx</th>
                <th>Waktu</th>
                <th>Kasir</th>
                <th>Item</th>
                <th>Total</th>
                <th>Metode</th>
              </tr>
            </thead>
            <tbody>
              ${recent.map((trx) => `
                <tr>
                  <td><strong>#${String(trx.id).padStart(3, "0")}</strong></td>
                  <td>${new Date(trx.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td>${escapeHTML(trx.kasir || "-")}</td>
                  <td class="clip-cell">${escapeHTML(itemNames(trx))}</td>
                  <td><strong>${fmt(trx.total)}</strong></td>
                  <td>${badge(trx.metode.toUpperCase(), trx.metode)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : emptyState("ti-receipt-off", "Belum ada transaksi")}
    </section>
  `;
}

// ===== RIWAYAT HARIAN =====
function renderRiwayatHarian() {
  const filtered = state.trxs.filter((trx) => trx.tanggal.startsWith(state.harianDate));
  const totalHari = filtered.reduce((sum, trx) => sum + trx.total, 0);

  return `
    ${pageHeader("Riwayat Harian", "Transaksi berdasarkan tanggal")}
    <div class="toolbar">
      <input id="harian-date" class="input compact-input" type="date" value="${escapeHTML(state.harianDate)}" data-action="harian-date">
      <span class="toolbar-note">${filtered.length} transaksi - Total ${fmt(totalHari)}</span>
    </div>

    ${filtered.length ? `
      <div class="transaction-list">
        ${filtered.map((trx) => {
          const iconMap = { tunai: "ti-cash", qris: "ti-qrcode", transfer: "ti-building-bank" };
          return `
            <button class="transaction-card" data-action="open-detail" data-id="${trx.id}">
              <div class="transaction-icon method-${escapeHTML(trx.metode)}">
                <i class="ti ${iconMap[trx.metode] || "ti-cash"}"></i>
              </div>
              <div class="transaction-body">
                <div>
                  <strong>#${String(trx.id).padStart(3, "0")}</strong>
                  ${badge(trx.metode.toUpperCase(), trx.metode)}
                  ${trx.bank ? badge(trx.bank, "default") : ""}
                </div>
                <p>${escapeHTML(trx.items.map((item) => `${item.nama} x${item.jumlah}`).join(", "))}</p>
              </div>
              <div class="transaction-total">
                <strong>${fmt(trx.total)}</strong>
                <span>${new Date(trx.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                ${trx.kasir ? `<span>${escapeHTML(trx.kasir)}</span>` : ""}
              </div>
            </button>
          `;
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
      <div class="modal-content detail-modal" role="dialog" aria-modal="true" aria-label="Detail Transaksi">
        <div class="modal-head">
          <h3>Detail Transaksi #${String(trx.id).padStart(3, "0")}</h3>
          <button class="icon-btn" data-action="close-modal" aria-label="Tutup"><i class="ti ti-x"></i></button>
        </div>
        <div class="detail-grid">
          <div><span>Tanggal</span><strong>${new Date(trx.tanggal).toLocaleString("id-ID")}</strong></div>
          <div><span>Kasir</span><strong>${escapeHTML(trx.kasir || "-")}</strong></div>
          <div><span>Metode</span><strong>${escapeHTML(trx.metode + (trx.bank ? " - " + trx.bank : ""))}</strong></div>
          <div><span>Catatan</span><strong>${escapeHTML(trx.catatan || "-")}</strong></div>
        </div>
        <div class="detail-section">
          <h4>Item</h4>
          ${trx.items.map((item) => `
            <div class="detail-row">
              <span>${escapeHTML(item.nama)} <small>x${item.jumlah}</small></span>
              <strong>${fmt(item.subtotal)}</strong>
            </div>
          `).join("")}
        </div>
        <div class="detail-section">
          ${summaryRows.map(([label, value, total]) => `
            <div class="detail-row ${total ? "is-total" : ""}">
              <span>${escapeHTML(label)}</span>
              <strong>${escapeHTML(value)}</strong>
            </div>
          `).join("")}
          ${trx.metode === "tunai" ? `
            <div class="detail-row">
              <span>Kembalian</span>
              <strong>${fmt((trx.uangDiterima || 0) - trx.total)}</strong>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

// ===== LAPORAN HARIAN =====
function renderLaporanHarian() {
  const filtered = getLaporanFiltered();
  const total = filtered.reduce((sum, trx) => sum + trx.total, 0);
  const avgTrx = filtered.length ? Math.round(total / filtered.length) : 0;
  const totalItems = filtered.reduce((sum, trx) => sum + trx.items.reduce((itemSum, item) => itemSum + item.jumlah, 0), 0);
  const totalPPN = filtered.reduce((sum, trx) => sum + (trx.ppn || 0), 0);
  const totalDiskon = filtered.reduce((sum, trx) => sum + (trx.diskon || 0), 0);
  const katMap = {};
  const metMap = {};
  const hourMap = {};
  const kasirMap = {};

  filtered.forEach((trx) => {
    metMap[trx.metode] = (metMap[trx.metode] || 0) + trx.total;
    hourMap[new Date(trx.tanggal).getHours()] = (hourMap[new Date(trx.tanggal).getHours()] || 0) + trx.total;
    if (trx.kasir) kasirMap[trx.kasir] = (kasirMap[trx.kasir] || 0) + trx.total;
    trx.items.forEach((item) => {
      katMap[item.kategori] = (katMap[item.kategori] || 0) + item.subtotal;
    });
  });

  const maxKat = Math.max(...Object.values(katMap), 1);
  const maxHour = Math.max(...Object.values(hourMap), 1);
  const maxKasir = Math.max(...Object.values(kasirMap), 1);
  const barColors = { tunai: "#3b82f6", qris: "#8b5cf6", transfer: "#ec4899" };

  return `
    ${pageHeader("Laporan Harian", "Analisis mendalam per hari")}
    <div class="toolbar">
      <input id="laporan-date" class="input compact-input" type="date" value="${escapeHTML(state.laporanDate)}" data-action="laporan-date">
    </div>
    <section class="panel chart-panel">
      <h3>Grafik Pendapatan Harian</h3>
      <div class="chart-box">
        <canvas id="sales-chart"></canvas>
      </div>
      <p id="chart-fallback" class="muted-line" hidden>Chart.js belum termuat, data tetap tampil di ringkasan bawah.</p>
    </section>
    <div class="metric-grid five">
      ${statCard("ti-coin", "Total Pendapatan", fmt(total), `${filtered.length} transaksi`, "teal")}
      ${statCard("ti-trending-up", "Rata-rata Transaksi", fmt(avgTrx), "", "blue")}
      ${statCard("ti-package", "Item Terjual", String(totalItems), "", "amber")}
      ${statCard("ti-rosette-discount", "Total Diskon", fmt(totalDiskon), "", "rose")}
      ${statCard("ti-calculator", "Total PPN", fmt(totalPPN), "", "purple")}
    </div>

    ${filtered.length ? `
      <div class="panel-grid two">
        <section class="panel">
          <h3>Penjualan per Kategori</h3>
          ${Object.entries(katMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => (
            progressBar(label, value, maxKat, (KATCOLOR[label] || KATCOLOR.Lainnya).bd)
          )).join("")}
        </section>
        <section class="panel">
          <h3>Metode Pembayaran</h3>
          ${["tunai", "qris", "transfer"].map((method) => {
            const value = metMap[method] || 0;
            return `
              <div class="payment-progress">
                <div>
                  <span><i style="background:${barColors[method]}"></i>${escapeHTML(method)}</span>
                  <strong>${fmt(value)} - ${pct(value, total)}</strong>
                </div>
                <div class="progress-track"><span style="width:${pct(value, total)};background:${barColors[method]}"></span></div>
              </div>
            `;
          }).join("")}
        </section>
        <section class="panel">
          <h3>Penjualan per Jam</h3>
          ${Object.entries(hourMap).sort((a, b) => Number(a[0]) - Number(b[0])).map(([hour, value]) => (
            progressBar(`Pukul ${String(hour).padStart(2, "0")}:00`, value, maxHour, "#0ea5e9")
          )).join("") || '<p class="muted-line">Belum ada data</p>'}
        </section>
        <section class="panel">
          <h3>Performa Kasir</h3>
          ${Object.entries(kasirMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => (
            progressBar(label, value, maxKasir, "#8b5cf6")
          )).join("") || '<p class="muted-line">Belum ada data</p>'}
        </section>
      </div>
    ` : emptyState("ti-chart-off", "Tidak ada data untuk tanggal ini")}
  `;
}

function getLaporanFiltered() {
  return state.trxs.filter((trx) => trx.tanggal.startsWith(state.laporanDate));
}

function renderSalesChart() {
  const canvas = document.getElementById("sales-chart");
  const fallback = document.getElementById("chart-fallback");
  if (state.chart) {
    state.chart.destroy();
    state.chart = null;
  }
  if (!canvas || !window.Chart) {
    if (fallback) fallback.hidden = false;
    return;
  }

  const filtered = getLaporanFiltered();
  const labels = filtered.map((trx) => new Date(trx.tanggal).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
  const data = filtered.map((trx) => trx.total);

  state.chart = new window.Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Pendapatan",
        data,
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.2)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#60a5fa",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#cbd5e1" } },
      },
      scales: {
        x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.12)" } },
        y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.12)" }, beginAtZero: true },
      },
    },
  });
}

// ===== BARANG =====
function renderTambahBarang() {
  return `
    ${pageHeader(
      "Tambah Barang",
      "Tambah barang baru dan buat barcode panjang otomatis.",
      `<button class="btn btn-primary" data-action="open-add-item"><i class="ti ti-plus"></i>Tambah Barang</button>`
    )}
    ${state.items.length ? `
      <div class="item-grid wide">
        ${state.items.map((item) => `
          <article class="item-card">
            ${renderQrCard(item)}
            <div class="item-actions">
              <button class="btn" data-action="open-edit-item" data-id="${item.id}">Edit</button>
              <button class="btn btn-danger ghost-danger" data-action="delete-item" data-id="${item.id}">Hapus</button>
            </div>
          </article>
        `).join("")}
      </div>
    ` : emptyState("ti-package", "Belum ada barang", "Tambahkan data barang untuk membuat barcode otomatis.")}
  `;
}

function renderBarangModal() {
  if (!state.barangModalOpen) return "";
  const isEditing = Boolean(state.editingItemId);
  return `
    <div class="modal-overlay" data-action="close-modal">
      <div class="modal-content" role="dialog" aria-modal="true" aria-label="${isEditing ? "Edit Barang" : "Tambah Barang"}">
        <div class="modal-head">
          <h3>${isEditing ? "Edit Barang" : "Tambah Barang"}</h3>
          <button class="icon-btn" data-action="close-modal" aria-label="Tutup"><i class="ti ti-x"></i></button>
        </div>
        <form id="barang-form" class="admin-form">
          <div class="field">
            <label class="field-label" for="barang-nama">Nama Barang</label>
            <input id="barang-nama" class="input" name="nama" value="${escapeHTML(state.barangForm.nama)}" placeholder="Nama barang">
          </div>
          <div class="field">
            <label class="field-label" for="barang-kategori">Kategori</label>
            <select id="barang-kategori" class="input" name="kategori">
              ${["Makanan", "Minuman", "Snack", "ATK", "Lainnya"].map((kat) => `
                <option ${state.barangForm.kategori === kat ? "selected" : ""}>${kat}</option>
              `).join("")}
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="barang-harga">Harga</label>
            <input id="barang-harga" class="input" name="harga" type="number" min="0" value="${escapeHTML(state.barangForm.harga)}" placeholder="Harga satuan">
          </div>
          <div class="field">
            <label class="field-label" for="barang-stok">Stok</label>
            <input id="barang-stok" class="input" name="stok" type="number" min="0" value="${escapeHTML(state.barangForm.stok)}" placeholder="Jumlah stok">
          </div>
          <button class="btn btn-primary form-submit" type="submit">${isEditing ? "Simpan Perubahan" : "Tambah Barang"}</button>
        </form>
      </div>
    </div>
  `;
}

function openAddItem() {
  state.editingItemId = null;
  state.barangForm = { nama: "", kategori: "Makanan", harga: "", stok: "" };
  state.barangModalOpen = true;
  render();
}

function openEditItem(id) {
  const item = state.items.find((entry) => String(entry.id) === String(id));
  if (!item) return;
  state.editingItemId = item.id;
  state.barangForm = {
    nama: item.nama,
    kategori: item.kategori,
    harga: String(item.harga),
    stok: String(item.stok),
  };
  state.barangModalOpen = true;
  render();
}

function submitBarangForm(form) {
  const nama = form.nama.value.trim();
  const kategori = form.kategori.value;
  const harga = Number(form.harga.value);
  const stok = Number(form.stok.value);

  if (!nama) {
    showToast("Nama barang wajib diisi", "error");
    return;
  }
  if (!harga || harga <= 0) {
    showToast("Harga harus lebih dari 0", "error");
    return;
  }
  if (Number.isNaN(stok) || stok < 0) {
    showToast("Stok harus angka valid", "error");
    return;
  }

  if (state.editingItemId) {
    state.items = state.items.map((item) => String(item.id) === String(state.editingItemId)
      ? { ...item, nama, kategori, harga, stok, kode: item.kode || createItemCode(nama) }
      : item);
    showToast("Barang diperbarui");
  } else {
    state.items = [...state.items, { id: Date.now(), nama, kategori, harga, stok, kode: createItemCode(nama) }];
    showToast("Barang baru ditambahkan");
  }

  saveItems();
  state.barangModalOpen = false;
  state.editingItemId = null;
  render();
}

function deleteItem(id) {
  if (!confirm("Hapus barang ini?")) return;
  state.items = state.items.filter((item) => String(item.id) !== String(id));
  saveItems();
  showToast("Barang dihapus", "error");
}

// ===== HISTORY PEMBAYARAN =====
function renderHistoryPembayaran() {
  const filtered = getPembayaranFiltered();
  const totalFiltered = filtered.reduce((sum, trx) => sum + trx.total, 0);
  const counts = { tunai: 0, qris: 0, transfer: 0 };
  filtered.forEach((trx) => {
    if (counts[trx.metode] !== undefined) counts[trx.metode]++;
  });

  return `
    ${pageHeader("History Pembayaran", "Semua riwayat transaksi dengan filter")}
    <div class="filter-bar">
      <input id="pay-search" class="input" value="${escapeHTML(state.pembayaran.search)}" placeholder="Cari transaksi..." data-action="pay-search">
      <input id="pay-from" class="input compact-input" type="date" value="${escapeHTML(state.pembayaran.dateFrom)}" data-action="pay-from">
      <input id="pay-to" class="input compact-input" type="date" value="${escapeHTML(state.pembayaran.dateTo)}" data-action="pay-to">
      <div class="chip-group">
        ${["semua", "tunai", "qris", "transfer"].map((method) => `
          <button class="chip ${state.pembayaran.method === method ? "active" : ""}" data-action="pay-method" data-method="${method}">
            ${method === "semua" ? "Semua" : method.toUpperCase()}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="mini-stat-grid">
      <div><span>Hasil Filter</span><strong>${filtered.length} trx</strong></div>
      <div><span>Total</span><strong>${fmt(totalFiltered)}</strong></div>
      <div><span>Tunai</span><strong>${counts.tunai} trx</strong></div>
      <div><span>QRIS & Transfer</span><strong>${counts.qris + counts.transfer} trx</strong></div>
    </div>
    <section class="panel no-padding">
      ${filtered.length ? `
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No. Trx</th>
                <th>Tanggal & Waktu</th>
                <th>Kasir</th>
                <th>Item</th>
                <th>Subtotal</th>
                <th>Diskon</th>
                <th>PPN</th>
                <th>Total</th>
                <th>Metode</th>
                <th>Bank</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((trx) => `
                <tr>
                  <td><strong>#${String(trx.id).padStart(3, "0")}</strong></td>
                  <td>${new Date(trx.tanggal).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td>${escapeHTML(trx.kasir || "-")}</td>
                  <td class="clip-cell">${escapeHTML(itemNames(trx))}</td>
                  <td>${fmt(trx.subtotal)}</td>
                  <td class="success-text">${trx.diskon > 0 ? `- ${fmt(trx.diskon)}` : "-"}</td>
                  <td>${trx.ppn > 0 ? fmt(trx.ppn) : "-"}</td>
                  <td><strong>${fmt(trx.total)}</strong></td>
                  <td>${badge(trx.metode.toUpperCase(), trx.metode)}</td>
                  <td>${escapeHTML(trx.bank || "-")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : emptyState("ti-search-off", "Tidak ada hasil yang ditemukan")}
    </section>
  `;
}

function getPembayaranFiltered() {
  const search = state.pembayaran.search.trim().toLowerCase();
  return state.trxs.filter((trx) => {
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

// ===== BARCODE BARANG =====
function renderQrBarang() {
  const cats = ["Semua", ...new Set(state.items.map((item) => item.kategori))];
  const filtered = state.qrKategori === "Semua"
    ? state.items
    : state.items.filter((item) => item.kategori === state.qrKategori);

  return `
    ${pageHeader("Barcode Barang", "Barcode panjang untuk setiap item menu, berisi kode barang yang bisa ditempel di produk.")}
    <div class="chip-group page-chip-row">
      ${cats.map((cat) => `
        <button class="chip ${state.qrKategori === cat ? "active" : ""}" data-action="qr-kategori" data-kategori="${escapeHTML(cat)}">${escapeHTML(cat)}</button>
      `).join("")}
    </div>
    ${state.qrReady ? "" : `
      <div class="notice-line">
        <i class="ti ti-loader"></i>
        <span>Memuat library barcode...</span>
      </div>
    `}
    <div class="item-grid">
      ${filtered.map((item) => renderQrCard(item)).join("")}
    </div>
  `;
}

function renderQrCard(item) {
  const colors = KATCOLOR[item.kategori] || KATCOLOR.Lainnya;
  return `
    <div class="qr-card" data-item-id="${item.id}">
      <div class="qr-box">
        ${state.qrReady ? `<canvas class="barcode-target" id="barcode-${item.id}" data-id="${item.id}"></canvas>` : '<span>Memuat...</span>'}
      </div>
      <div class="qr-info">
        <strong>${escapeHTML(item.nama)}</strong>
        <span>${fmt(item.harga)}</span>
        <small>Stok: ${Number(item.stok) || 0}</small>
      </div>
      <span class="category-pill" style="background:${colors.bg};color:${colors.text};border-color:${colors.bd}">${escapeHTML(item.kategori)}</span>
      <code>${escapeHTML(item.kode)}</code>
      <button class="btn btn-sm" data-action="download-qr" data-id="${item.id}">Unduh Barcode</button>
    </div>
  `;
}

function renderQrCodes() {
  if (!state.qrReady || !window.JsBarcode) return;
  document.querySelectorAll(".barcode-target").forEach((target) => {
    const item = state.items.find((entry) => String(entry.id) === String(target.dataset.id));
    if (!item || target.dataset.rendered === "1") return;
    try {
      window.JsBarcode(target, item.kode || `ID-${item.id}`, {
        format: "CODE128",
        width: 1.35,
        height: 72,
        displayValue: true,
        font: "monospace",
        fontSize: 12,
        textMargin: 4,
        margin: 8,
        lineColor: "#0f172a",
        background: "#ffffff",
      });
      target.dataset.rendered = "1";
    } catch (error) {
      const context = target.getContext("2d");
      context.clearRect(0, 0, target.width, target.height);
      context.fillStyle = "#b91c1c";
      context.font = "12px sans-serif";
      context.fillText("Barcode error", 12, 24);
    }
  });
}

function downloadQr(id) {
  const card = Array.from(document.querySelectorAll(".qr-card"))
    .find((entry) => entry.dataset.itemId === String(id));
  const item = state.items.find((entry) => String(entry.id) === String(id));
  const canvas = card ? card.querySelector("canvas") : null;
  if (!canvas || !item) {
    showToast("Barcode belum siap", "error");
    return;
  }
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `barcode-${item.nama.replace(/\s+/g, "-").toLowerCase()}.png`;
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
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", handleActionClick);
  });

  const harianDate = document.getElementById("harian-date");
  if (harianDate) {
    harianDate.addEventListener("change", (event) => {
      state.harianDate = event.target.value || todayISO();
      render();
    });
  }

  const laporanDate = document.getElementById("laporan-date");
  if (laporanDate) {
    laporanDate.addEventListener("change", (event) => {
      state.laporanDate = event.target.value || todayISO();
      render();
    });
  }

  const paySearch = document.getElementById("pay-search");
  if (paySearch) {
    paySearch.addEventListener("input", (event) => {
      state.pembayaran.search = event.target.value;
      render();
    });
  }

  const payFrom = document.getElementById("pay-from");
  if (payFrom) {
    payFrom.addEventListener("change", (event) => {
      state.pembayaran.dateFrom = event.target.value;
      render();
    });
  }

  const payTo = document.getElementById("pay-to");
  if (payTo) {
    payTo.addEventListener("change", (event) => {
      state.pembayaran.dateTo = event.target.value;
      render();
    });
  }

  const barangForm = document.getElementById("barang-form");
  if (barangForm) {
    barangForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitBarangForm(event.currentTarget);
    });
    barangForm.addEventListener("input", (event) => {
      if (!event.target.name) return;
      state.barangForm[event.target.name] = event.target.value;
    });
  }
}

function handleActionClick(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;

  if (action === "close-modal" && event.target !== event.currentTarget && !target.classList.contains("icon-btn")) {
    return;
  }

  switch (action) {
    case "toggle-sidebar":
      state.sidebarOpen = !state.sidebarOpen;
      render();
      break;
    case "set-page":
      state.page = target.dataset.page || "dashboard";
      render();
      break;
    case "logout":
      sessionStorage.removeItem("currentUser");
      window.location.href = "../login.html";
      break;
    case "open-detail":
      state.detailId = target.dataset.id;
      render();
      break;
    case "close-modal":
      closeModal();
      break;
    case "open-add-item":
      openAddItem();
      break;
    case "open-edit-item":
      openEditItem(target.dataset.id);
      break;
    case "delete-item":
      deleteItem(target.dataset.id);
      break;
    case "pay-method":
      state.pembayaran.method = target.dataset.method || "semua";
      render();
      break;
    case "qr-kategori":
      state.qrKategori = target.dataset.kategori || "Semua";
      render();
      break;
    case "download-qr":
      downloadQr(target.dataset.id);
      break;
    default:
      break;
  }
}
