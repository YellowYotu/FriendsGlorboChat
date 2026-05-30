// ── НАВИГАЦИЯ ──
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

// ── ВЕРСИЯ ──
function loadVersion() {
    fetch('/version.json')
        .then(res => res.json())
        .then(data => {
            const el = document.getElementById('versionDisplay');
            if (el) el.innerText = 'version: ' + data.version;
        })
        .catch(() => {
            const el = document.getElementById('versionDisplay');
            if (el) el.innerText = 'version: ???';
        });
}

function showSub(id, btn) {
  document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── ТЕМЫ ──
const THEMES = ['theme-dark','theme-light','theme-ocean','theme-purple','theme-forest','theme-sunset'];

function setTheme(theme, card) {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
  if (card) card.classList.add('active');
}

// ── ЗВОНКИ ──
function joinCall(url) {
  window.open(url, '_blank');
}

// ── ПРИВАТНЫЙ ЗВОНОК ──
function openPrivateModal() {
  document.getElementById('privateModal').classList.add('open');
  document.getElementById('privatePassword').value = '';
  document.getElementById('privateError').style.display = 'none';
  setTimeout(() => document.getElementById('privatePassword').focus(), 200);
}

function closePrivateModal() {
  document.getElementById('privateModal').classList.remove('open');
}

async function checkPrivatePassword() {
  const password = document.getElementById('privatePassword').value.trim();
  if (!password) return;

  const btn = document.querySelector('#privateModal .btn-primary');
  btn.textContent = '⏳ Проверка...';
  btn.disabled = true;

  try {
    const res = await fetch(`/api/private?password=${encodeURIComponent(password)}`);
    const data = await res.json();

    if (data.success) {
      closePrivateModal();
      window.open(data.url, '_blank');
    } else {
      const err = document.getElementById('privateError');
      err.style.display = 'block';
      document.getElementById('privatePassword').value = '';
      document.getElementById('privatePassword').focus();
    }
  } catch (e) {
    const err = document.getElementById('privateError');
    err.textContent = 'Ошибка подключения';
    err.style.display = 'block';
  }

  btn.textContent = 'Войти';
  btn.disabled = false;
}

// ── КАСТОМНЫЕ СТИЛИ ──
function openCustomModal() {
  document.getElementById('customModal').classList.add('open');
  loadCustomValues();
}

function closeCustomModal() {
  document.getElementById('customModal').classList.remove('open');
}

function loadCustomValues() {
  const saved = JSON.parse(localStorage.getItem('customStyles') || '{}');
  if (saved.accent) document.getElementById('customAccent').value = saved.accent;
  if (saved.card)   document.getElementById('customCard').value   = saved.card;
  if (saved.bg)     document.getElementById('customBg').value     = saved.bg;
  if (saved.text)   document.getElementById('customText').value   = saved.text;
  if (saved.radius) document.getElementById('customRadius').value = saved.radius;
  if (saved.font)   document.getElementById('customFont').value   = saved.font;
}

function applyCustom() {
  const accent = document.getElementById('customAccent').value;
  const card   = document.getElementById('customCard').value;
  const bg     = document.getElementById('customBg').value;
  const text   = document.getElementById('customText').value;
  const radius = document.getElementById('customRadius').value;
  const font   = document.getElementById('customFont').value;

  document.documentElement.style.setProperty('--accent',        accent);
  document.documentElement.style.setProperty('--surface',       card);
  document.documentElement.style.setProperty('--bg',            bg);
  document.documentElement.style.setProperty('--text',          text);
  document.documentElement.style.setProperty('--custom-radius', radius + 'px');
  document.documentElement.style.setProperty('--custom-font',   font + 'px');
  document.body.style.background = bg;
  document.body.style.color = text;

  const preview = document.getElementById('customPreview');
  if (preview) preview.style.display = 'flex';
}

function saveCustom() {
  const styles = {
    accent: document.getElementById('customAccent').value,
    card:   document.getElementById('customCard').value,
    bg:     document.getElementById('customBg').value,
    text:   document.getElementById('customText').value,
    radius: document.getElementById('customRadius').value,
    font:   document.getElementById('customFont').value,
  };
  localStorage.setItem('customStyles', JSON.stringify(styles));
  localStorage.setItem('customActive', '1');
  closeCustomModal();
}

function resetCustom() {
  localStorage.removeItem('customStyles');
  localStorage.removeItem('customActive');
  document.documentElement.removeAttribute('style');
  document.body.style.cssText = '';
  closeCustomModal();
  applyThemeFromStorage();
}

function resetAll() {
  localStorage.clear();
  location.reload();
}

// ── ИНИЦИАЛИЗАЦИЯ ──
function applyThemeFromStorage() {
  const theme = localStorage.getItem('theme') || 'theme-dark';
  document.body.className = theme;
  const idx = THEMES.indexOf(theme);
  const cards = document.querySelectorAll('.theme-card');
  cards.forEach(c => c.classList.remove('active'));
  if (cards[idx]) cards[idx].classList.add('active');
}

function applyCustomFromStorage() {
  if (!localStorage.getItem('customActive')) return;
  const saved = JSON.parse(localStorage.getItem('customStyles') || '{}');
  if (saved.accent) document.documentElement.style.setProperty('--accent',        saved.accent);
  if (saved.card)   document.documentElement.style.setProperty('--surface',       saved.card);
  if (saved.bg)     { document.documentElement.style.setProperty('--bg', saved.bg); document.body.style.background = saved.bg; }
  if (saved.text)   { document.documentElement.style.setProperty('--text', saved.text); document.body.style.color = saved.text; }
  if (saved.radius) document.documentElement.style.setProperty('--custom-radius', saved.radius + 'px');
  if (saved.font)   document.documentElement.style.setProperty('--custom-font',   saved.font + 'px');
}

// Enter / Escape в модалках
document.getElementById('privatePassword').addEventListener('keydown', e => {
  if (e.key === 'Enter')  checkPrivatePassword();
  if (e.key === 'Escape') closePrivateModal();
});

document.getElementById('privateModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closePrivateModal();
});
document.getElementById('customModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCustomModal();
});

function copyLink(url, btnElement) {
    // 1. Копируем текст
    navigator.clipboard.writeText(url).then(() => {
        
        // 2. Сохраняем исходный текст ОДИН РАЗ
        const originalText = "📋 Скопировать"; // Укажите именно тот текст, который у вас в HTML
        
        // 3. Меняем состояние
        btnElement.innerText = "✅ Скопировано!";
        btnElement.classList.add("copied");

        // 4. Возврат через 2 секунды
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.classList.remove("copied");
        }, 2000);
        
    }).catch(err => {
        console.error('Ошибка:', err);
    });
}

applyThemeFromStorage();
applyCustomFromStorage();

// Запускаем
loadVersion();
