// Game Constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const INITIAL_GATE_SPEED = 3;
const GATE_SPAWN_INTERVAL = 1500;
const GATE_MIN_GAP = 80;
const GATE_WIDTH = 50;
const PARTICLE_COUNT = 10;
const QUOTES = [
    "Float like a feather",
    "Glide through the night",
    "Find your rhythm",
    "Dance with gravity",
    "Embrace the void",
    "Neon dreams await",
    "Sync with the cosmos",
    "Ride the photon waves"
];

// Game State
let gameState = {
    score: 0,
    highScore: localStorage.getItem('ashglide_highScore') || 0,
    gameOver: false,
    playing: false,
    mute: localStorage.getItem('ashglide_mute') === 'true',
    zenMode: false,
    currentTheme: localStorage.getItem('ashglide_theme') || 'neon',
    gateSpeed: INITIAL_GATE_SPEED
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.querySelector('.start-screen');
const gameOverScreen = document.querySelector('.game-over-screen');
const currentScoreEl = document.getElementById('currentScore');
const finalScoreEl = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const muteBtn = document.getElementById('muteBtn');
const zenModeBtn = document.getElementById('zenMode');
const usernameInput = document.getElementById('username');
const submitScoreBtn = document.getElementById('submitScore');
const quoteEl = document.querySelector('.quote');
const themeSwitcher = document.querySelector('.theme-switcher');
const leaderboardList = document.getElementById('leaderboardList');

// Game Objects
let player = {
    x: 100,
    y: 0,
    radius: 20,
    velocity: 0,
    trail: []
};

let gates = [];
let particles = [];
let stars = [];
let quoteTimeout;
let gateSpawnTimer = 0;
let animationId;
let lastTimestamp = 0;

// Initialize Canvas
function initCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    player.y = canvas.height / 2;
    
    // Create stars for background
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', gameState.currentTheme);
    
    // Set active theme button
    document.querySelectorAll('.theme-switcher button').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.theme === gameState.currentTheme) {
            btn.classList.add('active');
        }
    });
    
    // Set mute state
    muteBtn.textContent = gameState.mute ? '🔇 SOUND OFF' : '🔊 SOUND ON';
}

