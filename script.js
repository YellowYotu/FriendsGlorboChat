// ── НАВИГАЦИЯ ──
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');

    if (id === 'admin') loadAdminPage();
}

function loadVersion() {
    fetch('/version.json')
        .then(res => res.json())
        .then(data => {
            const el = document.getElementById('versionDisplay');
            if (el) el.innerText = 'version: ' + data.version;
            const elInfo = document.getElementById('infoVersionDisplay');
            if (elInfo) elInfo.innerText = data.version;
        })
        .catch(() => {
            const el = document.getElementById('versionDisplay');
            if (el) el.innerText = 'version: ???';
            const elInfo = document.getElementById('infoVersionDisplay');
            if (elInfo) elInfo.innerText = '???';
        });
}

function loadUserCount() {
    db.collection('users').get().then(snap => {
        const el = document.getElementById('infoUserCount');
        if (el) el.innerText = snap.size;
    }).catch(() => {
        const el = document.getElementById('infoUserCount');
        if (el) el.innerText = '?';
    });
}


function showSubPage(id, btn) {

    document
        .querySelectorAll('.sub-page')
        .forEach(p => {
            p.classList.remove('active');
        });

    document
        .querySelectorAll('.sub-btn')
        .forEach(b => {
            b.classList.remove('active');
        });

    const page =
        document.getElementById(id);

    if (page) {
        page.classList.add('active');
    }

    if (btn) {
        btn.classList.add('active');
    }

}

/* ==========================
   ADMIN PAGE
========================== */

function initAdminNav() {
  const user = getCurrentUser();
  const btn = document.getElementById('adminNavBtn');
  if (btn) btn.style.display = (user?.nickname === 'YellowYotu') ? 'flex' : 'none';
}

function loadAdminPage() {
  const user = getCurrentUser();
  if (user?.nickname !== 'YellowYotu') return;

  loadAdminStats();
  loadAdminUsers();
  loadAdminRequests();
  loadAdminCalls();
}

function loadAdminStats() {
  // Юзеры
  db.collection('users').get().then(s => {
    const el = document.getElementById('adminUserCount');
    if (el) el.innerText = s.size;
  });

  // Звонки
  db.collection('calls').get().then(s => {
    const el = document.getElementById('adminCallCount');
    if (el) el.innerText = s.size;
  });

  // Заявки pending
  db.collection('callRequests').where('status', '==', 'pending').get().then(s => {
    const el = document.getElementById('adminPendingCount');
    if (el) el.innerText = s.size;
  });
}

function loadAdminUsers() {
  const list = document.getElementById('adminUsersList');
  if (!list) return;

  db.collection('users').orderBy('createdAt').get().then(snap => {
    list.innerHTML = '';
    if (snap.empty) {
      list.innerHTML = '<p style="color:var(--muted)">Нет пользователей</p>';
      return;
    }
    snap.forEach(doc => {
      const u = doc.data();
      const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru') : '—';
      list.innerHTML += `
        <div style="
          background:var(--surface);
          border-radius:10px;
          padding:12px 16px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
        ">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="
              width:36px;height:36px;
              background:var(--accent);
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-weight:700;font-size:15px;color:#000;
            ">${u.nickname[0].toUpperCase()}</div>
            <div>
              <div style="font-weight:600">${u.nickname}</div>
              <div style="font-size:12px;color:var(--muted)">Зарег.: ${date}</div>
            </div>
          </div>
          <button class="btn-secondary" style="font-size:12px;padding:4px 10px"
            onclick="adminDeleteUser('${doc.id}', '${u.nickname}')">
            🗑 Удалить
          </button>
        </div>
      `;
    });
  });
}

