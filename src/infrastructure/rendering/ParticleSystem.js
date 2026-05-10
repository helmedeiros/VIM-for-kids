/**
 * Lightweight particle system for visual effects on Canvas.
 * Manages a pool of particles with position, velocity, lifetime, and color.
 */
export class ParticleSystem {
  constructor(maxParticles = 200) {
    this._particles = [];
    this._maxParticles = maxParticles;
  }

  get particleCount() {
    return this._particles.length;
  }

  emit(type, x, y, count = 5) {
    const emitters = {
      sparkle: () => this._emitSparkle(x, y, count),
      ripple: () => this._emitRipple(x, y),
    };

    const emitter = emitters[type];
    if (emitter) emitter();
  }

  update(deltaTime) {
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.age += deltaTime;

      if (p.age >= p.lifetime) {
        this._particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += (p.gravity || 0) * deltaTime;
    }
  }

  draw(ctx) {
    for (const p of this._particles) {
      const progress = p.age / p.lifetime;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha * (p.alpha || 1);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        const radius = p.size * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fill();
      } else {
        const size = p.size * (1 - progress * 0.5);
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this._particles.length = 0;
  }

  _emitSparkle(x, y, count) {
    const colors = ['#ffd700', '#ffec80', '#fff8c0', '#ffe040'];
    for (let i = 0; i < count; i++) {
      if (this._particles.length >= this._maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 60;
      this._particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 40,
        size: 1.5 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: 'circle',
        lifetime: 0.4 + Math.random() * 0.4,
        age: 0,
        alpha: 0.9,
      });
    }
  }

  _emitRipple(x, y) {
    if (this._particles.length >= this._maxParticles) return;
    this._particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 2,
      color: 'rgba(130, 190, 230, 0.5)',
      shape: 'circle',
      lifetime: 1.0,
      age: 0,
      alpha: 0.4,
      gravity: 0,
    });
  }
}
