// ===== SESSION SYSTEM =====
let currentUser = null;

function handleLogout() {
  if (!confirm('Yakin ingin keluar?')) return;
  sessionStorage.removeItem('currentUser');
  currentUser = null;
  window.location.href = '../login.html';
}

function updateSessionDisplay() {
  if (!currentUser) return;
  document.getElementById('session-icon').innerHTML = currentUser.role === 'admin'
    ? icon('ti-shield-check')
    : icon('ti-user');
  document.getElementById('session-name').textContent = currentUser.displayName;
  const roleEl = document.getElementById('session-role');
  roleEl.textContent = currentUser.roleName;
  if (currentUser.role === 'admin') {
    roleEl.classList.add('admin-role');
  } else {
    roleEl.classList.remove('admin-role');
  }
}

function applyRolePermissions() {
  document.body.classList.remove('is-admin');
}

function checkSession() {
  const saved = sessionStorage.getItem('currentUser');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      if (currentUser.role !== 'user') { window.location.href = '../admin/index.html'; return; }
      document.getElementById('app-wrapper').style.display = '';
      applyRolePermissions();
      updateSessionDisplay();
      initApp();
    } catch(e) {
      sessionStorage.removeItem('currentUser');
      window.location.href = '../login.html';
    }
  } else {
    window.location.href = '../login.html';
  }
}

// ===== STATE =====
let daftarBelanja = [];
let riwayat = JSON.parse(localStorage.getItem('riwayat') || '[]');
let settings = JSON.parse(localStorage.getItem('settings') || '{}');
let metodePembayaran = 'tunai';
let bankDipilih = 'BRI';
let noTransaksi = parseInt(localStorage.getItem('noTrx') || '1');
let daftarBarang = [];
let katalogSearch = '';
let katalogKategori = 'Semua';

const bankData = {
  BRI: { no: settings.bri || '1234-5678-9012', nama: 'Kantin Sekolah' },
  BCA: { no: settings.bca || '9876-5432-1098', nama: 'Kantin Sekolah' },
  Mandiri: { no: settings.mandiri || '1111-2222-3333', nama: 'Kantin Sekolah' },
  BNI: { no: settings.bni || '4444-5555-6666', nama: 'Kantin Sekolah' }
};

const defaultBarang = [
  { id: 1, nama: 'Nasi Goreng', harga: 8000, kategori: 'Makanan', stok: 50 },
  { id: 2, nama: 'Mie Goreng', harga: 7000, kategori: 'Makanan', stok: 40 },
  { id: 3, nama: 'Ayam Bakar', harga: 12000, kategori: 'Makanan', stok: 30 },
  { id: 4, nama: 'Gado-Gado', harga: 9000, kategori: 'Makanan', stok: 25 },
  { id: 5, nama: 'Es Teh', harga: 3000, kategori: 'Minuman', stok: 100 },
  { id: 6, nama: 'Air Mineral', harga: 2000, kategori: 'Minuman', stok: 200 },
  { id: 7, nama: 'Jus Jeruk', harga: 5000, kategori: 'Minuman', stok: 60 },
  { id: 8, nama: 'Es Campur', harga: 6000, kategori: 'Minuman', stok: 45 },
  { id: 9, nama: 'Keripik', harga: 2500, kategori: 'Snack', stok: 80 },
  { id: 10, nama: 'Roti Bakar', harga: 4000, kategori: 'Snack', stok: 35 },
  { id: 11, nama: 'Pena', harga: 3000, kategori: 'ATK', stok: 150 },
  { id: 12, nama: 'Penggaris', harga: 5000, kategori: 'ATK', stok: 70 },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
});

function initApp() {
  updateDate();
  refreshBarangAdmin(false);
  if (window.supabaseClient) {
    loadTransactionsFromSupabase().then(() => {
      updateBadge();
    });
  }
  renderQuickCash();
  loadSettings();
  updateBadge();
  hitungTotal();
  syncBankDisplay();
  const search = document.getElementById('productSearch');
  if (search) search.focus();
  document.getElementById('jumlahBarang').addEventListener('keydown', e => { if (e.key === 'Enter') focusFirstProduct(); });
}