function loadAdminRequests() {
  const list = document.getElementById('adminRequestsList');
  if (!list) return;

  db.collection('callRequests').orderBy('createdAt', 'desc').onSnapshot(snap => {
    list.innerHTML = '';
    if (snap.empty) {
      list.innerHTML = '<p style="color:var(--muted)">Нет заявок</p>';
      return;
    }
    snap.forEach(doc => {
      const r = doc.data();
      const statusMap = { pending: '⏳ Ожидает', approved: '✅ Одобрен', rejected: '❌ Отклонён' };
      const statusColor = { pending: 'var(--accent)', approved: '#3fb950', rejected: '#f85149' };
      list.innerHTML += `
        <div style="
          background:var(--surface);
          border-radius:10px;
          padding:14px 16px;
          border-left:3px solid ${statusColor[r.status] || 'var(--accent)'};
        ">
          <div style="font-weight:600;margin-bottom:4px">${r.title}</div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:8px">
            👤 ${r.createdBy} · <span style="color:${statusColor[r.status]}">${statusMap[r.status] || r.status}</span>
          </div>
          <div style="font-size:12px;color:var(--muted);word-break:break-all;margin-bottom:10px">${r.url}</div>
          ${r.status === 'pending' ? `
            <div style="display:flex;gap:8px">
              <button class="btn-primary" style="font-size:12px;padding:5px 12px"
                onclick="approveCallRequest('${doc.id}')">✅ Одобрить</button>
              <button class="btn-secondary" style="font-size:12px;padding:5px 12px"
                onclick="rejectCallRequest('${doc.id}')">❌ Отклонить</button>
            </div>
          ` : ''}
        </div>
      `;
    });
  });
}

function loadAdminCalls() {
  const list = document.getElementById('adminCallsList');
  if (!list) return;

  db.collection('calls').orderBy('createdAt', 'desc').onSnapshot(snap => {
    list.innerHTML = '';
    if (snap.empty) {
      list.innerHTML = '<p style="color:var(--muted)">Нет звонков</p>';
      return;
    }
    snap.forEach(doc => {
      const c = doc.data();
      list.innerHTML += `
        <div style="
          background:var(--surface);
          border-radius:10px;
          padding:14px 16px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
        ">
          <div>
            <div style="font-weight:600">${c.title}</div>
            <div style="font-size:12px;color:var(--muted)">👤 ${c.createdBy}</div>
            <div style="font-size:11px;color:var(--muted);word-break:break-all">${c.url}</div>
          </div>
          <button class="btn-secondary" style="font-size:12px;padding:4px 10px;flex-shrink:0"
            onclick="adminDeleteCall('${doc.id}')">
            🗑
          </button>
        </div>
      `;
    });
  });
}

async function adminDeleteUser(docId, nickname) {
  if (nickname === 'YellowYotu') {
    alert('Нельзя удалить себя');
    return;
  }
  if (!confirm(`Удалить пользователя ${nickname}?`)) return;
  await db.collection('users').doc(docId).delete();
  loadAdminUsers();
  loadAdminStats();
}

async function adminDeleteCall(docId) {
  if (!confirm('Удалить этот звонок?')) return;
  await db.collection('calls').doc(docId).delete();
  loadAdminStats();
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

    async () => {

        showCurrentUser();

        const user =
            getCurrentUser();

        if (

            user
            &&
            user.nickname ===
            'YellowYotu'

        ) {

            await loadAdminDialogs();

        }

        await loadMessages();

        loadApprovedCalls();

        initAdminNav(); // показывает/скрывает кнопку в сайдбаре

    }
    

);

