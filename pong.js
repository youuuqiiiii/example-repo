const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');

// Game objects
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 8;

let gameRunning = false;
let gameWon = false;

const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5,
    score: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    speed: 5,
    maxSpeed: 8
};

// Keyboard input
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Mouse input
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
    if (e.key === ' ') {
        e.preventDefault();
        toggleGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

resetButton.addEventListener('click', resetGame);

// Game functions
function toggleGame() {
    if (!gameWon) {
        gameRunning = !gameRunning;
    }
}

function resetGame() {
    gameRunning = false;
    gameWon = false;
    player.score = 0;
    computer.score = 0;
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5;
    ball.dy = 5;
    updateScores();
}

function updateScores() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

function movePaddles() {
    // Player paddle - keyboard controls
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Player paddle - mouse controls
    const mouseThreshold = 10;
    if (mouseY < player.y - mouseThreshold && player.y > 0) {
        player.y -= player.speed;
    } else if (mouseY > player.y + player.height + mouseThreshold && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Computer paddle AI
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const aiSpeed = computer.speed;
    const aiThreshold = 30;

    if (ballCenter < computerCenter - aiThreshold && computer.y > 0) {
        computer.y -= aiSpeed;
    } else if (ballCenter > computerCenter + aiThreshold && computer.y < canvas.height - computer.height) {
        computer.y += aiSpeed;
    }

    // Keep paddles in bounds
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
    computer.y = Math.max(0, Math.min(computer.y, canvas.height - computer.height));
}

function moveBall() {
    if (!gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(ball.y, canvas.height - ball.size));
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy = hitPos * ball.speed;
        ball.dx = Math.abs(ball.dx);
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy = hitPos * ball.speed;
        ball.dx = -Math.abs(ball.dx);
    }

    // Ball out of bounds - score points
    if (ball.x - ball.size < 0) {
        computer.score++;
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        player.score++;
        resetBall();
    }

    // Check for win condition
    if (player.score >= 5 || computer.score >= 5) {
        gameRunning = false;
        gameWon = true;
    }

    updateScores();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);

    // Draw ball
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(ball.x - ball.size, ball.y - ball.size, ball.size * 2, ball.size * 2);

    // Draw glow effect for ball
    ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(ball.x - ball.size - 2, ball.y - ball.size - 2, ball.size * 2 + 4, ball.size * 2 + 4);

    // Draw game status
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';

    if (!gameRunning && !gameWon) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, 50);
    }

    if (gameWon) {
        ctx.fillStyle = 'rgba(0, 255, 136, 0.9)';
        ctx.font = 'bold 32px Arial';
        const winner = player.score >= 5 ? 'YOU WIN!' : 'COMPUTER WINS!';
        ctx.fillText(winner, canvas.width / 2, canvas.height / 2);
        ctx.font = '18px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Click Reset to play again', canvas.width / 2, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    movePaddles();
    moveBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop
updateScores();
gameLoop();
