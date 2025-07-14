const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve all static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const leaderboardFilePath = path.join(__dirname, 'leaderboard.json');

function readLeaderboard() {
  try {
    const data = fs.readFileSync(leaderboardFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeLeaderboard(data) {
  fs.writeFileSync(leaderboardFilePath, JSON.stringify(data, null, 2));
}

app.get('/api/leaderboard', (req, res) => {
  const leaderboard = readLeaderboard();
  res.json(leaderboard);
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and numeric score required' });
  }

  const leaderboard = readLeaderboard();
  const existingIndex = leaderboard.findIndex(entry => entry.name === name);

  if (existingIndex > -1) {
    if (score > leaderboard[existingIndex].score) {
      leaderboard[existingIndex].score = score;
    }
  } else {
    leaderboard.push({ name, score, playerPercentage: 90, leaderPercentage: 10 });
  }

  leaderboard.sort((a, b) => b.score - a.score);

  writeLeaderboard(leaderboard.slice(0, 10));
  res.status(201).json({ message: 'Score saved' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/leaderboard.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
