const gameArea = document.getElementById("game-area");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const bestScoreDisplay = document.getElementById("bestScore");
const startBtn = document.getElementById("startBtn");
// High score display
const highScoreDisplay = document.getElementById("highScore");

// Load saved high score
let highScore = Number(localStorage.getItem("dodgeHighScore")) || 0;

highScoreDisplay.textContent = highScore;
const message = document.getElementById("message");

let score = 0;


bestScoreDisplay.textContent = highScore;
let playerX = 0;
let blocks = [];
let gameRunning = false;
let animationId = null;
let lastTime = 0;
let spawnTimer = 0;

// Player movement
const playerSpeed = 300;

// Start the game
function startGame() {
    if (gameRunning) return;

    score = 0;
    blocks.forEach(block => block.element.remove());
    blocks = [];

    scoreDisplay.textContent = score;
    message.textContent = "Use ← and → arrow keys to move!";
    startBtn.textContent = "Restart Game";

    playerX = (gameArea.clientWidth - player.offsetWidth) / 2;
    player.style.left = playerX + "px";
    player.style.transform = "none";

    gameRunning = true;
    lastTime = performance.now();
    spawnTimer = 0;

    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

// Create a falling block
function createBlock() {
    const block = document.createElement("div");
    block.classList.add("block");

    const maxX = gameArea.clientWidth - 35;
    const x = Math.random() * maxX;

    block.style.left = x + "px";
    block.style.top = "-35px";

    gameArea.appendChild(block);

    blocks.push({
        element: block,
        x: x,
        y: -35,
        speed: Math.min(200 + score * 5, 500) + Math.random() * 50
    });
}
// Move player
function movePlayer(direction, deltaTime) {
    playerX += direction * playerSpeed * deltaTime;

    const maxX = gameArea.clientWidth - player.offsetWidth;

    if (playerX < 0) playerX = 0;
    if (playerX > maxX) playerX = maxX;

    player.style.left = playerX + "px";
}

// Keyboard controls
const keys = {};

document.addEventListener("keydown", function(event) {
    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
    ) {
        event.preventDefault();
        keys[event.key] = true;
    }
});

document.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});
// Mobile touch controls
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const stopBtn = document.getElementById("stopBtn");

function holdButton(button, key) {
    button.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        keys[key] = true;
    });

    button.addEventListener("pointerup", function() {
        keys[key] = false;
    });

    button.addEventListener("pointerleave", function() {
        keys[key] = false;
    });

    button.addEventListener("pointercancel", function() {
        keys[key] = false;
    });
}

holdButton(leftBtn, "ArrowLeft");
holdButton(rightBtn, "ArrowRight");

stopBtn.addEventListener("pointerdown", function(event) {
    event.preventDefault();
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
});
// Check collision
function checkCollision(block) {
    const playerRect = player.getBoundingClientRect();
    const blockRect = block.element.getBoundingClientRect();

    return (
        playerRect.left < blockRect.right &&
        playerRect.right > blockRect.left &&
        playerRect.top < blockRect.bottom &&
        playerRect.bottom > blockRect.top
    );
}

// Main game loop
function gameLoop(currentTime) {
    if (!gameRunning) return;

    const deltaTime = Math.min(
        (currentTime - lastTime) / 1000,
        0.05
    );

    lastTime = currentTime;

    let direction = 0;

    if (keys["ArrowLeft"]) direction -= 1;
    if (keys["ArrowRight"]) direction += 1;

    movePlayer(direction, deltaTime);

    // Create blocks regularly
    spawnTimer += deltaTime;

   const spawnInterval = Math.max(0.3, 0.8 - score * 0.01);

if (spawnTimer >= spawnInterval) {
    createBlock();
    spawnTimer = 0;
}
    // Move blocks
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];

        block.y += block.speed * deltaTime;
        block.element.style.top = block.y + "px";

        // Collision detection
        if (checkCollision(block)) {
            endGame();
            return;
        }

        // Remove blocks that leave the screen
        if (block.y > gameArea.clientHeight) {
            block.element.remove();
            blocks.splice(i, 1);

            score++;
scoreDisplay.textContent = score;

// Update high score
if (score > highScore) {
    highScore = score;

    highScoreDisplay.textContent = highScore;

    localStorage.setItem("dodgeHighScore", highScore);
}

if (score > highScore) {
    highScore = score;

    bestScoreDisplay.textContent = highScore;

    localStorage.setItem(
        "dodgeHighScore",
        highScore
    );
}
        }
    }

    animationId = requestAnimationFrame(gameLoop);
}

// End the game
function endGame() {
    gameRunning = false;

    cancelAnimationFrame(animationId);

    message.textContent = "Game Over! Your score: " + score;
    startBtn.textContent = "Play Again";

    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
}

// Start button
startBtn.addEventListener("click", startGame);