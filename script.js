// --- ТВОИ СТАРЫЕ ФУНКЦИИ ---
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
    document.querySelectorAll('.btn-modern').forEach(el => el.style.background = b);
    localStorage.setItem('bColor', b);
}
function resetAll() { localStorage.clear(); location.reload(); }
function checkPassword() { const p = prompt('Пароль:'); if(p==="1234") alert('Вход!'); }

window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme;
    if(document.getElementById('theme-selector')) document.getElementById('theme-selector').value = savedTheme;
};

// --- ТВОИ НОВЫЕ ЗВОНКИ (PEERJS) ---
const peer = new Peer(); 
let localStream;

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => { localStream = stream; })
    .catch(err => console.error("Нет камеры", err));

peer.on('open', id => {
    document.getElementById('my-peer-id').innerText = "Ваш ID: " + id;
});

function initiateCall() {
    const peerId = prompt("Введите ID собеседника:");
    if (!peerId) return;
    
    const call = peer.call(peerId, localStream);
    call.on('stream', stream => {
        const v = document.getElementById('remoteVideo');
        v.srcObject = stream;
        v.style.display = 'block';
    });
}

peer.on('call', call => {
    if (confirm("Входящий вызов! Принять?")) {
        call.answer(localStream);
        call.on('stream', stream => {
            const v = document.getElementById('remoteVideo');
            v.srcObject = stream;
            v.style.display = 'block';
        });
    }
});
