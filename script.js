// --- ТВОИ ОРИГИНАЛЬНЫЕ ФУНКЦИИ ---
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
    document.documentElement.style.setProperty('--accent', b);
    localStorage.setItem('bColor', b);
}
function resetAll() { localStorage.clear(); location.reload(); }

window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = savedTheme;
};

// --- ЛОГИКА ЗВОНКОВ (ВКЛЕЕНА) ---
const peer = new Peer();
let localStream;
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => localStream = s);

function initiateCall() {
    const peerId = prompt("Введите ID:");
    if (!peerId) return;
    const call = peer.call(peerId, localStream);
    call.on('stream', s => {
        const v = document.getElementById('remoteVideo');
        v.srcObject = s;
        v.style.display = 'block';
    });
}
peer.on('call', call => {
    call.answer(localStream);
    call.on('stream', s => {
        const v = document.getElementById('remoteVideo');
        v.srcObject = s;
        v.style.display = 'block';
    });
});
