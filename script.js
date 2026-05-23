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

// Загрузка страницы и восстановление сохраненного стиля
window.onload = () => {
    document.body.className = localStorage.getItem('theme') || 'dark';
    if (localStorage.getItem('bColor')) {
        updateCustomStyle();
    }
};