function updateDate() {
  const now = new Date();
  document.getElementById('current-date').textContent = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ===== NAVIGATION =====
async function loadTransactionsFromSupabase() {
  if (!window.supabaseClient) return false;
  try {
    const { data, error } = await window.supabaseClient
      .from('transactions')
      .select('*, transaction_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      riwayat = data.map(trx => ({
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
        uangDiterima: trx.uang_received || trx.total_amount,
        kembalian: trx.change_amount || 0,
        catatan: trx.notes,
        kasir: trx.created_by,
        items: (trx.transaction_items || []).map(item => ({
          id: item.product_id,
          kode: item.product_code,
          nama: item.product_name,
          harga: item.unit_price,
          jumlah: item.quantity,
          subtotal: item.line_subtotal,
          kategori: item.product_category || 'Lainnya'
        }))
      }));
      updateBadge();
      return true;
    }
  } catch (err) {
    console.error("Error loadTransactionsFromSupabase:", err);
  }
  return false;
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  
  if (name === 'history' || name === 'laporan') {
    if (window.supabaseClient) {
      loadTransactionsFromSupabase().then(() => {
        if (name === 'history') renderHistory();
        if (name === 'laporan') renderLaporan();
      });
    } else {
      if (name === 'history') renderHistory();
      if (name === 'laporan') renderLaporan();
    }
  }
  return false;
}

// ===== BARANG ADMIN =====
function normalisasiBarang(item, index) {
  const nama = String(item.nama || item.name || '').trim();
  const harga = Number(item.harga || item.price || 0);
  const stok = Number(item.stok ?? item.stock ?? 0);
  return {
    id: item.id ?? `default-${index + 1}`,
    kode: item.kode || item.code || `BRG-${String(index + 1).padStart(3, '0')}`,
    nama,
    harga,
    kategori: item.kategori || item.category || 'Lainnya',
    stok: Number.isFinite(stok) ? Math.max(0, stok) : 0
  };
}

function loadBarangAdmin() {
  try {
    const stored = JSON.parse(localStorage.getItem('barang') || 'null');
    const source = stored && stored.length ? stored : defaultBarang;
    return source
      .map(normalisasiBarang)
      .filter(item => item.nama && item.harga > 0);
  } catch (e) {
    return defaultBarang.map(normalisasiBarang);
  }
}

function saveBarangAdmin() {
  localStorage.setItem('barang', JSON.stringify(daftarBarang));
}

async function refreshBarangAdmin(showMessage = true) {
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (!error && data) {
        daftarBarang = data.map((item, index) => ({
          id: item.id,
          kode: item.code || `BRG-${index + 1}`,
          nama: item.name,
          harga: item.price,
          kategori: item.category || 'Lainnya',
          stok: item.stock || 0
        }));
        renderKategoriBarang();
        renderProductCatalog();
        if (showMessage) showToast('Data barang dari Supabase berhasil sinkron', 'success');
        return;
      } else if (error) {
        console.warn("Gagal sinkron produk dengan Supabase:", error.message);
      }
    } catch (err) {
      console.error("Error refreshBarangAdmin:", err);
    }
  }

  // Fallback
  daftarBarang = loadBarangAdmin();
  renderKategoriBarang();
  renderProductCatalog();
  if (showMessage) showToast('Gagal terhubung Supabase. Menggunakan data demo offline.', 'info');
}

function renderKategoriBarang() {
  const select = document.getElementById('productCategory');
  if (!select) return;
  const categories = ['Semua', ...new Set(daftarBarang.map(item => item.kategori))];
  if (!categories.includes(katalogKategori)) katalogKategori = 'Semua';
  select.innerHTML = categories.map(kategori =>
    `<option value="${escapeHTML(kategori)}" ${katalogKategori === kategori ? 'selected' : ''}>${kategori === 'Semua' ? 'Semua Kategori' : escapeHTML(kategori)}</option>`
  ).join('');
}

function getCartQty(productId) {
  return daftarBelanja
    .filter(item => String(item.id) === String(productId))
    .reduce((sum, item) => sum + item.jumlah, 0);
}

function getAvailableStock(product) {
  return Math.max(0, (Number(product.stok) || 0) - getCartQty(product.id));
}

function getFilteredBarang() {
  const q = katalogSearch.trim().toLowerCase();
  return daftarBarang.filter(item => {
    const matchCategory = katalogKategori === 'Semua' || item.kategori === katalogKategori;
    const text = `${item.nama} ${item.kode || ''} ${item.kategori || ''}`.toLowerCase();
    return matchCategory && (!q || text.includes(q));
  });
}

