/**
 * Sprite Sheet Editor
 * Create and edit sprite assets with frame definition and animation preview
 */

class SpriteFrame {
  constructor(x = 0, y = 0, width = 32, height = 32, duration = 0.1) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.name = '';
    this.offset = { x: 0, y: 0 };
    this.pivot = { x: 0.5, y: 0.5 };
  }

  serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      duration: this.duration,
      name: this.name,
      offset: this.offset,
      pivot: this.pivot
    };
  }

  static deserialize(data) {
    const frame = new SpriteFrame(data.x, data.y, data.width, data.height, data.duration);
    frame.id = data.id;
    frame.name = data.name;
    frame.offset = data.offset;
    frame.pivot = data.pivot;
    return frame;
  }
}

class Sprite {
  constructor(name = 'Sprite', imageUrl = '', tileWidth = 32, tileHeight = 32) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.imageUrl = imageUrl;
    this.image = null;
    this.loaded = false;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.frames = [];
    this.tags = [];
    this.metadata = {
      author: '',
      version: '1.0',
      description: ''
    };
  }

  async loadImage() {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-undef
      this.image = new Image();
      this.image.onload = () => {
        this.loaded = true;
        resolve();
      };
      this.image.onerror = () => {
        console.error(`Failed to load image: ${this.imageUrl}`);
        resolve();
      };
      this.image.src = this.imageUrl;
    });
  }

  addFrame(frame) {
    this.frames.push(frame);
    return frame;
  }

  addFrameFromGrid(row, col, duration = 0.1) {
    const frame = new SpriteFrame(
      col * this.tileWidth,
      row * this.tileHeight,
      this.tileWidth,
      this.tileHeight,
      duration
    );
    this.addFrame(frame);
    return frame;
  }

  removeFrame(id) {
    this.frames = this.frames.filter(f => f.id !== id);
  }

  getFrame(id) {
    return this.frames.find(f => f.id === id);
  }

  generateGridFrames(cols = 1) {
    this.frames = [];
    if (!this.image) return;

    const rows = Math.ceil(this.image.height / this.tileHeight);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.addFrameFromGrid(row, col);
      }
    }
  }

  getFrameCount() {
    return this.frames.length;
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  renderFrame(ctx, frameId, x = 0, y = 0, scale = 1) {
    const frame = this.getFrame(frameId);
    if (!frame || !this.image) return;

    ctx.drawImage(
      this.image,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      x + frame.offset.x,
      y + frame.offset.y,
      frame.width * scale,
      frame.height * scale
    );
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      imageUrl: this.imageUrl,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      frames: this.frames.map(f => f.serialize()),
      tags: this.tags,
      metadata: this.metadata,
      version: '1.0'
    };
  }

  static deserialize(data) {
    const sprite = new Sprite(data.name, data.imageUrl, data.tileWidth, data.tileHeight);
    sprite.id = data.id;
    sprite.frames = data.frames.map(f => SpriteFrame.deserialize(f));
    sprite.tags = data.tags;
    sprite.metadata = data.metadata;
    return sprite;
  }
}

class SpriteTagAnimation {
  constructor(tag = '', frames = []) {
    this.tag = tag;
    this.frames = frames; // Frame IDs
    this.loop = true;
    this.speed = 1.0;
  }

  getFrameCount() {
    return this.frames.length;
  }
}

class SpriteSheetEditor {
  constructor() {
    this.sprites = [];
    this.currentSpriteIndex = 0;
    this.selectedFrameIndex = 0;
    this.selectionMode = 'single'; // single, rect, grid
    this.gridSize = 32;
  }

  createSprite(name = 'Sprite', imageUrl = '', tileWidth = 32, tileHeight = 32) {
    const sprite = new Sprite(name, imageUrl, tileWidth, tileHeight);
    this.sprites.push(sprite);
    return sprite;
  }

  getCurrentSprite() {
    return this.sprites[this.currentSpriteIndex];
  }

  async loadCurrentSpriteImage() {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      await sprite.loadImage();
    }
  }

  addFrame(frameData) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      return sprite.addFrame(frameData);
    }
  }

  addFrameFromGrid(row, col, duration = 0.1) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      return sprite.addFrameFromGrid(row, col, duration);
    }
  }

  generateGridFrames(cols = 1) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      sprite.generateGridFrames(cols);
    }
  }

  selectFrame(frameId) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      for (let i = 0; i < sprite.frames.length; i++) {
        if (sprite.frames[i].id === frameId) {
          this.selectedFrameIndex = i;
          return;
        }
      }
    }
  }

  getSelectedFrame() {
    const sprite = this.getCurrentSprite();
    if (sprite && this.selectedFrameIndex < sprite.frames.length) {
      return sprite.frames[this.selectedFrameIndex];
    }
    return null;
  }

  updateFrameProperties(frameId, properties) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      const frame = sprite.getFrame(frameId);
      if (frame) {
        Object.assign(frame, properties);
      }
    }
  }

  removeFrame(frameId) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      sprite.removeFrame(frameId);
    }
  }

  duplicateFrame(frameId) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      const frame = sprite.getFrame(frameId);
      if (frame) {
        const dup = new SpriteFrame(
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          frame.duration
        );
        dup.name = frame.name + '_copy';
        dup.offset = { ...frame.offset };
        dup.pivot = { ...frame.pivot };
        sprite.addFrame(dup);
        return dup;
      }
    }
    return null;
  }

  reorderFrames(frameIds) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      const newFrames = [];
      for (let id of frameIds) {
        const frame = sprite.getFrame(id);
        if (frame) {
          newFrames.push(frame);
        }
      }
      sprite.frames = newFrames;
    }
  }

  createAnimation(tag = '', frameIds = []) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      const animation = new SpriteTagAnimation(tag, frameIds);
      sprite.addTag(tag);
      return animation;
    }
    return null;
  }

  previewFrame(ctx, frameId, x = 0, y = 0, scale = 1) {
    const sprite = this.getCurrentSprite();
    if (sprite) {
      sprite.renderFrame(ctx, frameId, x, y, scale);
    }
  }

  previewAnimation(ctx, animationFrames, currentIndex, x = 0, y = 0, scale = 1) {
    const sprite = this.getCurrentSprite();
    if (sprite && currentIndex < animationFrames.length) {
      const frameId = animationFrames[currentIndex];
      sprite.renderFrame(ctx, frameId, x, y, scale);
    }
  }

  getSpriteCount() {
    return this.sprites.length;
  }

  getAllSprites() {
    return this.sprites;
  }

  exportSprite(spriteIndex) {
    if (spriteIndex < 0 || spriteIndex >= this.sprites.length) return null;
    return this.sprites[spriteIndex].serialize();
  }

  importSprite(spriteData) {
    const sprite = Sprite.deserialize(spriteData);
    this.sprites.push(sprite);
    return sprite;
  }

  serialize() {
    return {
      sprites: this.sprites.map(s => s.serialize()),
      currentSpriteIndex: this.currentSpriteIndex,
      selectedFrameIndex: this.selectedFrameIndex,
      settings: {
        gridSize: this.gridSize,
        selectionMode: this.selectionMode
      },
      version: '1.0'
    };
  }

  static deserialize(data) {
    const editor = new SpriteSheetEditor();
    editor.sprites = data.sprites.map(s => Sprite.deserialize(s));
    editor.currentSpriteIndex = data.currentSpriteIndex;
    editor.selectedFrameIndex = data.selectedFrameIndex;
    Object.assign(editor, data.settings);
    return editor;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SpriteFrame, Sprite, SpriteTagAnimation, SpriteSheetEditor };
}
