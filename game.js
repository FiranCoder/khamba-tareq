const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth - 20, 900);
  canvas.width = maxWidth;
  canvas.height = maxWidth > 600 ? 450 : 300;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const playerScoreEl = document.getElementById('playerScore');
const ziaScoreEl = document.getElementById('ziaScore');

let playerPoints = 0;
let ziaPoints = 0;

// Load images
const khambaImg = new Image();
khambaImg.src = 'khamba.png';

const tareqImg = new Image();
tareqImg.src = 'tareq.jpg';

const tareq = {
  x: 0,
  y: 0,
  width: 80,
  height: 100,
  visible: false,
  timer: 0,
  showTime: 1200
};

let pointerX = canvas.width / 2;
let pointerY = canvas.height / 2;

function updatePointer(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    pointerX = e.touches[0].clientX - rect.left;
    pointerY = e.touches[0].clientY - rect.top;
  } else {
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
  }
}
canvas.addEventListener('mousemove', updatePointer);
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  updatePointer(e);
}, { passive: false });

function checkHit() {
  return tareq.visible &&
    pointerX >= tareq.x &&
    pointerX <= tareq.x + tareq.width &&
    pointerY >= tareq.y &&
    pointerY <= tareq.y + tareq.height;
}

function onClick() {
  if (checkHit()) {
    playerPoints += 10;
    ziaPoints = Math.floor(playerPoints * 0.1);
    updateScores();
    hideTareq();
  }
}
canvas.addEventListener('click', onClick);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  updatePointer(e); // move khamba instantly to touch
  onClick();         // try to hit
}, { passive: false });

function updateScores() {
  playerScoreEl.textContent = playerPoints;
  ziaScoreEl.textContent = ziaPoints;
}

function showTareq() {
  tareq.x = Math.random() * (canvas.width - tareq.width);
  tareq.y = Math.random() * (canvas.height - tareq.height);
  tareq.visible = true;
  tareq.timer = Date.now();
}

function hideTareq() {
  tareq.visible = false;
}

function drawTareq() {
  if (!tareq.visible) return;
  ctx.drawImage(tareqImg, tareq.x, tareq.y, tareq.width, tareq.height);
}

function drawKhamba() {
  const w = 100;
  const h = 40;
  ctx.drawImage(khambaImg, pointerX - w / 2, pointerY - h / 2, w, h);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTareq();
  drawKhamba();

  if (tareq.visible && (Date.now() - tareq.timer > tareq.showTime)) {
    hideTareq();
  }

  requestAnimationFrame(gameLoop);
}

// Tareq shows up every 1.8 seconds if not already visible
setInterval(() => {
  if (!tareq.visible) {
    showTareq();
  }
}, 1800);

let lastTapX = 0;
let lastTapY = 0;
let showTapFeedback = false;
let tapFeedbackTimer = 0;

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  updatePointer(e);
  lastTapX = pointerX;
  lastTapY = pointerY;
  showTapFeedback = true;
  tapFeedbackTimer = Date.now();
  onClick();
}, { passive: false });

// inside gameLoop(), add:
if (showTapFeedback && Date.now() - tapFeedbackTimer < 150) {
  ctx.beginPath();
  ctx.arc(lastTapX, lastTapY, 20, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
} else {
  showTapFeedback = false;
}


updateScores();
gameLoop();