function renderProductCatalog() {
  const grid = document.getElementById('product-grid');
  const summary = document.getElementById('catalog-summary');
  if (!grid || !summary) return;

  const filtered = getFilteredBarang();
  const totalStock = daftarBarang.reduce((sum, item) => sum + (Number(item.stok) || 0), 0);
  summary.innerHTML = `
    <span>${filtered.length} barang tampil</span>
    <span>${totalStock} stok tersedia</span>
  `;

  if (!daftarBarang.length) {
    grid.innerHTML = `<div class="empty-state product-empty"><div class="empty-icon">${icon('ti-package-off')}</div><p>Belum ada barang dari admin</p><small>Tambahkan barang lewat halaman admin.</small></div>`;
    return;
  }

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state product-empty"><div class="empty-icon">${icon('ti-search-off')}</div><p>Barang tidak ditemukan</p><small>Coba kata kunci atau kategori lain.</small></div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const available = getAvailableStock(item);
    const lowStock = available > 0 && available <= 5;
    return `
      <button class="product-card ${available <= 0 ? 'is-empty' : ''}" onclick="tambahProdukKeKeranjang('${encodeURIComponent(String(item.id))}')" ${available <= 0 ? 'disabled' : ''}>
        <div class="product-top">
          <span class="product-category">${escapeHTML(item.kategori)}</span>
          <span class="product-stock ${lowStock ? 'low' : ''}">${available > 0 ? `${available} stok` : 'Habis'}</span>
        </div>
        <strong>${escapeHTML(item.nama)}</strong>
        <span class="product-price">${fmt(item.harga)}</span>
        <code>${escapeHTML(item.kode || '')}</code>
      </button>
    `;
  }).join('');
}

function handleProductSearch(value) {
  katalogSearch = value;
  renderProductCatalog();
}

function handleProductCategory(value) {
  katalogKategori = value || 'Semua';
  renderProductCatalog();
}

function focusFirstProduct() {
  const first = document.querySelector('.product-card:not([disabled])');
  if (first) first.focus();
}

function tambahProdukKeKeranjang(productId) {
  productId = decodeURIComponent(productId);
  const product = daftarBarang.find(item => String(item.id) === String(productId));
  const jumlah = parseInt(document.getElementById('jumlahBarang').value) || 1;

  if (!product) { showToast('Barang tidak ditemukan di data admin', 'error'); return; }
  if (jumlah <= 0) { showToast('Jumlah harus lebih dari 0!', 'error'); return; }

  const available = getAvailableStock(product);
  if (available <= 0) { showToast(`${product.nama} sedang habis`, 'error'); return; }
  if (jumlah > available) { showToast(`Stok ${product.nama} tersisa ${available}`, 'error'); return; }

  const existing = daftarBelanja.find(item => String(item.id) === String(product.id));
  if (existing) {
    existing.jumlah += jumlah;
    existing.subtotal = existing.harga * existing.jumlah;
  } else {
    daftarBelanja.push({
      id: product.id,
      kode: product.kode,
      nama: product.nama,
      harga: product.harga,
      jumlah,
      subtotal: product.harga * jumlah,
      kategori: product.kategori
    });
  }

  tampilkanData();
  hitungTotal();
  clearForm();
  renderProductCatalog();
  showToast(`${product.nama} ditambahkan`, 'success');
}

function tambahBarang() {
  showToast('Pilih barang dari katalog admin', 'info');
}

function clearForm() {
  document.getElementById('jumlahBarang').value = '1';
  const search = document.getElementById('productSearch');
  if (search) search.focus();
}

function ubahQty(delta) {
  const el = document.getElementById('jumlahBarang');
  el.value = Math.max(1, (parseInt(el.value) || 1) + delta);
}

// ===== TAMPIL DATA =====
function tampilkanData() {
  const tbody = document.getElementById('dataKasir');

  if (daftarBelanja.length === 0) {
    tbody.innerHTML = `<tr class="empty-cart" id="empty-cart"><td colspan="5"><div class="empty-state"><div class="empty-icon">${icon('ti-shopping-cart')}</div><p>Keranjang masih kosong</p><small>Pilih barang dari katalog admin di sebelah kiri</small></div></td></tr>`;
    document.getElementById('item-count').textContent = '0 item';
    return;
  }

  document.getElementById('item-count').textContent = `${daftarBelanja.length} item`;

  tbody.innerHTML = daftarBelanja.map((b, i) => `
    <tr>
      <td>
        <div style="font-weight:600">${escapeHTML(b.nama)}</div>
        <span class="kategori-badge">${escapeHTML(b.kategori)}</span>
        ${b.kode ? `<span class="kode-badge">${escapeHTML(b.kode)}</span>` : ''}
      </td>
      <td style="text-align:right">${fmt(b.harga)}</td>
      <td>
        <div class="qty-inline">
          <button class="qty-inline-btn" onclick="ubahQtyItem(${i}, -1)">−</button>
          <span class="qty-inline-val">${b.jumlah}</span>
          <button class="qty-inline-btn" onclick="ubahQtyItem(${i}, 1)">+</button>
        </div>
      </td>
      <td style="text-align:right;font-weight:600;color:var(--accent3)">${fmt(b.subtotal)}</td>
      <td><button class="delete-btn" onclick="hapusItem(${i})" aria-label="Hapus item">${icon('ti-trash')}</button></td>
    </tr>
  `).join('');
}

