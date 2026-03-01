/**
 * Animation System for Dragon Studio
 * Frame-based animation, spritesheet handling, and animation controller
 */

class AnimationFrame {
  constructor(spriteIndex, duration = 1) {
    this.spriteIndex = spriteIndex; // Index in spritesheet or sprite array
    this.duration = duration; // Duration in frames (at 60 FPS)
    this.x = 0;
    this.y = 0;
    this.width = 32;
    this.height = 32;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}

class Animation {
  constructor(name, frames = []) {
    this.name = name;
    this.frames = frames;
    this.loop = true;
    this.speed = 1.0; // Multiplier for animation speed
    this.onComplete = null; // Callback when animation finishes
  }

  addFrame(spriteIndex, duration = 1) {
    const frame = new AnimationFrame(spriteIndex, duration);
    this.frames.push(frame);
    return frame;
  }

  setFrameProperties(frameIndex, x, y, width, height, offsetX = 0, offsetY = 0) {
    if (frameIndex < this.frames.length) {
      const frame = this.frames[frameIndex];
      frame.x = x;
      frame.y = y;
      frame.width = width;
      frame.height = height;
      frame.offsetX = offsetX;
      frame.offsetY = offsetY;
    }
  }

  getTotalDuration() {
    return this.frames.reduce((sum, frame) => sum + frame.duration, 0);
  }

  serialize() {
    return {
      name: this.name,
      frames: this.frames,
      loop: this.loop,
      speed: this.speed
    };
  }
}

class AnimationController {
  constructor(sprite) {
    this.sprite = sprite;
    this.animations = new Map();
    this.currentAnimation = null;
    this.currentFrameIndex = 0;
    this.currentFrameTime = 0;
    this.isPlaying = false;
    this.speed = 1.0;
  }

  addAnimation(animation) {
    this.animations.set(animation.name, animation);
  }

  play(animationName, loop = true) {
    const animation = this.animations.get(animationName);
    if (!animation) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }

    this.currentAnimation = animation;
    this.currentFrameIndex = 0;
    this.currentFrameTime = 0;
    this.isPlaying = true;
    this.currentAnimation.loop = loop;
  }

  stop() {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
    this.currentFrameTime = 0;
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    if (this.currentAnimation) {
      this.isPlaying = true;
    }
  }

  update(deltaTime) {
    if (!this.isPlaying || !this.currentAnimation) return;

    const animation = this.currentAnimation;
    this.currentFrameTime += deltaTime * this.speed * animation.speed;

    // Move to next frame if duration exceeded
    if (this.currentFrameIndex < animation.frames.length) {
      const currentFrame = animation.frames[this.currentFrameIndex];

      if (this.currentFrameTime >= currentFrame.duration) {
        this.currentFrameTime -= currentFrame.duration;
        this.currentFrameIndex++;

        // Loop or finish animation
        if (this.currentFrameIndex >= animation.frames.length) {
          if (animation.loop) {
            this.currentFrameIndex = 0;
          } else {
            this.isPlaying = false;
            if (animation.onComplete) {
              animation.onComplete();
            }
          }
        }
      }
    }
  }

  getCurrentFrame() {
    if (!this.currentAnimation || this.currentFrameIndex >= this.currentAnimation.frames.length) {
      return null;
    }
    return this.currentAnimation.frames[this.currentFrameIndex];
  }

  render(ctx, x, y, spriteSheet) {
    if (!this.currentAnimation || !spriteSheet) return;

    const frame = this.getCurrentFrame();
    if (!frame) return;

    ctx.drawImage(
      spriteSheet,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      x + frame.offsetX,
      y + frame.offsetY,
      frame.width,
      frame.height
    );
  }

  getFrameCount() {
    return this.currentAnimation ? this.currentAnimation.frames.length : 0;
  }

  getCurrentFrameIndex() {
    return this.currentFrameIndex;
  }
}

// Spritesheet Animation Parser
class SpritesheetParser {
  static parseGrid(spriteSheet, tileWidth, tileHeight, columnsPerRow, rowCount) {
    const frames = [];
    let frameIndex = 0;

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        if (frameIndex < columnsPerRow * rowCount) {
          const frame = new AnimationFrame(frameIndex);
          frame.x = col * tileWidth;
          frame.y = row * tileHeight;
          frame.width = tileWidth;
          frame.height = tileHeight;
          frames.push(frame);
          frameIndex++;
        }
      }
    }

    return frames;
  }

  static parseStrip(spriteSheet, tileWidth, tileHeight, frameCount, horizontal = true) {
    const frames = [];

    for (let i = 0; i < frameCount; i++) {
      const frame = new AnimationFrame(i);
      if (horizontal) {
        frame.x = i * tileWidth;
        frame.y = 0;
      } else {
        frame.x = 0;
        frame.y = i * tileHeight;
      }
      frame.width = tileWidth;
      frame.height = tileHeight;
      frames.push(frame);
    }

    return frames;
  }
}

// Animation State Machine
class AnimationStateMachine {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.transitions = new Map();
  }

  addState(name) {
    const state = {
      name: name,
      animations: [],
      onEnter: null,
      onExit: null
    };
    this.states.set(name, state);
    return state;
  }

  addStateAnimation(stateName, animation) {
    const state = this.states.get(stateName);
    if (state) {
      state.animations.push(animation);
    }
  }

  addTransition(fromState, toState, condition) {
    const key = `${fromState}->${toState}`;
    this.transitions.set(key, condition);
  }

  setState(name) {
    if (this.currentState && this.states.get(this.currentState).onExit) {
      this.states.get(this.currentState).onExit();
    }

    this.currentState = name;

    if (this.states.get(name).onEnter) {
      this.states.get(name).onEnter();
    }
  }

  checkTransitions(context) {
    if (!this.currentState) return;

    // Check all transitions from current state
    for (const [key, condition] of this.transitions) {
      if (key.startsWith(this.currentState + '->')) {
        if (condition(context)) {
          const targetState = key.substring((this.currentState + '->').length);
          this.setState(targetState);
          return;
        }
      }
    }
  }

  getCurrentState() {
    return this.currentState;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    AnimationFrame, 
    Animation, 
    AnimationController, 
    SpritesheetParser, 
    AnimationStateMachine 
  };
}
