const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas for mobile and desktop
function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth - 20, 900);
  canvas.width = maxWidth;
  canvas.height = maxWidth > 600 ? 450 : 300;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Score elements
const playerScoreEl = document.getElementById('playerScore');
const ziaScoreEl = document.getElementById('ziaScore');
const gainedScoreEl = document.getElementById('gainedScore');

let gainedPoints = 0;
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

// Score pop animations
let scorePops = [];
let hitFlash = false;
let flashTime = 0;

function checkHit() {
  return tareq.visible &&
    pointerX >= tareq.x &&
    pointerX <= tareq.x + tareq.width &&
    pointerY >= tareq.y &&
    pointerY <= tareq.y + tareq.height;
}

function onClick() {
  if (checkHit()) {
    gainedPoints += 10;
    ziaPoints = Math.floor(gainedPoints * 0.1);
    playerPoints = gainedPoints - ziaPoints;
    updateScores();
    scorePops.push({ x: pointerX, y: pointerY, text: "+10", opacity: 1 });
    hitFlash = true;
    flashTime = Date.now();
    hideTareq();
  }
}
canvas.addEventListener('click', onClick);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  updatePointer(e); // instant update on tap
  onClick();
}, { passive: false });

function updateScores() {
  gainedScoreEl.textContent = gainedPoints;
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

  if (hitFlash && Date.now() - flashTime < 150) {
    ctx.fillStyle = "#FF3B3B";
    ctx.fillRect(tareq.x, tareq.y, tareq.width, tareq.height);
  } else {
    ctx.drawImage(tareqImg, tareq.x, tareq.y, tareq.width, tareq.height);
    hitFlash = false;
  }
}

function drawKhamba() {
  const w = 100;
  const h = 40;
  ctx.drawImage(khambaImg, pointerX - w / 3, pointerY - h / 2, 52, 72);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Tarek
  drawTareq();

  // Score pops
  scorePops.forEach((pop, i) => {
    ctx.fillStyle = `rgba(255,255,255,${pop.opacity})`;
    ctx.font = 'bold 20px Inter';
    ctx.fillText(pop.text, pop.x, pop.y);
    pop.y -= 1;
    pop.opacity -= 0.02;
  });
  scorePops = scorePops.filter(p => p.opacity > 0);

  // Khamba
  drawKhamba();

  // Hide Tarek if time’s up
  if (tareq.visible && (Date.now() - tareq.timer > tareq.showTime)) {
    hideTareq();
  }

  requestAnimationFrame(gameLoop);
}

// Tarek appears randomly every 1.8s
setInterval(() => {
  if (!tareq.visible) {
    showTareq();
  }
}, 1800);

// Start game
updateScores();
gameLoop();
