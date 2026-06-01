// ── НАВИГАЦИЯ ──
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

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
  showCurrentUser();
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
  if (saved.scale)  document.getElementById('customScale').value  = saved.scale;
  // Обновляем лейбл масштаба
  updateScaleLabel(saved.scale || 100);
}

function updateScaleLabel(val) {
  const label = document.getElementById('scaleLabel');
  if (label) label.textContent = val + '%';
}

function applyCustom() {
  const accent = document.getElementById('customAccent').value;
  const card   = document.getElementById('customCard').value;
  const bg     = document.getElementById('customBg').value;
  const text   = document.getElementById('customText').value;
  const radius = document.getElementById('customRadius').value;
  const font   = document.getElementById('customFont').value;
  const scale  = document.getElementById('customScale').value;

  document.documentElement.style.setProperty('--accent',        accent);
  document.documentElement.style.setProperty('--surface',       card);
  document.documentElement.style.setProperty('--bg',            bg);
  document.documentElement.style.setProperty('--text',          text);
  document.documentElement.style.setProperty('--custom-radius', radius + 'px');
  document.documentElement.style.setProperty('--custom-font',   font + 'px');
  document.body.style.background = bg;
  document.body.style.color = text;

  // Применяем масштаб к основному контенту
  const main = document.querySelector('.main');
  if (main) main.style.zoom = (scale / 100);

  // Обновляем лейбл
  updateScaleLabel(scale);

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
    scale:  document.getElementById('customScale').value,
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
  // Сбрасываем масштаб
  const main = document.querySelector('.main');
  if (main) main.style.zoom = 1;
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
  if (saved.scale)  {
    const main = document.querySelector('.main');
    if (main) main.style.zoom = (saved.scale / 100);
  }
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
    navigator.clipboard.writeText(url).then(() => {
        const originalText = "📋 Скопировать";
        btnElement.innerText = "✅ Скопировано!";
        btnElement.classList.add("copied");
        setTimeout(() => {
            btnElement.innerText = originalText;
            btnElement.classList.remove("copied");
        }, 2000);
    }).catch(err => {
        console.error('Ошибка:', err);
    });
}

/* ═══════════════════════════════
   LOGIN / REGISTER
═══════════════════════════════ */

let registerMode = false;

function animateLogo() {

    const logo =
        document.querySelector(
            '.login-logo'
        );

    if (!logo) {
        return;
    }

    logo.classList.remove(
        'logo-jump'
    );

    void logo.offsetWidth;

    logo.classList.add(
        'logo-jump'
    );
}

function animateTitle() {

    const title =
        document.getElementById(
            'authTitle'
        );

    if (!title) {
        return;
    }

    title.classList.remove(
        'title-animate'
    );

    void title.offsetWidth;

    title.classList.add(
        'title-animate'
    );
}

function buildLoginFields() {

    return `
        <input
            class="login-input"
            id="loginNickname"
            placeholder="Никнейм"
            autocomplete="off"
        >

        <input
            class="login-input"
            id="loginPassword"
            type="password"
            placeholder="Пароль"
        >
    `;
}

function buildRegisterFields() {

    return `
        <input
            class="login-input"
            id="registerNickname"
            placeholder="Никнейм"
            autocomplete="off"
        >

        <input
            class="login-input"
            id="registerPassword"
            type="password"
            placeholder="Пароль"
        >

        <input
            class="login-input"
            id="registerPasswordRepeat"
            type="password"
            placeholder="Повторите пароль"
        >
    `;
}

function toggleAuth() {

    const content =
        document.getElementById(
            'authContent'
        );

    const title =
        document.getElementById(
            'authTitle'
        );

    const fields =
        document.getElementById(
            'authFields'
        );

    const switchText =
        document.getElementById(
            'authSwitchText'
        );

    const action =
        document.getElementById(
            'mainAction'
        );

    const switchBtn =
        document.getElementById(
            'switchBtn'
        );

    if (
        !content ||
        !title ||
        !fields ||
        !switchText ||
        !action ||
        !switchBtn
    ) {
        return;
    }

    content.classList.add(
        'switching'
    );

    setTimeout(() => {

        registerMode =
            !registerMode;

        animateLogo();

        if (registerMode) {

            title.textContent =
                'Создание аккаунта';

            fields.innerHTML =
                buildRegisterFields();

            action.textContent =
                'Создать аккаунт';

            action.onclick =
                createAccount;

            switchText.textContent =
                'Уже есть аккаунт?';

            switchBtn.textContent =
                'Войти';

        } else {

            title.textContent =
                'Вход';

            fields.innerHTML =
                buildLoginFields();

            action.textContent =
                'Войти';

            action.onclick =
                login;

            switchText.textContent =
                'Нету аккаунта?';

            switchBtn.textContent =
                'Создать аккаунт';
        }

        animateTitle();

        content.classList.remove(
            'switching'
        );

    }, 160);
}

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const fields =
            document.getElementById(
                'authFields'
            );

        const action =
            document.getElementById(
                'mainAction'
            );

        if (fields) {

            fields.innerHTML =
                buildLoginFields();
        }

        if (action) {

            action.onclick =
                login;
}

    }
);

