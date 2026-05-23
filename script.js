function showPage(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

function showSub(id) {
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    document.body.className = theme;
    localStorage.setItem('theme', theme);
}

function updateCustomStyle() {
    const b = document.getElementById('btnColor').value;
    const c = document.getElementById('cardColor').value;
    document.querySelectorAll('.btn-modern').forEach(el => el.style.background = b);
    document.querySelectorAll('.card').forEach(el => el.style.backgroundColor = c);
    localStorage.setItem('bColor', b);
    localStorage.setItem('cColor', c);
}

function resetAll() {
    localStorage.clear();
    location.reload();
}

// --- СИСТЕМА ОБНОВЛЕНИЯ СЧЕТЧИКОВ ОНЛАЙНА ---

async function updateSingleCallCount(callItem) {
    const linkElement = callItem.querySelector('.btn-modern');
    const countElement = callItem.querySelector('.user-count');
    if (!linkElement || !countElement) return;

    const meetUrl = linkElement.href;

    try {
        const response = await fetch(`/api/participants?url=${encodeURIComponent(meetUrl)}`);
        const data = await response.json();

        if (data.count !== undefined) {
            const count = data.count;
            let word = 'человек';
            
            // Склонение русского языка: 1 человек, 2 человека, 5 человек
            if (count % 10 === 1 && count % 100 !== 11) {
                word = 'человек';
            } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
                word = 'человека';
            }

            countElement.textContent = `👥 ${count} ${word} онлайн`;
        }
    } catch (error) {
        console.error('Ошибка обновления:', error);
        countElement.textContent = `👥 0 человек онлайн`;
    }
}

function updateAllCalls() {
    document.querySelectorAll('.call-item').forEach(item => updateSingleCallCount(item));
}

// Загрузка страницы
window.onload = () => {
    document.body.className = localStorage.getItem('theme') || 'dark';
    if(localStorage.getItem('bColor')) {
        updateCustomStyle();
    }
    
    updateAllCalls();
    setInterval(updateAllCalls, 20000); 
};
