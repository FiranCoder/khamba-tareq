let playerName = '';

window.addEventListener('load', () => {
  const nameInput = document.getElementById('playerNameInput');
  const saveBtn = document.getElementById('saveNameBtn'); // Make sure this button exists
  const savedName = localStorage.getItem('playerName');

  if (savedName) {
    playerName = savedName;
    document.getElementById('nameModal').style.display = 'none';
  } else {
    document.getElementById('nameModal').style.display = 'flex';
  }

  // Pressing Enter inside the input
  nameInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      const name = nameInput.value.trim();
      if (name) {
        playerName = name;
        localStorage.setItem('playerName', name);
        document.getElementById('nameModal').style.display = 'none';
      }
    }
  });

  // Clicking the "Save" button
  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) {
      playerName = name;
      localStorage.setItem('playerName', name);
      document.getElementById('nameModal').style.display = 'none';
    }
  });
});

function showLeaderboard() {
  window.location.href = 'leaderboard.html';
}

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
khambaImg.src = 'files/khamba.png';

const tareqImg = new Image();
tareqImg.src = 'files/tareq.png';

const tareq = {
  x: 0,
  y: 0,
  width: 160,
  height: 200,
  visible: false,
  timer: 0,
  showTime: 1200
};

let pointerX = canvas.width / 4;
let pointerY = canvas.height / 4;



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

async function saveScore() {
  if (!playerName) return;

  const scoreData = {
    name: playerName,
    score: gainedPoints,
    playerPercentage: 90,
    leaderPercentage: 10,
  };

  try {
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });
  } catch (error) {
    console.error('Failed to save score:', error);
  }
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
    saveScore();
  }
}

canvas.addEventListener('click', onClick);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  updatePointer(e);
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