function ubahQtyItem(i, delta) {
  const item = daftarBelanja[i];
  const product = daftarBarang.find(b => String(b.id) === String(item.id));
  const nextQty = item.jumlah + delta;

  if (nextQty <= 0) {
    daftarBelanja.splice(i, 1);
  } else {
    if (product && nextQty > Number(product.stok || 0)) {
      showToast(`Stok ${item.nama} tersisa ${product.stok}`, 'error');
      return;
    }
    item.jumlah = nextQty;
    item.subtotal = item.harga * item.jumlah;
  }
  tampilkanData();
  hitungTotal();
  renderProductCatalog();
}

function hapusItem(i) {
  const nama = daftarBelanja[i].nama;
  daftarBelanja.splice(i, 1);
  tampilkanData();
  hitungTotal();
  renderProductCatalog();
  showToast(`${nama} dihapus`, 'info');
}

function resetKeranjang() {
  if (daftarBelanja.length === 0) return;
  daftarBelanja = [];
  tampilkanData();
  hitungTotal();
  document.getElementById('uangDiterima').value = '';
  document.getElementById('diskonPersen').value = '';
  document.getElementById('diskonNominal').value = '';
  document.getElementById('catatan').value = '';
  document.getElementById('kembalian-value').textContent = 'Rp 0';
  renderProductCatalog();
  showToast('Keranjang direset', 'info');
}

// ===== HITUNG =====
function getSubtotal() {
  return daftarBelanja.reduce((s, b) => s + b.subtotal, 0);
}

function getDiskon(subtotal) {
  const pct = parseFloat(document.getElementById('diskonPersen').value) || 0;
  const nom = parseInt(document.getElementById('diskonNominal').value) || 0;
  return Math.min(subtotal, Math.round(subtotal * pct / 100) + nom);
}

// Diskon otomatis 10% jika subtotal setelah diskon manual > 100.000
function getAutoDiskon(afterManual) {
  return afterManual > 100000 ? Math.round(afterManual * 0.10) : 0;
}

// PPN 11% dihitung dari harga setelah semua diskon
function getPPN(afterAllDiskon) {
  return afterAllDiskon > 0 ? Math.round(afterAllDiskon * 0.11) : 0;
}

function hitungTotal() {
  const subtotal = getSubtotal();
  const manualDiskon = getDiskon(subtotal);
  const afterManual = subtotal - manualDiskon;
  const autoDiskon = getAutoDiskon(afterManual);
  const afterAllDiskon = afterManual - autoDiskon;
  const ppn = getPPN(afterAllDiskon);
  const total = afterAllDiskon + ppn;

  document.getElementById('subtotal-display').textContent = fmt(subtotal);
  document.getElementById('totalBelanja').textContent = fmt(total);

  // Diskon manual
  const discRow = document.getElementById('discount-row');
  if (manualDiskon > 0) {
    discRow.style.display = 'flex';
    document.getElementById('diskon-display').textContent = `- ${fmt(manualDiskon)}`;
  } else {
    discRow.style.display = 'none';
  }

  // Diskon otomatis
  const autoDiscRow = document.getElementById('auto-discount-row');
  if (autoDiskon > 0) {
    autoDiscRow.style.display = 'flex';
    document.getElementById('auto-diskon-display').textContent = `- ${fmt(autoDiskon)}`;
  } else {
    autoDiscRow.style.display = 'none';
  }

  // PPN
  const ppnRow = document.getElementById('ppn-row');
  if (ppn > 0) {
    ppnRow.style.display = 'flex';
    document.getElementById('ppn-display').textContent = fmt(ppn);
  } else {
    ppnRow.style.display = 'none';
  }

  document.getElementById('transfer-amount').textContent = fmt(total);
  document.getElementById('qris-amount').textContent = fmt(total);
  hitungKembalian();
  if (metodePembayaran === 'qris') generateQR();
}

function hitungKembalian() {
  const subtotal = getSubtotal();
  const manualDiskon = getDiskon(subtotal);
  const afterManual = subtotal - manualDiskon;
  const autoDiskon = getAutoDiskon(afterManual);
  const afterAllDiskon = afterManual - autoDiskon;
  const ppn = getPPN(afterAllDiskon);
  const total = afterAllDiskon + ppn;

  const diterima = parseInt(document.getElementById('uangDiterima').value) || 0;
  const kembalian = diterima - total;
  const el = document.getElementById('kembalian-value');
  el.textContent = kembalian >= 0 ? fmt(kembalian) : `- ${fmt(Math.abs(kembalian))}`;
  el.style.color = kembalian >= 0 ? 'var(--green)' : 'var(--red)';
}

