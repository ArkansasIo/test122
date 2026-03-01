/**
 * Dragon Studio Game Engine
 * Modern 2D game runtime for web and desktop
 * No Game Boy constraints - full creative freedom!
 */

class GameEngine {
  constructor(canvasId, config = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.config = {
      width: config.width || 1920,
      height: config.height || 1080,
      fullscreen: config.fullscreen || false,
      ...config
    };
    
    this.isRunning = false;
    this.fps = 60;
    this.deltaTime = 0;
    this.lastTime = 0;
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, over
    this.world = {
      player: null,
      enemies: [],
      items: [],
      sprites: [],
      tilemaps: []
    };
    
    this.input = {
      keys: {},
      mouse: { x: 0, y: 0, down: false }
    };
    
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.lighting = { enabled: true, ambient: 0.7 };
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.setupInputHandlers();
    this.setupPhysics();
    console.log('🐉 Dragon Studio Game Engine initialized');
  }
  
  setupCanvas() {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    
    if (this.config.fullscreen) {
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
    }
  }
  
  setupInputHandlers() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      this.input.keys[e.key] = true;
      this.onKeyDown(e);
    });
    
    document.addEventListener('keyup', (e) => {
      this.input.keys[e.key] = false;
      this.onKeyUp(e);
    });
    
    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouse.x = e.clientX - rect.left;
      this.input.mouse.y = e.clientY - rect.top;
    });
    
    this.canvas.addEventListener('mousedown', () => {
      this.input.mouse.down = true;
      this.onMouseDown();
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.input.mouse.down = false;
      this.onMouseUp();
    });
  }
  
  setupPhysics() {
    this.physics = {
      gravity: 0.6,
      friction: 0.95,
      bodies: []
    };
  }
  
  // Game loop
  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  gameLoop = (currentTime) => {
    if (!this.isRunning) return;
    
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(this.deltaTime);
    this.render();
    
    requestAnimationFrame(this.gameLoop);
  }
  
  update(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    // Update camera
    if (this.world.player) {
      this.camera.x = this.world.player.x - this.canvas.width / 4;
      this.camera.y = this.world.player.y - this.canvas.height / 4;
    }
    
    // Update sprites
    this.world.sprites.forEach(sprite => {
      sprite.update?.(deltaTime);
    });
    
    // Update enemies
    this.world.enemies.forEach(enemy => {
      enemy.update?.(deltaTime);
    });
    
    // Check collisions
    this.checkCollisions();
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context state for camera transform
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // Render tilemaps
    this.world.tilemaps.forEach(tilemap => {
      tilemap.render?.(this.ctx);
    });
    
    // Render sprites
    this.world.sprites.forEach(sprite => {
      sprite.render?.(this.ctx);
    });
    
    // Render enemies
    this.world.enemies.forEach(enemy => {
      enemy.render?.(this.ctx);
    });
    
    // Render player
    if (this.world.player) {
      this.world.player.render?.(this.ctx);
    }
    
    // Render items
    this.world.items.forEach(item => {
      item.render?.(this.ctx);
    });
    
    this.ctx.restore();
    
    // Render UI (not affected by camera)
    this.renderUI();
  }
  
  renderUI() {
    // FPS counter
    this.ctx.fillStyle = '#667eea';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${Math.round(1 / this.deltaTime)}`, 10, 20);
    
    // Game state indicator
    this.ctx.fillText(`State: ${this.gameState}`, 10, 35);
  }
  
  checkCollisions() {
    // Simple AABB collision detection
    for (let i = 0; i < this.world.sprites.length; i++) {
      for (let j = i + 1; j < this.world.sprites.length; j++) {
        if (this.aabbCollide(this.world.sprites[i], this.world.sprites[j])) {
          this.world.sprites[i].onCollide?.(this.world.sprites[j]);
          this.world.sprites[j].onCollide?.(this.world.sprites[i]);
        }
      }
    }
  }
  
  aabbCollide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  // Event handlers
  onKeyDown(e) {
    const actions = {
      'w': () => this.onMoveUp?.(),
      'ArrowUp': () => this.onMoveUp?.(),
      's': () => this.onMoveDown?.(),
      'ArrowDown': () => this.onMoveDown?.(),
      'a': () => this.onMoveLeft?.(),
      'ArrowLeft': () => this.onMoveLeft?.(),
      'd': () => this.onMoveRight?.(),
      'ArrowRight': () => this.onMoveRight?.(),
      ' ': () => this.onAction?.(),
      'Enter': () => this.togglePause?.()
    };
    
    actions[e.key]?.();
  }
  
  onKeyUp(e) {}
  onMouseDown() {}
  onMouseUp() {}
  onMoveUp() {}
  onMoveDown() {}
  onMoveLeft() {}
  onMoveRight() {}
  onAction() {}
  
  togglePause() {
    this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
  }
  
  // Sprite management
  addSprite(sprite) {
    this.world.sprites.push(sprite);
    return sprite;
  }
  
  removeSprite(sprite) {
    const idx = this.world.sprites.indexOf(sprite);
    if (idx > -1) this.world.sprites.splice(idx, 1);
  }
  
  addEnemy(enemy) {
    this.world.enemies.push(enemy);
    return enemy;
  }
  
  addItem(item) {
    this.world.items.push(item);
    return item;
  }
  
  setPlayer(player) {
    this.world.player = player;
  }
  
  stop() {
    this.isRunning = false;
  }
}

/**
 * Base Sprite class
 */
class Sprite {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.alpha = 1;
    this.color = '#667eea';
    this.children = [];
  }
  
  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
  }
  
  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
  
  addChild(sprite) {
    this.children.push(sprite);
  }
  
  setVelocity(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }
}

/**
 * Simple Tilemap
 */
class Tilemap {
  constructor(tileWidth, tileHeight) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tiles = [];
    this.width = 0;
    this.height = 0;
  }
  
  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = Array(width * height).fill(0);
  }
  
  setTile(x, y, tileId) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y * this.width + x] = tileId;
    }
  }
  
  getTile(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y * this.width + x];
    }
    return 0;
  }
  
  render(ctx) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tileId = this.tiles[y * this.width + x];
        if (tileId > 0) {
          ctx.fillStyle = this.getTileColor(tileId);
          ctx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
          ctx.strokeStyle = '#444';
          ctx.strokeRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
        }
      }
    }
  }
  
  getTileColor(id) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];
    return colors[id % colors.length];
  }
}

export { GameEngine, Sprite, Tilemap };
