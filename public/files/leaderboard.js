document.addEventListener('DOMContentLoaded', async () => {
  const leaderboardContainer = document.getElementById('leaderboard-container');

  try {
    const response = await fetch('/api/leaderboard');
    const scores = await response.json();

    if (scores.length === 0) {
      leaderboardContainer.innerHTML = '<p style="text-align: center; font-size: 18px;">No scores yet. Be the first!</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>টপ</th>
          <th>নাম</th>
          <th>পয়েন্ট</th>
          <th> আপনার অংশ</th>
          <th>দেশ নেতার ১০%</th>
        </tr>
      </thead>
      <tbody>
        ${scores.map((score, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${score.name}</td>
            <td>${score.score}</td>
            <td>${score.score *0.9}</td>
            <td>${score.score *0.1}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    leaderboardContainer.appendChild(table);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    leaderboardContainer.innerHTML = '<p style="text-align: center; font-size: 18px; color: red;">Error loading leaderboard. Please try again later.</p>';
  }
});