async function createAccount() {

    const nickname =
        document
            .getElementById(
                'registerNickname'
            )
            ?.value
            .trim();

    const password =
        document
            .getElementById(
                'registerPassword'
            )
            ?.value;

    const repeat =
        document
            .getElementById(
                'registerPasswordRepeat'
            )
            ?.value;

    if (
        !nickname ||
        !password
    ) {

        alert(
            'Заполни все поля'
        );

        return;
    }

    if (
        password !==
        repeat
    ) {

        alert(
            'Пароли не совпадают'
        );

        return;
    }

    try {

        const existing =
            await db
                .collection(
                    'users'
                )
                .where(
                    'nickname',
                    '==',
                    nickname
                )
                .get();

        if (
            !existing.empty
        ) {

            alert(
                'Ник уже занят'
            );

            return;
        }

        await db
            .collection(
                'users'
            )
            .add({

                nickname,

                password,

                createdAt:
                    Date.now()
            });

        alert(
            'Аккаунт создан'
        );

        toggleAuth();

    } catch (
        error
    ) {

        console.error(
            error
        );

        alert(
            'Ошибка Firebase'
        );
    }
}

async function login() {

    clearAuthError();

    const nickname =
        document
            .getElementById(
                'loginNickname'
            )
            ?.value
            .trim();

    const password =
        document
            .getElementById(
                'loginPassword'
            )
            ?.value;

    if (
        !nickname
    ) {

        showAuthError(
            'Введите ник',
            'loginNickname'
        );

        return;
    }

    if (
        !password
    ) {

        showAuthError(
            'Введите пароль',
            'loginPassword'
        );

        return;
    }

    try {

        const result =
            await db
                .collection(
                    'users'
                )
                .where(
                    'nickname',
                    '==',
                    nickname
                )
                .limit(
                    1
                )
                .get();

        if (
            result.empty
        ) {

            showAuthError(
                'Такого аккаунта нет',
                'loginNickname'
            );

            return;
        }

        const user =
            result.docs[0].data();

        if (
            user.password !==
            password
        ) {

            showAuthError(
                'Неверный пароль',
                'loginPassword'
            );

            return;
        }

        localStorage.setItem(
            'currentUser',
            JSON.stringify(
                user
            )
        );

        showCurrentUser();

    } catch (
        error
    ) {

        console.error(
            error
        );

        showAuthError(
            'Ошибка входа'
        );
    }
}

function clearAuthError() {

    const error =
        document.getElementById(
            'authError'
        );

    if (error) {

        error.textContent =
            '';
    }

    document
        .querySelectorAll(
            '.login-input'
        )
        .forEach(
            input =>
                input.classList.remove(
                    'error'
                )
        );
}

function showAuthError(
    message,
    inputId
) {

    clearAuthError();

    const error =
        document.getElementById(
            'authError'
        );

    if (error) {

        error.textContent =
            message;
    }

    if (inputId) {

        const input =
            document.getElementById(
                inputId
            );

        if (input) {

            input.classList.add(
                'error'
            );
        }
    }
}

function showCurrentUser() {

    const raw =
        localStorage.getItem(
            'currentUser'
        );

    if (
        !raw
    ) {
        return;
    }

    const user =
        JSON.parse(
            raw
        );

    document
        .getElementById(
            'loginScreen'
        )
        ?.style &&
        (
            document
                .getElementById(
                    'loginScreen'
                )
                .style
                .display =
                'none'
        );

    const old =
        document.getElementById(
            'profileBar'
        );

    if (
        old
    ) {

        old.remove();
    }

    document.body.insertAdjacentHTML(
        'beforeend',

`
<div id="profileBar">

<div id="profileName">
${user.nickname}
</div>

<div id="profileAvatar">
${user.nickname[0].toUpperCase()}
</div>

</div>
`
    );
}

window.addEventListener(
    'load',
    () => {

        showCurrentUser();
    }
);

function logout() {

    localStorage.removeItem(
        'currentUser'
    );

    document
        .getElementById(
            'profileBar'
        )
        ?.remove();

    const loginScreen =
        document
            .getElementById(
                'loginScreen'
            );

    if (
        loginScreen
    ) {

        loginScreen.style.display =
            'flex';
    }

    registerMode =
        false;

    const title =
        document
            .getElementById(
                'authTitle'
            );

    const fields =
        document
            .getElementById(
                'authFields'
            );

    const action =
        document
            .getElementById(
                'mainAction'
            );

    const switchText =
        document
            .getElementById(
                'authSwitchText'
            );

    const switchBtn =
        document
            .getElementById(
                'switchBtn'
            );

    if (
        title
    ) {

        title.textContent =
            'Вход';
    }

    if (
        fields
    ) {

        fields.innerHTML =
            buildLoginFields();
    }

    if (
        action
    ) {

        action.textContent =
            'Войти';

        action.onclick =
            () => login();
    }

    if (
        switchText
    ) {

        switchText.textContent =
            'Нету аккаунта?';
    }

    if (
        switchBtn
    ) {

        switchBtn.textContent =
            'Создать аккаунт';
    }
}



applyThemeFromStorage();
applyCustomFromStorage();

// Запускаем
loadVersion();