// Initialize Game
function initGame() {
    player = {
        x: 100,
        y: canvas.height / 2,
        radius: 20,
        velocity: 0,
        trail: []
    };
    
    gates = [];
    particles = [];
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.playing = true;
    gameState.gateSpeed = INITIAL_GATE_SPEED;
    currentScoreEl.textContent = '0';
    
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    
    // Start game loop
    lastTimestamp = 0;
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

// Game Loop
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update and draw player
    updatePlayer(deltaTime);
    drawPlayer();
    
    // Update and draw gates
    updateGates(deltaTime);
    drawGates();
    
    // Update and draw particles
    updateParticles();
    drawParticles();
    
    // Draw UI
    drawUI();
    
    // Show random quotes
    if (!quoteTimeout && Math.random() < 0.002) {
        showRandomQuote();
    }
    
    // Continue game loop if not game over
    if (!gameState.gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Draw Background
function drawBackground() {
    // Draw gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(15, 25, 35, 0.7)');
    gradient.addColorStop(1, 'rgba(94, 0, 110, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Move stars
        star.x -= star.speed;
        if (star.x < -10) {
            star.x = canvas.width + 10;
            star.y = Math.random() * canvas.height;
        }
    });
    ctx.globalAlpha = 1;
}

// Update Player
function updatePlayer(deltaTime) {
    // Apply gravity
    player.velocity += GRAVITY * (deltaTime / 16);
    player.y += player.velocity;
    
    // Boundary check
    if (player.y - player.radius < 0) {
        player.y = player.radius;
        player.velocity = 0;
    }
    
    if (player.y + player.radius > canvas.height) {
        player.y = canvas.height - player.radius;
        player.velocity = 0;
        if (!gameState.zenMode) endGame();
    }
    
    // Add to trail
    player.trail.push({x: player.x, y: player.y});
    if (player.trail.length > 15) player.trail.shift();
}

// Draw Player
function drawPlayer() {
    // Draw trail
    ctx.globalAlpha = 0.3;
    player.trail.forEach((pos, i) => {
        const radius = player.radius * (i / player.trail.length);
        const gradient = ctx.createRadialGradient(
            pos.x, pos.y, 0,
            pos.x, pos.y, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Draw player
    const gradient = ctx.createRadialGradient(
        player.x, player.y, 0,
        player.x, player.y, player.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.8, getComputedStyle(document.documentElement).getPropertyValue('--orb'));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow
    ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--orb');
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Update Gates
function updateGates(deltaTime) {
    // Spawn new gates
    gateSpawnTimer += deltaTime;
    if (gateSpawnTimer > GATE_SPAWN_INTERVAL) {
        spawnGate();
        gateSpawnTimer = 0;
    }
    
    // Update gate positions
    for (let i = gates.length - 1; i >= 0; i--) {
        const gate = gates[i];
        gate.x -= gameState.gateSpeed * (deltaTime / 16);
        
        // Check if passed
        if (!gate.passed && gate.x + GATE_WIDTH < player.x) {
            gate.passed = true;
            gameState.score++;
            currentScoreEl.textContent = gameState.score;
            
            // Increase difficulty
            gameState.gateSpeed += 0.05;
        }
        
        // Check collision
        if (!gameState.zenMode && checkCollision(gate)) {
            endGame();
        }
        
        // Remove off-screen gates
        if (gate.x + GATE_WIDTH < 0) {
            gates.splice(i, 1);
        }
    }
}

// Spawn Gate
function spawnGate() {
    const gapPosition = Math.random() * (canvas.height - GATE_MIN_GAP - 100) + 50;
    const gapHeight = Math.max(GATE_MIN_GAP, 200 - gameState.score * 0.5);
    
    gates.push({
        x: canvas.width,
        gapPosition: gapPosition,
        gapHeight: gapHeight,
        passed: false
    });
}

// Check Collision
function checkCollision(gate) {
    // Check if player is within gate's x range
    if (player.x + player.radius > gate.x && player.x - player.radius < gate.x + GATE_WIDTH) {
        // Check if player is outside the gap
        if (player.y - player.radius < gate.gapPosition || 
            player.y + player.radius > gate.gapPosition + gate.gapHeight) {
            return true;
        }
    }
    return false;
}

// Draw Gates
function drawGates() {
    const gateColor = getComputedStyle(document.documentElement).getPropertyValue('--gate');
    
    gates.forEach(gate => {
        // Top gate
        ctx.fillStyle = gateColor;
        ctx.shadowColor = gateColor;
        ctx.shadowBlur = 15;
        ctx.fillRect(gate.x, 0, GATE_WIDTH, gate.gapPosition);
        
        // Bottom gate
        ctx.fillRect(
            gate.x, 
            gate.gapPosition + gate.gapHeight, 
            GATE_WIDTH, 
            canvas.height - (gate.gapPosition + gate.gapHeight)
        );
        ctx.shadowBlur = 0;
        
        // Gate inner glow
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(gate.x, 0, GATE_WIDTH, gate.gapPosition);
        ctx.strokeRect(
            gate.x, 
            gate.gapPosition + gate.gapHeight, 
            GATE_WIDTH, 
            canvas.height - (gate.gapPosition + gate.gapHeight)
        );
    });
}

// Update Particles
function updateParticles() {
    // Add new particles to player
    if (gameState.playing) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (Math.random() < 0.3) {
                particles.push({
                    x: player.x,
                    y: player.y,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 2,
                    color: getComputedStyle(document.documentElement).getPropertyValue('--orb'),
                    life: 30
                });
            }
        }
    }
    
    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Draw Particles
function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Draw UI
function drawUI() {
    // Draw score in canvas for visual appeal
    ctx.font = '24px Orbitron';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${gameState.score}`, canvas.width - 20, 40);
    ctx.textAlign = 'left';
}

// Show Random Quote
function showRandomQuote() {
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    quoteEl.textContent = `"${quote}"`;
    quoteEl.style.opacity = '1';
    
    quoteTimeout = setTimeout(() => {
        quoteEl.style.opacity = '0';
        quoteTimeout = setTimeout(() => {
            quoteEl.textContent = '';
            quoteTimeout = null;
        }, 1000);
    }, 3000);
}

// Jump Action
function jump() {
    player.velocity = JUMP_FORCE;
    
    // Add jump particles
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 1) * 4,
            color: '#ffffff',
            life: Math.random() * 20 + 10
        });
    }
}

// End Game
function endGame() {
    gameState.gameOver = true;
    gameState.playing = false;
    
    // Add explosion particles
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            size: Math.random() * 6 + 2,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            color: getComputedStyle(document.documentElement).getPropertyValue('--orb'),
            life: Math.random() * 40 + 20
        });
    }
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('ashglide_highScore', gameState.highScore);
    }
    
    // Show game over screen
    setTimeout(() => {
        finalScoreEl.textContent = gameState.score;
        gameOverScreen.classList.add('active');
    }, 1000);
    
    cancelAnimationFrame(animationId);
}

// Event Listeners
function setupEventListeners() {
    // Start game
    startBtn.addEventListener('click', initGame);
    
    // Restart game
    restartBtn.addEventListener('click', initGame);
    
    // Jump controls
    canvas.addEventListener('click', jump);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameState.playing) {
            jump();
            e.preventDefault();
        }
    });
    
    // Mute toggle
    muteBtn.addEventListener('click', () => {
        gameState.mute = !gameState.mute;
        muteBtn.textContent = gameState.mute ? '🔇 SOUND OFF' : '🔊 SOUND ON';
        localStorage.setItem('ashglide_mute', gameState.mute);
    });
    
    // Zen mode toggle
    zenModeBtn.addEventListener('click', () => {
        gameState.zenMode = !gameState.zenMode;
        zenModeBtn.textContent = `ZEN MODE: ${gameState.zenMode ? 'ON' : 'OFF'}`;
    });
    
    // Submit score
    submitScoreBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim() || 'Anonymous';
        if (gameState.score > 0) {
            // Imported from firebase.js
            submitScore(username, gameState.score);
        }
        gameOverScreen.classList.remove('active');
        startScreen.classList.add('active');
    });
    
    // Theme switching
    document.querySelectorAll('.theme-switcher button').forEach(btn => {
        btn.addEventListener('click', () => {
            gameState.currentTheme = btn.dataset.theme;
            document.documentElement.setAttribute('data-theme', gameState.currentTheme);
            localStorage.setItem('ashglide_theme', gameState.currentTheme);
            
            document.querySelectorAll('.theme-switcher button').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });
}

// Initialize when loaded
window.addEventListener('load', () => {
    initCanvas();
    setupEventListeners();
    
    // Imported from firebase.js
    getLeaderboard();
});
