export const eggTypes = {
  normal: { points: 1, scale: 1, color: "#fff4e7", outline: "#6b3636" },
  small: { points: 3, scale: 0.70, color: "#f39a8f", outline: "#6b3636" },
  gold: { points: 5, scale: 1.05, color: "#ffd34e", outline: "#8c5420" },
  rainbow: { points: 10, scale: 1.12, color: "#ffffff", outline: "#633c57" }
};

export function random(min, max) {
  return Math.random() * (max - min) + min;
}

export function chooseEggType() {
  const roll = Math.random();
  if (roll < 0.0095) return "rainbow";
  if (roll < 0.012) return "gold";
  if (roll < 0.35) return "small";
  return "normal";
}

export function spawnEgg(eggs, width, height, difficulty) {
  const type = chooseEggType();
  const data = eggTypes[type];
  const baseSize = Math.min(width, height) * 0.075;
  const radius = baseSize * data.scale;
  const x = random(radius + 10, width - radius - 10);
  const y = height + radius + 10;
  const vx = random(-125, 125) * (0.75 + difficulty * 0.1);
  const vy = random(-790, -620) * (0.9 + difficulty * 0.06);
  const gravity = random(760, 900) * (0.9 + difficulty * 0.04);

  eggs.push({
    x, y, vx, vy, gravity, radius, type,
    rotation: random(-0.35, 0.35),
    rotationSpeed: random(-2.5, 2.5),
    alive: true,
    born: performance.now()
  });
}

export function drawEgg(ctx, egg) {
  ctx.save();
  ctx.translate(egg.x, egg.y);
  ctx.rotate(egg.rotation);

  const r = egg.radius;
  const type = eggTypes[egg.type];
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.35);
  ctx.bezierCurveTo(r * 0.72, -r * 1.20, r * 1.02, -r * 0.35, r * 0.92, r * 0.35);
  ctx.bezierCurveTo(r * 0.82, r * 1.02, r * 0.48, r * 1.28, 0, r * 1.32);
  ctx.bezierCurveTo(-r * 0.48, r * 1.28, -r * 0.82, r * 1.02, -r * 0.92, r * 0.35);
  ctx.bezierCurveTo(-r * 1.02, -r * 0.35, -r * 0.72, -r * 1.20, 0, -r * 1.35);
  ctx.closePath();

  if (egg.type === "rainbow") {
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, "#ff7676");
    grad.addColorStop(0.25, "#ffd166");
    grad.addColorStop(0.5, "#7bdcb5");
    grad.addColorStop(0.75, "#70a7ff");
    grad.addColorStop(1, "#c58cff");
    ctx.fillStyle = grad;
  } else if (egg.type === "gold") {
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, "#fff4a8");
    grad.addColorStop(0.45, "#ffd34e");
    grad.addColorStop(1, "#ee9c26");
    ctx.fillStyle = grad;
  } else {
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, "#fffdf9");
    grad.addColorStop(0.65, type.color);
    grad.addColorStop(1, egg.type === "small" ? "#e77b78" : "#e7c9bb");
    ctx.fillStyle = grad;
  }

  ctx.shadowColor = "rgba(92, 46, 46, .28)";
  ctx.shadowBlur = 9;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = Math.max(3, r * 0.12);
  ctx.strokeStyle = type.outline;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.63, r * 0.17, r * 0.35, -0.35, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.82)";
  ctx.fill();

  if (egg.type === "rainbow") {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = Math.max(2, r * 0.06);
    ctx.stroke();
  }
  ctx.restore();
}
