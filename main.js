import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { firebaseConfig } from './firebase.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;
let score = 0;

function startGame() {
  document.getElementById('menu').classList.add('hidden');
  gameRunning = true;
  score = 0;
  loop();
}

function endGame() {
  gameRunning = false;
  const username = document.getElementById('username').value || 'Anonymous';
  const scoresRef = ref(db, 'scores');
  const newScoreRef = push(scoresRef);
  set(newScoreRef, {
    username,
    score,
    timestamp: Date.now()
  });
  document.getElementById('finalScore').innerText = `Game Over! Score: ${score}`;
  document.getElementById('gameover').classList.remove('hidden');
  loadLeaderboard();
}

function loop() {
  if (!gameRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'cyan';
  ctx.beginPath();
  ctx.arc(100, canvas.height / 2, 20, 0, Math.PI * 2);
  ctx.fill();
  score++;
  requestAnimationFrame(loop);
}

function loadLeaderboard() {
  const scoresRef = ref(db, 'scores');
  onValue(scoresRef, (snapshot) => {
    const data = snapshot.val();
    const scoreList = Object.values(data || {}).sort((a, b) => b.score - a.score).slice(0, 10);
    const ul = document.getElementById('scores');
    ul.innerHTML = '';
    scoreList.forEach(s => {
      const li = document.createElement('li');
      li.textContent = `${s.username}: ${s.score}`;
      ul.appendChild(li);
    });
    document.getElementById('leaderboard').classList.remove('hidden');
  });
}

window.startGame = startGame;
window.restartGame = () => location.reload();