// ===== QUICK CASH =====
function renderQuickCash() {
  const amounts = [5000, 10000, 20000, 50000, 100000];
  document.getElementById('quick-cash').innerHTML = amounts.map(a =>
    `<button class="cash-chip" onclick="setUang(${a})">${fmt(a)}</button>`
  ).join('');
}

function setUang(val) {
  document.getElementById('uangDiterima').value = val;
  hitungKembalian();
}

// ===== PAYMENT =====
function pilihPembayaran(method) {
  metodePembayaran = method;
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-method="${method}"]`).classList.add('active');
  document.getElementById('panel-' + method).classList.add('active');
  if (method === 'qris') generateQR();
}

function pilihBank(btn, bank) {
  bankDipilih = bank;
  document.querySelectorAll('.bank-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const b = bankData[bank];
  document.getElementById('account-num').textContent = b.no;
  document.getElementById('account-name').textContent = b.nama;
}

function salinNoRekening() {
  const no = bankData[bankDipilih].no;
  navigator.clipboard.writeText(no.replace(/-/g, '')).then(() => showToast('No. rekening disalin', 'success'));
}

// ===== QR CODE =====
let qrInstance = null;
function generateQR() {
  // Hitung total yang benar termasuk semua diskon dan PPN
  const subtotal = getSubtotal();
  const manualDiskon = getDiskon(subtotal);
  const afterManual = subtotal - manualDiskon;
  const autoDiskon = getAutoDiskon(afterManual);
  const afterAllDiskon = afterManual - autoDiskon;
  const ppn = getPPN(afterAllDiskon);
  const total = afterAllDiskon + ppn;

  const storeName = settings.storeName || 'Kantin Sekolah';
  const qrData = `QRIS|${storeName}|${total}|${Date.now()}`;
  const container = document.getElementById('qrcode-display');
  container.innerHTML = '';
  try {
    qrInstance = new QRCode(container, {
      text: qrData,
      width: 200,
      height: 200,
      colorDark: '#1a1a2e',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch(e) { container.innerHTML = '<p style="color:red">QR Error</p>'; }
}

// ===== PROSES TRANSAKSI =====
async function prosesTransaksi() {
  if (daftarBelanja.length === 0) { showToast('Keranjang masih kosong!', 'error'); return; }

  const subtotal = getSubtotal();
  const manualDiskon = getDiskon(subtotal);
  const afterManual = subtotal - manualDiskon;
  const autoDiskon = getAutoDiskon(afterManual);
  const afterAllDiskon = afterManual - autoDiskon;
  const ppn = getPPN(afterAllDiskon);
  const total = afterAllDiskon + ppn;

  if (metodePembayaran === 'tunai') {
    const diterima = parseInt(document.getElementById('uangDiterima').value) || 0;
    if (diterima < total) { showToast('Uang tidak cukup!', 'error'); return; }
  }

  const stockError = validasiStokKeranjang();
  if (stockError) { showToast(stockError, 'error'); return; }

  const trxTimestamp = new Date().toISOString();
  const tempTrxNumber = `TRX-${Date.now().toString().slice(-8)}`;

  const trx = {
    id: tempTrxNumber,
    tanggal: trxTimestamp,
    items: [...daftarBelanja],
    subtotal,
    manualDiskon,
    autoDiskon,
    diskon: manualDiskon + autoDiskon,
    ppn,
    total,
    metode: metodePembayaran,
    bank: metodePembayaran === 'transfer' ? bankDipilih : null,
    uangDiterima: parseInt(document.getElementById('uangDiterima').value) || 0,
    kembalian: metodePembayaran === 'tunai' ? (parseInt(document.getElementById('uangDiterima').value) || 0) - total : 0,
    catatan: document.getElementById('catatan').value,
    kasir: currentUser ? currentUser.displayName : (settings.kasirName || 'Anonymous')
  };

  let transactionSaved = false;

  // 1. Simpan Transaksi ke Supabase Database
  if (window.supabaseClient) {
    try {
      showToast('Menyimpan ke Supabase...', 'info');
      // Insert Transaction Header
      const { data: trxData, error: trxError } = await window.supabaseClient
        .from('transactions')
        .insert([{
          trx_number: tempTrxNumber,
          created_by: trx.kasir,
          customer_name: 'Siswa/Umum',
          payment_method: trx.metode,
          payment_bank: trx.bank,
          payment_status: 'paid',
          subtotal_amount: trx.subtotal,
          manual_discount_amount: trx.manualDiskon,
          auto_discount_amount: trx.autoDiskon,
          ppn_amount: trx.ppn,
          total_amount: trx.total,
          notes: trx.catatan,
          created_at: trx.tanggal
        }])
        .select();

      if (!trxError && trxData && trxData.length > 0) {
        const dbTrxId = trxData[0].id;
        trx.id = dbTrxId; // Gunakan UUID transaksi asli dari database
        trx.trxNumber = trxData[0].trx_number;

        // Insert Transaction Items
        const itemsToInsert = daftarBelanja.map(item => ({
          transaction_id: dbTrxId,
          product_id: (typeof item.id === 'string' && item.id.length > 20) ? item.id : null,
          product_code: item.kode,
          product_name: item.nama,
          product_category: item.kategori,
          unit_price: item.harga,
          quantity: item.jumlah,
          line_subtotal: item.subtotal
        }));

        const { error: itemsError } = await window.supabaseClient
          .from('transaction_items')
          .insert(itemsToInsert);

        if (!itemsError) {
          // Kurangi stok barang di Supabase
          for (const item of daftarBelanja) {
            if (typeof item.id === 'string' && item.id.length > 20) {
              const { data: prodData } = await window.supabaseClient
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single();

              if (prodData) {
                const newStock = Math.max(0, (prodData.stock || 0) - item.jumlah);
                await window.supabaseClient
                  .from('products')
                  .update({ stock: newStock })
                  .eq('id', item.id);
              }
            }
          }

          // Catat Riwayat Stok
          const stockHistories = daftarBelanja.map(item => ({
            product_id: (typeof item.id === 'string' && item.id.length > 20) ? item.id : null,
            product_code: item.kode,
            product_name: item.nama,
            change_qty: -item.jumlah,
            reason: 'transaction',
            ref_transaction_id: dbTrxId,
            notes: 'Penjualan Kasir'
          }));

          await window.supabaseClient
            .from('stock_history')
            .insert(stockHistories);

          transactionSaved = true;
          console.log("Transaksi berhasil disimpan di Supabase:", dbTrxId);
        } else {
          console.error("Gagal menyimpan item transaksi di Supabase:", itemsError.message);
        }
      } else {
        if (trxError) console.error("Gagal menyimpan header transaksi di Supabase:", trxError.message);
      }
    } catch (err) {
      console.error("Error proses transaksi Supabase:", err);
    }
  }

  // 2. Offline local fallback jika Supabase gagal atau tidak aktif
  if (!transactionSaved) {
    kurangiStokBarang();
    trx.id = noTransaksi;
    riwayat.unshift(trx);
    localStorage.setItem('riwayat', JSON.stringify(riwayat));
    localStorage.setItem('noTrx', String(noTransaksi + 1));
    noTransaksi++;
    showToast('Transaksi berhasil disimpan secara lokal (Offline)', 'info');
  } else {
    // Transaksi di Supabase sukses, perbarui katalog produk real-time
    await refreshBarangAdmin(false);
    // Tambahkan transaksi ke riwayat lokal di session/memori untuk display instan
    riwayat.unshift(trx);
    showToast('Transaksi berhasil diproses via Supabase!', 'success');
  }

  tampilkanStruk(trx);
  updateBadge();
}

function validasiStokKeranjang() {
  for (const item of daftarBelanja) {
    const product = daftarBarang.find(barang => String(barang.id) === String(item.id));
    if (!product) return `${item.nama} tidak ada di data katalog`;
    if (item.jumlah > Number(product.stok || 0)) return `Stok ${item.nama} tersisa ${product.stok}`;
  }
  return '';
}

function kurangiStokBarang() {
  daftarBarang = daftarBarang.map(product => {
    const cartItem = daftarBelanja.find(item => String(item.id) === String(product.id));
    if (!cartItem) return product;
    return { ...product, stok: Math.max(0, Number(product.stok || 0) - cartItem.jumlah) };
  });
  saveBarangAdmin();
  renderProductCatalog();
}

// ===== STRUK =====
function tampilkanStruk(trx) {
  const d = new Date(trx.tanggal);
  document.getElementById('struk-no').textContent = `#TRX-${String(trx.id).padStart(3,'0')}`;
  document.getElementById('struk-tanggal').textContent = d.toLocaleString('id-ID');
  document.getElementById('struk-kasir').textContent = currentUser ? currentUser.displayName : (settings.kasirName || 'Admin');
  document.getElementById('struk-store-name').textContent = settings.storeName || 'Kantin Sekolah';
  document.getElementById('struk-metode').textContent = trx.metode === 'tunai' ? 'Tunai' : trx.metode === 'transfer' ? `Transfer ${trx.bank}` : 'QRIS';

  document.getElementById('struk-items').innerHTML = trx.items.map(b =>
    `<div class="struk-item-row">
      <span class="struk-item-name">${escapeHTML(b.nama)}</span>
      <span class="struk-item-detail">${b.jumlah}x${fmt(b.harga)} = ${fmt(b.subtotal)}</span>
    </div>`
  ).join('');

  let summary = `<div class="struk-row"><span>Subtotal</span><span>${fmt(trx.subtotal)}</span></div>`;
  if (trx.manualDiskon > 0) summary += `<div class="struk-row"><span>Diskon Manual</span><span>- ${fmt(trx.manualDiskon)}</span></div>`;
  if (trx.autoDiskon > 0) summary += `<div class="struk-row"><span>Diskon Otomatis (10%)</span><span>- ${fmt(trx.autoDiskon)}</span></div>`;
  if (trx.ppn > 0) summary += `<div class="struk-row"><span>PPN (11%)</span><span>${fmt(trx.ppn)}</span></div>`;
  summary += `<div class="struk-total-row"><span>TOTAL</span><span>${fmt(trx.total)}</span></div>`;
  if (trx.metode === 'tunai') {
    summary += `<div class="struk-row"><span>Tunai</span><span>${fmt(trx.uangDiterima)}</span></div>`;
    summary += `<div class="struk-row"><span>Kembalian</span><span>${fmt(trx.kembalian)}</span></div>`;
  }
  if (trx.catatan) {
    summary += `<div class="struk-row" style="margin-top:8px;font-style:italic"><span>Catatan:</span><span>${escapeHTML(trx.catatan)}</span></div>`;
  }
  document.getElementById('struk-summary').innerHTML = summary;
  document.getElementById('modal-struk').classList.add('open');
  resetKeranjang();
}

