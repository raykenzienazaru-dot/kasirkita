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

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const btnLogin = document.getElementById('btn-login');

  // Validate
  if (!username || !password) {
    showLoginError('Username dan password harus diisi!');
    return;
  }
  
  // Login dengan default credentials sebagai fallback/development
  const cred = credentials[selectedRole];
  if (username !== cred.username || password !== cred.password) {
    showLoginError('Username atau password salah!');
    return;
  }

  // Success — animate
  btnLogin.classList.add('loading');
  btnLogin.innerHTML = '<span>Memverifikasi...</span>';

  setTimeout(() => {
    const currentUser = {
      role: selectedRole,
      username: username,
      displayName: cred.displayName,
      roleName: cred.roleName
    };

    // Save session
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Transition
    const loginScreen = document.getElementById('login-screen');
    loginScreen.classList.add('hiding');

    setTimeout(() => {
      goToDashboard(selectedRole); // Pindah ke halaman sesuai role
    }, 500);
  }, 800);
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
