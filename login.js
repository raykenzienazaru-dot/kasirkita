// ===== LOGIN SYSTEM =====
let selectedRole = 'user';

// Default credentials
const credentials = {
  user: { username: 'kasir', password: 'kasir123', displayName: 'Kasir', roleName: 'Kasir / Petugas' },
  admin: { username: 'admin', password: 'admin123', displayName: 'Administrator', roleName: 'Admin — Manajemen Penuh' }
};

const roleRoutes = {
  user: 'user/index.html',
  admin: 'admin/index.html'
};

function goToDashboard(role) {
  window.location.href = roleRoutes[role] || roleRoutes.user;
}

function getSavedUser() {
  const saved = sessionStorage.getItem('currentUser');
  if (!saved) return null;

  try {
    const user = JSON.parse(saved);
    return credentials[user.role] ? user : null;
  } catch (e) {
    sessionStorage.removeItem('currentUser');
    return null;
  }
}

function selectRole(role) {
  if (!credentials[role]) return;
  selectedRole = role;
  document.querySelectorAll('.role-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-pressed', 'false');
  });
  const activeTab = document.getElementById('role-' + role);
  activeTab.classList.add('active');
  activeTab.setAttribute('aria-pressed', 'true');
  // Clear form & error
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('login-username').focus();
}

function togglePassword() {
  const inp = document.getElementById('login-password');
  const btn = document.getElementById('toggle-pass');
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
    btn.setAttribute('aria-label', 'Sembunyikan password');
  } else {
    inp.type = 'password';
    btn.textContent = '👁️';
    btn.setAttribute('aria-label', 'Tampilkan password');
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.classList.remove('show');
  // Trigger reflow for re-animation
  void el.offsetWidth;
  el.classList.add('show');
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const btnLogin = document.getElementById('btn-login');

  // Validate
  if (!username || !password) {
    showLoginError('Username dan password harus diisi!');
    return;
  }

  btnLogin.classList.add('loading');
  btnLogin.innerHTML = '<span>Memverifikasi...</span>';

  let loginSuccess = false;
  let currentUser = null;
  let errorMsg = 'Username atau password salah!';

  // 1. Coba login menggunakan Supabase Auth
  if (window.supabaseClient) {
    try {
      const email = username.includes('@') ? username : `${username}@kasirkita.com`;
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (!error && data.user) {
        const metadata = data.user.user_metadata || {};
        // Ambil data role dan profile dari metadata Supabase
        const userRole = metadata.role || selectedRole;
        
        currentUser = {
          role: userRole,
          username: username,
          displayName: metadata.displayName || (userRole === 'admin' ? 'Administrator' : 'Kasir'),
          roleName: metadata.roleName || (userRole === 'admin' ? 'Admin — Manajemen Penuh' : 'Kasir / Petugas'),
          token: data.session?.access_token
        };

        // Pastikan role yang dipilih sesuai dengan role user di Supabase
        if (userRole !== selectedRole) {
          errorMsg = `Peran tidak sesuai! Akun ini terdaftar sebagai ${userRole.toUpperCase()}.`;
          loginSuccess = false;
        } else {
          loginSuccess = true;
          console.log("Login Supabase berhasil:", currentUser);
        }
      } else {
        if (error) {
          errorMsg = error.message;
          console.warn("Supabase auth error:", error.message);
        }
      }
    } catch (err) {
      console.error("Gagal menghubungkan ke Supabase Auth:", err);
    }
  }

  // 2. Fallback ke kredensial lokal/demo offline jika Supabase gagal atau tidak aktif
  if (!loginSuccess) {
    const cred = credentials[selectedRole];
    if (username === cred.username && password === cred.password) {
      currentUser = {
        role: selectedRole,
        username: username,
        displayName: cred.displayName,
        roleName: cred.roleName,
        isOfflineDemo: true
      };
      loginSuccess = true;
      console.log("Login demo lokal berhasil (offline fallback).");
    }
  }

  if (loginSuccess && currentUser) {
    // Save session
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Transition
    setTimeout(() => {
      const loginScreen = document.getElementById('login-screen');
      if (loginScreen) loginScreen.classList.add('hiding');

      setTimeout(() => {
        goToDashboard(currentUser.role); // Pindah ke halaman sesuai role
      }, 500);
    }, 400);
  } else {
    btnLogin.classList.remove('loading');
    btnLogin.innerHTML = '<span>Masuk Sekarang</span><span class="login-arrow" aria-hidden="true">→</span>';
    showLoginError(errorMsg);
  }
}

// Cek apakah sudah login saat di halaman login
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = getSavedUser();
  if (savedUser) {
    goToDashboard(savedUser.role);
  } else {
    setTimeout(() => {
      const uname = document.getElementById('login-username');
      if(uname) uname.focus();
    }, 600);
  }
});
