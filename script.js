function showPage(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

// Переключение подстраниц в настройках
function showSub(id) {
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Смена предустановленных тем
function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    document.body.className = theme;
    localStorage.setItem('theme', theme);
}

// Кастомизация цветов пользователем
function updateCustomStyle() {
    const b = document.getElementById('btnColor').value;
    const c = document.getElementById('cardColor').value;
    document.querySelectorAll('.btn-modern').forEach(el => el.style.background = b);
    document.querySelectorAll('.card').forEach(el => el.style.backgroundColor = c);
    localStorage.setItem('bColor', b);
    localStorage.setItem('cColor', c);
}

// Полный сброс настроек и тем
function resetAll() {
    localStorage.clear();
    location.reload();
}

// --- БЕЗОПАСНАЯ СИСТЕМА ДЛЯ ПРИВАТНОГО ЗВОНКА (ЧЕРЕЗ СЕРВЕР) ---

async function checkPassword() {
    // Всплывающее окно для ввода пароля в браузере
    const userPassword = prompt('Введи пароль для доступа к приватному звонку:');
    if (!userPassword) return; // Если пользователь нажал "Отмена" или ничего не ввёл

    try {
        // Отправляем введённый пароль на скрытую серверную проверку в Vercel
        const response = await fetch(`/api/private-call?password=${encodeURIComponent(userPassword)}`);
        const data = await response.json();

        if (data.success && data.url) {
            alert('Пароль верный! Перенаправляем в звонок...');
            window.open(data.url, '_blank'); // Безопасно открываем секретную ссылку
        } else {
            alert('❌ Неверный пароль! Доступ заблокирован.');
        }
    } catch (error) {
        console.error('Ошибка проверки пароля:', error);
        alert('❌ Ошибка соединения с сервером.');
    }
}

// Загрузка страницы и автоматическое восстановление сохраненного стиля
window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme;
    
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) themeSelector.value = savedTheme;

    if (localStorage.getItem('bColor')) {
        document.getElementById('btnColor').value = localStorage.getItem('bColor');
    }
    if (localStorage.getItem('cColor')) {
        document.getElementById('cardColor').value = localStorage.getItem('cColor');
    }
    
    if (localStorage.getItem('bColor') || localStorage.getItem('cColor')) {
        updateCustomStyle();
    }
};