function closeStruk(e) {
  if (!e || e.target.id === 'modal-struk' || !e.target) {
    document.getElementById('modal-struk').classList.remove('open');
  }
}

function printStruk() {
  window.print();
}

// ===== HISTORY =====
function renderHistory() {
  const metodeIcon = { tunai: 'ti-cash', transfer: 'ti-building-bank', qris: 'ti-qrcode' };
  const statsEl = document.getElementById('history-stats');
  const listEl = document.getElementById('history-list');

  const totalPend = riwayat.reduce((s, t) => s + t.total, 0);
  statsEl.innerHTML = `
    <div class="stat-card"><div class="stat-icon">${icon('ti-receipt')}</div><div class="stat-label">Total Transaksi</div><div class="stat-value">${riwayat.length}</div></div>
    <div class="stat-card"><div class="stat-icon">${icon('ti-coin')}</div><div class="stat-label">Total Pendapatan</div><div class="stat-value" style="font-size:16px">${fmt(totalPend)}</div></div>
    <div class="stat-card"><div class="stat-icon">${icon('ti-package')}</div><div class="stat-label">Total Item Terjual</div><div class="stat-value">${riwayat.reduce((s,t)=>s+t.items.reduce((a,b)=>a+b.jumlah,0),0)}</div></div>
    <div class="stat-card"><div class="stat-icon">${icon('ti-trending-up')}</div><div class="stat-label">Rata-rata Transaksi</div><div class="stat-value" style="font-size:16px">${riwayat.length ? fmt(Math.round(totalPend/riwayat.length)) : 'Rp 0'}</div></div>
  `;

  if (riwayat.length === 0) {
    listEl.innerHTML = `<div class="empty-state" style="padding:60px"><div class="empty-icon">${icon('ti-receipt-off')}</div><p>Belum ada transaksi</p></div>`;
    return;
  }

  listEl.innerHTML = riwayat.map(t => {
    const d = new Date(t.tanggal);
    return `<div class="history-card">
      <div class="history-icon">${icon(metodeIcon[t.metode] || 'ti-coin')}</div>
      <div class="history-info">
        <div class="history-no">#TRX-${String(t.id).padStart(3,'0')}</div>
        <div class="history-time">${d.toLocaleString('id-ID')}</div>
        <div class="history-items">${t.items.map(i => escapeHTML(i.nama)).join(', ')}</div>
      </div>
      <div>
        <div class="history-total">${fmt(t.total)}</div>
        <div class="history-method">${escapeHTML(t.metode.toUpperCase())}${t.bank ? ' - ' + escapeHTML(t.bank) : ''}</div>
      </div>
    </div>`;
  }).join('');
}
function exportCSV() {
  if (!riwayat.length) { showToast('Tidak ada data!', 'error'); return; }
  let csv = 'No,Tanggal,Total,Metode,Item\n';
  riwayat.forEach(t => {
    csv += [csvCell(`#TRX-${String(t.id).padStart(3,'0')}`), csvCell(new Date(t.tanggal).toLocaleString('id-ID')), t.total, csvCell(t.metode), csvCell(t.items.map(i => i.nama).join('; '))].join(',') + '\n';
  });
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `transaksi-${new Date().toLocaleDateString('id-ID').replace(/\//g,'-')}.csv`;
  a.click();
  showToast('CSV diunduh', 'success');
}