function logout() {

    localStorage.removeItem(
        'currentUser'
    );

    sessionStorage.removeItem(
        'activeUser'
    );

    currentReplyUser =
        null;

    currentDialog =
        'ideas';

    document
        .getElementById(
            'profileBar'
        )
        ?.remove();

    const reply =
        document.getElementById(
            'replyDialog'
        );

    if (
        reply
    ) {

        reply.innerHTML =
            '';

        reply.style.display =
            'none';

    }

    const chat =
        document.getElementById(
            'chatMessages'
        );

    if (
        chat
    ) {

        chat.innerHTML =
            '';
    }

    document
        .querySelectorAll(
            '.dialog'
        )
        .forEach(

            x => {

                x.classList.remove(
                    'active'
                );

            }

        );

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
        document.getElementById(
            'authTitle'
        );

    const fields =
        document.getElementById(
            'authFields'
        );

    const action =
        document.getElementById(
            'mainAction'
        );

    const switchText =
        document.getElementById(
            'authSwitchText'
        );

    const switchBtn =
        document.getElementById(
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
            login;

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

    location.reload();

}

/* ==========================
   MESSAGES
========================== */

let currentDialog =
    'ideas';

let currentReplyUser =
    null;

let unsubscribeMessages =
    null;

/* ==========================
   USER
========================== */

function getCurrentUser() {

    const user =

        JSON.parse(

            localStorage.getItem(
                'currentUser'
            )

        );

    const currentName =
        user?.nickname;

    const previousName =

        sessionStorage.getItem(
            'activeUser'
        );

    if (

        previousName !==
        currentName

    ) {

        currentReplyUser =
            null;

        currentDialog =
            'ideas';

        const reply =
            document.getElementById(
                'replyDialog'
            );

        if (
            reply
        ) {

            reply.innerHTML =
                '';

            reply.style.display =

                currentName ===
                'YellowYotu'

                ?

                'block'

                :

                'none';

        }

        const chat =
            document.getElementById(
                'chatMessages'
            );

        if (
            chat
        ) {

            chat.innerHTML =
                '';
        }

        sessionStorage.setItem(
            'activeUser',
            currentName
        );

    }

    return user;

}


/* ==========================
   SWITCH TAB
========================== */

async function switchDialog(
    type
) {

    currentDialog =
        type;

    document
        .querySelectorAll(
            '.dialog'
        )
        .forEach(

            dialog => {

                dialog.classList.remove(
                    'active'
                );

            }

        );

    event
        ?.currentTarget
        ?.classList
        .add(
            'active'
        );

    const user =
        getCurrentUser();

    if (

        user
        &&
        user.nickname ===
        'YellowYotu'

    ) {

        await loadAdminDialogs();

    }

    await loadMessages();

}


/* ==========================
   SEND
========================== */

async function sendMessage() {

    const input =
        document.getElementById(
            'messageInput'
        );

    if (
        !input
    ) {

        return;

    }

    const text =
        input.value
            .trim();

    if (
        !text
    ) {

        return;

    }

    const user =
        getCurrentUser();

    if (
        !user
    ) {

        return;

    }

    let receiver =
        user.nickname;

    if (

        user.nickname ===
        'YellowYotu'

    ) {

        if (
            !currentReplyUser
        ) {

            alert(
                'Выберите чат'
            );

            return;

        }

        receiver =
            currentReplyUser;

    }

    try {

        await db
            .collection(
                'messages'
            )
            .add({

                owner:
                    receiver,

                sender:
                    user.nickname,

                dialog:
                    currentDialog,

                text:
                    text,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        input.value =
            '';

    } catch (
        error
    ) {

        console.error(
            error
        );

    }

}


/* ==========================
   LOAD
========================== */

async function loadMessages() {

    const chat =

        document
            .getElementById(
                'chatMessages'
            );

    if (
        !chat
    ) {

        return;

    }

    const user =
        getCurrentUser();

    if (
        !user
    ) {

        return;

    }

    if (

        unsubscribeMessages

    ) {

        unsubscribeMessages();

    }

    unsubscribeMessages =

        db
            .collection(
                'messages'
            )
            .orderBy(
                'createdAt'
            )
            .onSnapshot(

                snapshot => {

                    chat.innerHTML =
                        '';

                    snapshot.forEach(

                        doc => {

                            const msg =
                                doc.data();

                            const mine =

                                msg.sender ===
                                user.nickname;

                            const visible =

                                user.nickname ===
                                'YellowYotu'

                                ||

                                msg.owner ===
                                user.nickname;

                            if (
                                !visible
                            ) {

                                return;

                            }

                            if (

                                msg.dialog !==
                                currentDialog

                            ) {

                                return;

                            }

                            if (

                                msg.type ===
                                'callRequest'

                                &&

                                user.nickname ===
                                'YellowYotu'

                                &&

                                currentDialog ===
                                'support'

                            ) {

                                chat.innerHTML += `

<div class="msg left">

<div>

${msg.text}

</div>

<div class="admin-call-actions">

<button
class="btn-primary"
onclick="
approveCallRequest(
'${msg.callRequestId}'
)
">

✅ Принять

</button>

<button
class="btn-secondary"
onclick="
rejectCallRequest(
'${msg.callRequestId}'
)
">

❌ Отказать

</button>

</div>

</div>

`;

                            }

                            else {

                                chat.innerHTML += `

<div
class="
msg
${mine ? 'right' : 'left'}
"
>

${msg.text}

</div>

`;

                            }

                        }

                    );

                    chat.scrollTop =
                        chat.scrollHeight;

                }

            );

}


/* ==========================
   ADMIN
========================== */

async function loadAdminDialogs() {

    const user =
        getCurrentUser();

    if (

        !user

        ||

        user.nickname !==
        'YellowYotu'

    ) {

        return;

    }

    const area =
        document.getElementById(
            'replyDialog'
        );

    if (
        !area
    ) {

        return;

    }

    area.style.display =
        'block';

    area.innerHTML =
        '';

    const snapshot =

        await db
            .collection(
                'messages'
            )
            .where(
                'dialog',
                '==',
                currentDialog
            )
            .get();

    const chats =
        new Map();

    snapshot.forEach(

        doc => {

            const msg =
                doc.data();

            if (

                msg.sender ===
                'YellowYotu'

            ) {

                return;

            }

            if (

                !chats.has(
                    msg.owner
                )

            ) {

                chats.set(

                    msg.owner,

                    {

                        type:
                            msg.dialog,

                        count:
                            1

                    }

                );

            } else {

                chats.get(
                    msg.owner
                ).count++;

            }

        }

    );

    if (

        chats.size ===
        0

    ) {

        area.innerHTML =

`

<div
class="
dialog
active
"
>

<div
class="
dialog-title
"
>

Пусто

</div>

<div
class="
dialog-sub
"
>

Нет сообщений

</div>

</div>

`;

        return;

    }

    chats.forEach(

        (
            info,
            userName
        ) => {

            area.innerHTML +=

`

<div

class="
dialog

${
currentReplyUser ===
userName

?

'active'

:

''

}
"

onclick="

openReply(

'${userName}'

)

"

>

<div
class="
dialog-title
"
>

👤

${userName}

</div>

<div
class="
dialog-sub
"
>

Тип:

${

info.type ===
'ideas'

?

'💡 Идея'

:

'🛠 Поддержка'

}

</div>

<div
class="
dialog-sub
"

style="
margin-top:6px;
opacity:.45;
"

>

Сообщений:

${info.count}

</div>

</div>

`;

        }

    );

}


/* ==========================
   OPEN
========================== */

async function openReply(
    nickname
) {

    currentReplyUser =
        nickname;

    document
        .querySelectorAll(
            '#replyDialog .dialog'
        )
        .forEach(
            x =>
            x.classList.remove(
                'active'
            )
        );

    event
        ?.currentTarget
        ?.classList
        ?.add(
            'active'
        );

    await loadMessages();

}


/* ==========================
   START
========================== */



function openCreateCallModal() {

    document
        .getElementById(
            'createCallModal'
        )
        .classList
        .add(
            'open'
        );

}

function closeCreateCallModal() {

    document
        .getElementById(
            'createCallModal'
        )
        .classList
        .remove(
            'open'
        );

}

async function submitCallRequest() {

    const title =

        document
            .getElementById(
                'newCallTitle'
            )
            .value
            .trim();

    const url =

        document
            .getElementById(
                'newCallUrl'
            )
            .value
            .trim();

    if (

        !title
        ||

        !url

    ) {

        alert(
            'Заполните поля'
        );

        return;

    }

    if (

        !url.includes(
            'meet.google.com'
        )

    ) {

        alert(
            'Только Google Meet'
        );

        return;

    }

    const requestRef =

        await db
            .collection(
                'callRequests'
            )
            .add({

                title,

                url,

                status:
                    'pending',

                createdBy:
                    getCurrentUser()
                        .nickname,

                createdAt:

                    firebase
                        .firestore
                        .FieldValue
                        .serverTimestamp()

            });

    await db
        .collection(
            'messages'
        )
        .add({

            owner:
                'support',

            sender:
                'SYSTEM',

            dialog:
                'support',

            type:
                'callRequest',

            callRequestId:
                requestRef.id,

            text:

`🔔 Новый запрос звонка

Создал:
${getCurrentUser().nickname}

Название:
${title}

Ссылка:
${url}`,

            createdAt:

                firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()

        });

    closeCreateCallModal();

    alert(
        '⏳ Ожидайте разрешения'
    );

}

async function approveCall(
    requestId
) {

    const doc =

        await db
            .collection(
                'callRequests'
            )
            .doc(
                requestId
            )
            .get();

    const data =
        doc.data();

    await db
        .collection(
            'calls'
        )
        .add({

            title:
                data.title,

            url:
                data.url,

            createdBy:
                data.createdBy,

            createdAt:
                firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()

        });

    await db
        .collection(
            'callRequests'
        )
        .doc(
            requestId
        )
        .update({

            status:
                'approved'

        });

}

async function approveCallRequest(
    requestId
) {

    const requestDoc =
        await db
            .collection(
                'callRequests'
            )
            .doc(
                requestId
            )
            .get();

    if (
        !requestDoc.exists
    ) {

        alert(
            'Заявка не найдена'
        );

        return;

    }

    const request =
        requestDoc.data();

    if (
        request.status !== 'pending'
    ) {

        alert(
            'Заявка уже обработана'
        );

        return;

    }

    await db
        .collection(
            'calls'
        )
        .add({

            title:
                request.title,

            url:
                request.url,

            createdBy:
                request.createdBy,

            approvedBy:
                getCurrentUser()
                    .nickname,

            createdAt:
                firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()

        });

    await db
        .collection(
            'callRequests'
        )
        .doc(
            requestId
        )
        .update({

            status:
                'approved'

        });

    alert(
        'Звонок разрешён'
    );
}

async function rejectCallRequest(
    requestId
) {

    await db
        .collection(
            'callRequests'
        )
        .doc(
            requestId
        )
        .update({

            status:
                'rejected'

        });

    alert(
        'Заявка отклонена'
    );
}


function loadApprovedCalls() {

    const grid =

        document
            .querySelector(
                '.calls-grid'
            );

    if (
        !grid
    ) {

        return;

    }

    db
        .collection(
            'calls'
        )
        .orderBy(
            'createdAt'
        )
        .onSnapshot(

            snapshot => {

                document
                    .querySelectorAll(
                        '.firebase-call'
                    )
                    .forEach(

                        x => {

                            x.remove();

                        }

                    );

                snapshot.forEach(

                    doc => {

                        const call =
                            doc.data();

                        grid.insertAdjacentHTML(

                            'beforeend',

`

<div
class="
call-card
firebase-call
"
>

<div
class="
call-card-top
"
>

<div
class="
call-badge
"
>

🌐 Пользовательский

</div>

<div
class="
call-live
"
>

<span
class="
live-dot
"
></span>

Open

</div>

</div>

<div
class="
call-card-body
"
>

<div
class="
call-avatar
"
>

💬

</div>

<h2>

${call.title}

</h2>

<p>

Создал:
${call.createdBy}

</p>

</div>

<button

class="
btn-join
"

onclick="
joinCall(
'${call.url}'
)
"

>

Присоединиться

</button>

<button

class="
btn-copy
"

onclick="
copyLink(
'${call.url}',
this
)
"

>

📋 Скопировать

</button>

</div>

`

                        );

                    }

                );

            }

        );

}

applyThemeFromStorage();
applyCustomFromStorage();

// Запускаем
loadVersion();
loadUserCount();