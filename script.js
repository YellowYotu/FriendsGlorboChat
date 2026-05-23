let currentJitsiApi = null; // Здесь хранится процесс активного созвона

function showPage(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    
    // Если уходим со страницы "Звонки", автоматически выключаем камеру и микрофон
    if (id !== 'calls' && currentJitsiApi) {
        closeCall();
    }
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

// --- СИСТЕМА ВСТРОЕННЫХ ЗВОНКОВ JITSI ---

function startCall(roomName) {
    // Если какой-то звонок уже активен, закрываем его
    if (currentJitsiApi) {
        closeCall();
    }

    const container = document.getElementById('jitsi-container');
    const callsCard = document.getElementById('calls-list-card');
    
    // Скрываем карточку со списком звонков
    callsCard.style.display = 'none';
    container.innerHTML = ''; 
    container.style.marginBottom = '20px';

    const domain = 'meet.jit.si';
    const options = {
        roomName: roomName, // Уникальное имя комнаты для ваших друзей
        width: '100%',
        height: 550,
        parentNode: container,
        lang: 'ru',
        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 
                'settings', 'raisehand', 'videoquality', 'tileview'
            ],
        }
    };

    // Магия! Разворачиваем видеосвязь прямо внутри вашего сайта
    currentJitsiApi = new JitsiMeetExternalAPI(domain, options);

    // Создаем красивую кнопку "Покинуть созвон" под окном видео
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-modern';
    closeBtn.style.marginTop = '15px';
    closeBtn.style.background = '#ef4444'; // Красный цвет
    closeBtn.textContent = '❌ Покинуть созвон';
    closeBtn.onclick = closeCall;
    container.appendChild(closeBtn);
}

function closeCall() {
    if (currentJitsiApi) {
        currentJitsiApi.dispose(); // Полностью отключаем камеру и микрофон
        currentJitsiApi = null;
    }
    // Возвращаем обратно список звонков
    document.getElementById('jitsi-container').innerHTML = '';
    document.getElementById('calls-list-card').style.display = 'block';
}

// --- БЕЗОПАСНАЯ СИСТЕМА ДЛЯ ПРИВАТНОГО ЗВОНКА (ЧЕРЕЗ СЕРВЕР) ---

async function checkPassword() {
    const userPassword = prompt('Введи пароль для доступа к приватному звонку:');
    if (!userPassword) return; // Если нажали "Отмена"

    try {
        const response = await fetch(`/api/private-call?password=${encodeURIComponent(userPassword)}`);
        const data = await response.json();

        if (data.success) {
            alert('Пароль верный! Запускаем приватный звонок...');
            // Запускаем приватную встроенную комнату Jitsi
            startCall('glorbo-private-secret-room');
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
