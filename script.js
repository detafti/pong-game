// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game states
const GAME_STATE = {
    IDLE: 0,
    PLAYING: 1,
    PAUSED: 2
};

// Game variables
let gameState = GAME_STATE.IDLE;
let playerScore = 0;
let computerScore = 0;

// Paddle object
const paddleWidth = 10;
const paddleHeight = 80;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6,
    mouseY: canvas.height / 2
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 6,
    dx: 5,
    dy: 5,
    speed: 5,
    maxSpeed: 8
};

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Start/restart game with SPACE
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === GAME_STATE.IDLE || gameState === GAME_STATE.PAUSED) {
            startGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse tracking for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.mouseY = e.clientY - rect.top;
});

// Touch support for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    player.mouseY = e.touches[0].clientY - rect.top;
});

// Start game
function startGame() {
    gameState = GAME_STATE.PLAYING;
    resetBall();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Update game state
function update() {
    if (gameState !== GAME_STATE.PLAYING) return;

    // Player paddle movement with mouse
    const targetY = player.mouseY - player.height / 2;
    player.y += (targetY - player.y) * 0.1; // Smooth movement

    // Player paddle movement with arrow keys
    if (keys['ArrowUp']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown']) {
        player.y += player.speed;
    }

    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // Computer AI
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = Math.abs(ball.dx); // Ensure ball moves right
        ball.x = player.x + player.width + ball.radius;

        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint /= player.height / 2;
        ball.dy = collidePoint * ball.maxSpeed;
        ball.dx = Math.sqrt(ball.maxSpeed * ball.maxSpeed - ball.dy * ball.dy);
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -Math.abs(ball.dx); // Ensure ball moves left
        ball.x = computer.x - ball.radius;

        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computer.y + computer.height / 2);
        collidePoint /= computer.height / 2;
        ball.dy = collidePoint * ball.maxSpeed;
        ball.dx = -Math.sqrt(ball.maxSpeed * ball.maxSpeed - ball.dy * ball.dy);
    }

    // Ball out of bounds - scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }

    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Draw game objects
function draw() {
    // Clear canvas with semi-transparent background
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    drawPaddle(player, '#00ff88');
    drawPaddle(computer, '#ff0055');

    // Draw ball
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw glow effect on ball
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Draw game state message
    if (gameState === GAME_STATE.IDLE) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
    }
}

function drawPaddle(paddle, color) {
    // Main paddle
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