// ===== LAPORAN =====
function renderLaporan() {
  const today = new Date().toDateString();
  const hariIni = riwayat.filter(t => new Date(t.tanggal).toDateString() === today);
  const totalHariIni = hariIni.reduce((s,t) => s+t.total, 0);

  // Kategori stats
  const katMap = {};
  riwayat.forEach(t => t.items.forEach(i => {
    katMap[i.kategori] = (katMap[i.kategori] || 0) + i.subtotal;
  }));

  // Metode stats
  const metMap = { tunai: {count:0,total:0}, transfer: {count:0,total:0}, qris: {count:0,total:0} };
  riwayat.forEach(t => {
    if (metMap[t.metode]) { metMap[t.metode].count++; metMap[t.metode].total += t.total; }
  });

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-icon">${icon('ti-sun')}</div><div class="stat-label">Pendapatan Hari Ini</div><div class="stat-value" style="font-size:18px">${fmt(totalHariIni)}</div><div class="stat-sub">${hariIni.length} transaksi</div></div>
    <div class="stat-card"><div class="stat-icon">${icon('ti-coin')}</div><div class="stat-label">Total Pendapatan</div><div class="stat-value" style="font-size:18px">${fmt(riwayat.reduce((s,t)=>s+t.total,0))}</div><div class="stat-sub">Semua waktu</div></div>
    <div class="stat-card"><div class="stat-icon">${icon('ti-shopping-cart')}</div><div class="stat-label">Transaksi Hari Ini</div><div class="stat-value">${hariIni.length}</div></div>
    <div class="stat-card"><div class="stat-icon">${icon('ti-receipt')}</div><div class="stat-label">Total Transaksi</div><div class="stat-value">${riwayat.length}</div></div>
  `;

  const maxKat = Math.max(...Object.values(katMap), 1);
  document.getElementById('chart-bars').innerHTML = Object.entries(katMap).length
    ? Object.entries(katMap).map(([k,v]) => `
        <div class="chart-bar-item">
          <div class="chart-bar-label"><span>${escapeHTML(k)}</span><span>${fmt(v)}</span></div>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${Math.round(v/maxKat*100)}%"></div></div>
        </div>`).join('')
    : '<p style="color:var(--text3);font-size:13px">Belum ada data</p>';

  const metIcons = { tunai:'ti-cash', transfer:'ti-building-bank', qris:'ti-qrcode' };
  document.getElementById('payment-chart').innerHTML = Object.entries(metMap).map(([m,d]) => `
    <div class="pay-stat-row">
      <span class="pay-stat-icon">${icon(metIcons[m])}</span>
      <div class="pay-stat-info">
        <div class="pay-stat-name">${m.charAt(0).toUpperCase()+m.slice(1)}</div>
        <div class="pay-stat-count">${d.count} transaksi</div>
      </div>
      <div class="pay-stat-amount">${fmt(d.total)}</div>
    </div>`).join('');
}

// ===== SETTINGS =====
function loadSettings() {
  if (settings.storeName) document.getElementById('store-name-display').textContent = settings.storeName;
}

function syncBankDisplay() {
  const b = bankData[bankDipilih];
  document.getElementById('account-num').textContent = b.no;
  document.getElementById('account-name').textContent = settings.storeName || b.nama;
}

// ===== UTILS =====
function escapeHTML(value) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" };
  return String(value ?? "").replace(/[&<>"\x27]/g, char => char === String.fromCharCode(39) ? "&#39;" : map[char]);
}

function csvCell(value) {
  const quote = String.fromCharCode(34);
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? String.fromCharCode(39) + text : text;
  return quote + safe.replaceAll(quote, quote + quote) + quote;
}

function fmt(n) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

function icon(name) {
  return `<i class="ti ${name}" aria-hidden="true"></i>`;
}

function updateBadge() {
  document.getElementById('history-badge').textContent = riwayat.length;
}

function showToast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

function animateBtn(id) {
  const btn = document.getElementById(id);
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => btn.style.transform = '', 150);
}
