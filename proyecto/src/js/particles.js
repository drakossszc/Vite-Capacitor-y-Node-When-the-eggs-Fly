import { random } from "./eggs.js";

export function createParticles(particles, x, y, type) {
  const colors = {
    normal: ["#fff4e7", "#f4c7b9", "#ffffff"],
    small: ["#f28b82", "#ffc1ba", "#fff0e9"],
    gold: ["#ffd34e", "#fff2a0", "#f4a261"],
    rainbow: ["#ff7676", "#ffd166", "#70d6a5", "#70a7ff", "#c58cff"]
  };

  for (let i = 0; i < 18; i++) {
    particles.push({
      x, y,
      vx: random(-230, 230),
      vy: random(-260, 120),
      size: random(3, 7),
      life: 0.65,
      maxLife: 0.65,
      color: colors[type][Math.floor(Math.random() * colors[type].length)]
    });
  }
}

export function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    particle.life -= dt;
    particle.vy += 450 * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    if (particle.life <= 0) particles.splice(i, 1);
  }
}

export function drawParticles(ctx, particles) {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}