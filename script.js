// ── ACCENT SWATCHES ──
const ACCENTS = ['#58a6ff','#3fb950','#f85149','#e3b341','#bc8cff','#ff7b72','#79c0ff','#56d364'];

const cg = document.getElementById('colorGrid');
ACCENTS.forEach(c => {
  const s = document.createElement('div');
  s.className = 'color-swatch' + (c === '#58a6ff' ? ' active' : '');
  s.style.background = c;
  s.onclick = () => {
    document.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('active'));
    s.classList.add('active');
    document.documentElement.style.setProperty('--accent', c);
    localStorage.setItem('accent', c);
  };
  cg.appendChild(s);
});

// ── NAVIGATION ──
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

function showSub(id, btn) {
  document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (btn) btn.classList.add('active');
}

function setPill(btn, theme) {
  document.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.body.className = theme;
  localStorage.setItem('theme', theme);
}

function resetAll() { localStorage.clear(); location.reload(); }

// ── MODAL ──
function openModal()  { document.getElementById('joinModal').classList.add('open'); document.getElementById('peerInput').focus(); }
function closeModal() { document.getElementById('joinModal').classList.remove('open'); }

// ── COPY ID ──
function copyId() {
  const id = document.getElementById('myPeerId').textContent;
  if (id === '…') return;
  navigator.clipboard.writeText(id).then(() => {
    const btn = document.querySelector('.btn-copy');
    btn.textContent = 'Скопировано!';
    setTimeout(() => btn.textContent = 'Скопировать', 1500);
  });
}

// ── WEBRTC / PEERJS ──
let peer, localStream, currentCall;
let micOn = true, camOn = true;

async function initMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('localVideo').srcObject = localStream;
  } catch (e) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e2) {
      console.warn('Нет доступа к медиа:', e2);
    }
  }
}

function initPeer() {
  peer = new Peer();
  peer.on('open', id => {
    document.getElementById('myPeerId').textContent = id;
    document.getElementById('statusText').textContent = 'Готов к звонку';
  });
  peer.on('call', call => {
    call.answer(localStream);
    handleStream(call);
  });
  peer.on('error', () => {
    document.getElementById('statusText').textContent = 'Ошибка подключения';
  });
}

function handleStream(call) {
  currentCall = call;
  call.on('stream', s => {
    document.getElementById('remoteVideo').srcObject = s;
    document.getElementById('videoArea').classList.add('active');
  });
  call.on('close', () => {
    document.getElementById('videoArea').classList.remove('active');
    document.getElementById('remoteVideo').srcObject = null;
    currentCall = null;
  });
}

function doCall() {
  const id = document.getElementById('peerInput').value.trim();
  closeModal();
  if (!id || !peer) return;
  const call = peer.call(id, localStream);
  handleStream(call);
}

function endCall() {
  if (currentCall) currentCall.close();
  document.getElementById('videoArea').classList.remove('active');
  document.getElementById('remoteVideo').srcObject = null;
  currentCall = null;
}

function toggleMute() {
  micOn = !micOn;
  if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = micOn);
  document.getElementById('muteBtn').style.opacity = micOn ? '1' : '0.4';
}

function toggleCam() {
  camOn = !camOn;
  if (localStream) localStream.getVideoTracks().forEach(t => t.enabled = camOn);
  document.getElementById('camBtn').style.opacity = camOn ? '1' : '0.4';
}

// ── KEYBOARD SHORTCUTS ──
document.getElementById('peerInput').addEventListener('keydown', e => {
  if (e.key === 'Enter')  doCall();
  if (e.key === 'Escape') closeModal();
});

document.getElementById('joinModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── INIT ──
const savedTheme  = localStorage.getItem('theme')  || 'dark';
const savedAccent = localStorage.getItem('accent');

document.body.className = savedTheme;
if (savedAccent) {
  document.documentElement.style.setProperty('--accent', savedAccent);
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.style.background === savedAccent);
  });
}

initMedia().then(() => initPeer());
// miski
