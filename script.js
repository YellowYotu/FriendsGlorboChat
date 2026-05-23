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

// Загрузка страницы и автоматическое восстановление сохраненного стиля
window.onload = () => {
    // 1. Восстанавливаем тему
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme;
    
    // Синхронизируем выпадающий список выбора темы
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) themeSelector.value = savedTheme;

    // 2. ИСПРАВЛЕНО: Сначала восстанавливаем сохраненные цвета в ползунках, а затем применяем их!
    if (localStorage.getItem('bColor')) {
        document.getElementById('btnColor').value = localStorage.getItem('bColor');
    }
    if (localStorage.getItem('cColor')) {
        document.getElementById('cardColor').value = localStorage.getItem('cColor');
    }
    
    // Вызываем вашу функцию, которая теперь считает восстановленные цвета из ползунков и покрасит сайт
    if (localStorage.getItem('bColor') || localStorage.getItem('cColor')) {
        updateCustomStyle();
    }
};
