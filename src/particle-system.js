/**
 * Particle Effects System
 * Handles visual effects like explosions, fire, magic, dust, etc.
 */

class Particle {
  constructor(x, y, vx, vy, color, lifetime, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.size = size;
    this.alive = true;
    this.alpha = 1;
  }

  update(deltaTime = 0.016) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.lifetime -= deltaTime;
    this.alpha = Math.max(0, this.lifetime / this.maxLifetime);
    this.vy += 9.8 * deltaTime; // Gravity
    if (this.lifetime <= 0) this.alive = false;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ParticleEmitter {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.emissionRate = config.emissionRate || 10; // particles per frame
    this.particleLifetime = config.lifetime || 1.0;
    this.particleSize = config.size || 4;
    this.particleSpeed = config.speed || 100;
    this.color = config.color || '#FF6B6B';
    this.active = true;
    this.maxParticles = config.maxParticles || 500;
    this.burstMode = config.burst || false;
    this.spreadAngle = config.spread || Math.PI * 2; // radians
    this.centerAngle = config.angle || 0;
    this.emission = {
      xOffset: config.xOffset !== undefined ? config.xOffset : 0,
      yOffset: config.yOffset !== undefined ? config.yOffset : 0,
      randomX: config.randomX || 0,
      randomY: config.randomY || 0
    };
  }

  update(deltaTime = 0.016) {
    // Track and update all particles
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(deltaTime);
      if (this.particles[i].alive) {
        // Particle is active
      } else {
        this.particles.splice(i, 1);
        i--;
      }
    }

    if (this.active && this.particles.length < this.maxParticles) {
      const emitCount = this.burstMode ? this.emissionRate : Math.floor(this.emissionRate * deltaTime);
      for (let i = 0; i < emitCount; i++) {
        this.emit();
      }
    }
  }

  emit() {
    const angle = this.centerAngle + (Math.random() - 0.5) * this.spreadAngle;
    const speed = this.particleSpeed * (0.8 + Math.random() * 0.4);
    
    const emitX = this.x + this.emission.xOffset + (Math.random() - 0.5) * this.emission.randomX;
    const emitY = this.y + this.emission.yOffset + (Math.random() - 0.5) * this.emission.randomY;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const particle = new Particle(
      emitX,
      emitY,
      vx,
      vy,
      this.color,
      this.particleLifetime,
      this.particleSize
    );
    this.particles.push(particle);
  }

  render(ctx) {
    for (let particle of this.particles) {
      particle.render(ctx);
    }
  }

  setBurst(count) {
    for (let i = 0; i < count; i++) {
      this.emit();
    }
  }

  get isAlive() {
    return this.particles.length > 0;
  }
}

class ParticleSystem {
  constructor() {
    this.emitters = [];
    this.effects = new Map(); // Named effects presets
    this.setupDefaultEffects();
    this.ctx = null;
  }

  setupDefaultEffects() {
    this.registerEffect('explosion', {
      emissionRate: 50,
      lifetime: 0.8,
      size: 6,
      speed: 300,
      color: '#FF6B6B',
      maxParticles: 200,
      burst: true,
      spread: Math.PI * 2
    });

    this.registerEffect('fire', {
      emissionRate: 20,
      lifetime: 1.2,
      size: 5,
      speed: 80,
      color: '#FFA500',
      maxParticles: 150,
      burst: false,
      spread: Math.PI * 0.5
    });

    this.registerEffect('magic', {
      emissionRate: 15,
      lifetime: 1.5,
      size: 4,
      speed: 150,
      color: '#9D4EDD',
      maxParticles: 100,
      burst: false,
      spread: Math.PI * 2
    });

    this.registerEffect('dust', {
      emissionRate: 8,
      lifetime: 2.0,
      size: 3,
      speed: 50,
      color: '#CCCCCC',
      maxParticles: 80,
      burst: false,
      spread: Math.PI * 1.5
    });

    this.registerEffect('healing', {
      emissionRate: 12,
      lifetime: 1.0,
      size: 4,
      speed: 100,
      color: '#00FF00',
      maxParticles: 120,
      burst: false,
      spread: Math.PI * 2
    });

    this.registerEffect('blood', {
      emissionRate: 20,
      lifetime: 1.5,
      size: 3,
      speed: 200,
      color: '#8B0000',
      maxParticles: 100,
      burst: true,
      spread: Math.PI * 2
    });

    this.registerEffect('sparkle', {
      emissionRate: 5,
      lifetime: 0.6,
      size: 2,
      speed: 120,
      color: '#FFD700',
      maxParticles: 50,
      burst: false,
      spread: Math.PI * 2
    });

    this.registerEffect('smoke', {
      emissionRate: 10,
      lifetime: 2.5,
      size: 8,
      speed: 30,
      color: '#666666',
      maxParticles: 60,
      burst: false,
      spread: Math.PI * 0.3,
      yOffset: -20
    });
  }

  registerEffect(name, config) {
    this.effects.set(name, config);
  }

  createEmitter(x, y, effectName = 'explosion', config = {}) {
    let finalConfig = { ...this.effects.get(effectName) || {}, ...config };
    const emitter = new ParticleEmitter(x, y, finalConfig);
    this.emitters.push(emitter);
    return emitter;
  }

  createBurst(x, y, effectName = 'explosion', count = 30) {
    const emitter = this.createEmitter(x, y, effectName, { burst: true });
    emitter.setBurst(count);
    return emitter;
  }

  update(deltaTime = 0.016) {
    for (let i = 0; i < this.emitters.length; i++) {
      this.emitters[i].update(deltaTime);
      if (!this.emitters[i].active && !this.emitters[i].isAlive) {
        this.emitters.splice(i, 1);
        i--;
      }
    }
  }

  render(ctx) {
    for (let emitter of this.emitters) {
      emitter.render(ctx);
    }
  }

  stopAll() {
    for (let emitter of this.emitters) {
      emitter.active = false;
    }
  }

  getAllEmitters() {
    return this.emitters;
  }

  getEmitterCount() {
    return this.emitters.length;
  }

  getTotalParticleCount() {
    return this.emitters.reduce((sum, e) => sum + e.particles.length, 0);
  }

  serialize() {
    return {
      effects: Object.fromEntries(this.effects),
      emitterCount: this.emitters.length,
      version: '1.0'
    };
  }

  static deserialize(data) {
    const system = new ParticleSystem();
    for (let [name, config] of Object.entries(data.effects)) {
      system.registerEffect(name, config);
    }
    return system;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Particle, ParticleEmitter, ParticleSystem };
}
