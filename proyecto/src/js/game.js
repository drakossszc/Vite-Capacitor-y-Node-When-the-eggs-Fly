import { drawEgg, eggTypes, spawnEgg } from "./eggs.js";
import { createParticles, drawParticles, updateParticles } from "./particles.js";
import { isSoundEnabled, playSound, setSoundEnabled } from "./audio.js";
import { getBestScore, saveBestScore } from "./storage.js";

export function initializeGame() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gameArea = document.getElementById("gameArea");
  const scoreEl = document.getElementById("score");
  const bestScoreEl = document.getElementById("bestScore");
  const missesEl = document.getElementById("misses");
  const startScreen = document.getElementById("startScreen");
  const gameOver = document.getElementById("gameOver");
  const finalScore = document.getElementById("finalScore");
  const finalBest = document.getElementById("finalBest");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const soundBtn = document.getElementById("soundBtn");

  let width = 0;
  let height = 0;
  let eggs = [];
  let particles = [];
  let score = 0;
  let misses = 0;
  let running = false;
  let lastTime = 0;
  let spawnTimer = 0;
  let spawnInterval = 720;
  let difficulty = 1;
  let bestScore = getBestScore();
  bestScoreEl.textContent = bestScore;

  function resizeCanvas() {
    const rect = gameArea.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,.45)";
    for (let i = 0; i < 16; i++) {
      const x = (i * 137) % width;
      const y = 55 + ((i * 83) % Math.max(100, height - 120));
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const egg of eggs) drawEgg(ctx, egg);
    drawParticles(ctx, particles);
  }

  function endGame() {
    running = false;
    if (score > bestScore) {
      bestScore = score;
      saveBestScore(bestScore);
    }
    bestScoreEl.textContent = bestScore;
    finalScore.textContent = score;
    finalBest.textContent = bestScore;
    gameOver.classList.remove("hidden");
    playSound("gameover");
  }

  function update(dt) {
    difficulty += dt * 0.012;
    spawnTimer += dt * 1000;
    spawnInterval = Math.max(330, 720 - difficulty * 25);

    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnEgg(eggs, width, height, difficulty);
      if (difficulty > 6 && Math.random() < 0.25) {
        window.setTimeout(() => {
          if (running) spawnEgg(eggs, width, height, difficulty);
        }, 120);
      }
    }

    for (let i = eggs.length - 1; i >= 0; i--) {
      const egg = eggs[i];
      egg.vy += egg.gravity * dt;
      egg.x += egg.vx * dt;
      egg.y += egg.vy * dt;
      egg.rotation += egg.rotationSpeed * dt;

      if (egg.x - egg.radius < 0) {
        egg.x = egg.radius;
        egg.vx *= -0.85;
      }
      if (egg.x + egg.radius > width) {
        egg.x = width - egg.radius;
        egg.vx *= -0.85;
      }
      if (egg.y - egg.radius > height + 25) {
        eggs.splice(i, 1);
        misses++;
        missesEl.textContent = misses;
        if (misses >= 10) {
          endGame();
          return;
        }
      }
    }
    updateParticles(particles, dt);
  }

  function gameLoop(timestamp) {
    if (!running) return;
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;
    update(dt);
    draw();
    if (running) requestAnimationFrame(gameLoop);
  }

  function startGame() {
    score = 0;
    misses = 0;
    difficulty = 1;
    spawnTimer = 0;
    eggs = [];
    particles = [];
    running = true;
    scoreEl.textContent = "0";
    missesEl.textContent = "0";
    startScreen.classList.add("hidden");
    gameOver.classList.add("hidden");
    lastTime = 0;
    playSound("start");
    requestAnimationFrame(gameLoop);
  }

  function popEggAt(x, y) {
    if (!running) return;
    for (let i = eggs.length - 1; i >= 0; i--) {
      const egg = eggs[i];
      const distance = Math.hypot(x - egg.x, y - egg.y);
      if (distance <= egg.radius * 1.2) {
        score += eggTypes[egg.type].points;
        scoreEl.textContent = score;
        createParticles(particles, egg.x, egg.y, egg.type);
        playSound(egg.type);
        eggs.splice(i, 1);
        return;
      }
    }
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  canvas.addEventListener("pointerdown", (event) => {
    const position = pointerPosition(event);
    popEggAt(position.x, position.y);
  });

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  soundBtn.addEventListener("click", () => {
    const enabled = !isSoundEnabled();
    setSoundEnabled(enabled);
    soundBtn.textContent = enabled ? "🔊" : "🔇";
    if (enabled) playSound("normal");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) lastTime = performance.now();
  });

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
}