const ash = document.getElementById('ash');
const obstaclesContainer = document.getElementById('obstacles');
const scoreDisplay = document.querySelector('#score span');
const startButton = document.getElementById('start');

let score = 0;
let isJumping = false;
let gameSpeed = 5;
let gameInterval;

// Jump mechanics
document.addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.key === 'ArrowUp') && !isJumping) {
    isJumping = true;
    ash.style.bottom = '200px';
    setTimeout(() => {
      ash.style.bottom = '100px';
      isJumping = false;
    }, 500);
  }
});

// Start game
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  score = 0;
  obstaclesContainer.innerHTML = '';
  
  gameInterval = setInterval(() => {
    // Create obstacles
    if (Math.random() < 0.3) {
      const obstacle = document.createElement('div');
      obstacle.className = 'obstacle';
      obstacle.style.height = `${Math.random() * 100 + 50}px`;
      obstacle.style.right = '0px';
      obstaclesContainer.appendChild(obstacle);
      moveObstacle(obstacle);
    }
    
    // Increase score
    score++;
    scoreDisplay.textContent = score;
    
    // Speed up
    if (score % 50 === 0) gameSpeed += 0.5;
  }, 100);
});

// Obstacle movement
function moveObstacle(obstacle) {
  let pos = 0;
  const move = () => {
    pos += gameSpeed;
    obstacle.style.right = `${pos}px`;
    
    // Collision detection
    const ashRect = ash.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();
    
    if (
      ashRect.left < obsRect.right &&
      ashRect.right > obsRect.left &&
      ashRect.top < obsRect.bottom &&
      ashRect.bottom > obsRect.top
    ) {
      endGame();
    }
    
    if (pos < 400) {
      requestAnimationFrame(move);
    } else {
      obstacle.remove();
    }
  };
  move();
}

// Game over
function endGame() {
  clearInterval(gameInterval);
  alert(`GAME OVER!\nFINAL SCORE: ${score}\n\nMade by Ash`);
  startButton.style.display = 'block';
}
