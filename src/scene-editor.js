/**
 * Scene Editor
 * Visual scene construction with game objects and drag-and-drop placement
 */

class GameObject {
  constructor(name = 'GameObject', x = 0, y = 0, width = 32, height = 32) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.active = true;
    this.visible = true;
    this.layer = 0;
    this.type = 'sprite'; // sprite, text, shape, light, emitter
    this.properties = {};
    this.components = [];
    this.children = [];
    this.parent = null;
  }

  addComponent(name, data = {}) {
    this.components.push({ name, data, enabled: true });
  }

  addChild(gameObject) {
    gameObject.parent = this;
    this.children.push(gameObject);
  }

  removeChild(id) {
    this.children = this.children.filter(child => child.id !== id);
  }

  getWorldPosition() {
    let x = this.x;
    let y = this.y;
    let parent = this.parent;

    while (parent) {
      x += parent.x;
      y += parent.y;
      parent = parent.parent;
    }

    return { x, y };
  }

  render(ctx) {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scaleX, this.scaleY);

    // Draw based on type
    if (this.type === 'sprite') {
      ctx.fillStyle = this.properties.color || '#FFFFFF';
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.type === 'shape') {
      ctx.fillStyle = this.properties.color || '#FF0000';
      if (this.properties.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, this.width, this.height);
      }
    } else if (this.type === 'text') {
      ctx.fillStyle = this.properties.color || '#000000';
      ctx.font = `${this.properties.fontSize || 16}px Arial`;
      ctx.fillText(this.properties.text || 'Text', 0, 0);
    }

    ctx.restore();

    // Render children
    for (let child of this.children) {
      child.render(ctx);
    }
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      active: this.active,
      visible: this.visible,
      layer: this.layer,
      type: this.type,
      properties: this.properties,
      components: this.components,
      children: this.children.map(c => c.serialize())
    };
  }

  static deserialize(data) {
    const obj = new GameObject(data.name, data.x, data.y, data.width, data.height);
    obj.id = data.id;
    obj.rotation = data.rotation;
    obj.scaleX = data.scaleX;
    obj.scaleY = data.scaleY;
    obj.active = data.active;
    obj.visible = data.visible;
    obj.layer = data.layer;
    obj.type = data.type;
    obj.properties = data.properties;
    obj.components = data.components;
    for (let childData of data.children) {
      obj.addChild(GameObject.deserialize(childData));
    }
    return obj;
  }
}

class GameScene {
  constructor(name = 'Scene', width = 1280, height = 720) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.width = width;
    this.height = height;
    this.gameObjects = [];
    this.camera = { x: 0, y: 0 };
    this.backgroundColor = '#2C3E50';
    this.properties = {
      gravity: 9.8,
      physics: true,
      ambientLight: 0.5
    };
  }

  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
    return gameObject;
  }

  removeGameObject(id) {
    this.gameObjects = this.gameObjects.filter(obj => obj.id !== id);
  }

  getGameObjectById(id) {
    const search = (objects) => {
      for (let obj of objects) {
        if (obj.id === id) return obj;
        const child = search(obj.children);
        if (child) return child;
      }
      return null;
    };
    return search(this.gameObjects);
  }

  getGameObjectsByName(name) {
    const search = (objects, results = []) => {
      for (let obj of objects) {
        if (obj.name === name) results.push(obj);
        search(obj.children, results);
      }
      return results;
    };
    return search(this.gameObjects);
  }

  getGameObjectsInRect(x, y, width, height) {
    const results = [];
    const check = (objects) => {
      for (let obj of objects) {
        if (obj.x < x + width && obj.x + obj.width > x &&
            obj.y < y + height && obj.y + obj.height > y) {
          results.push(obj);
        }
        check(obj.children);
      }
    };
    check(this.gameObjects);
    return results;
  }

  render(ctx, showGrid = false) {
    // Background
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 0.5;
      const gridSize = 32;
      for (let x = -this.camera.x % gridSize; x < ctx.canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
      }
      for (let y = -this.camera.y % gridSize; y < ctx.canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
      }
    }

    // Game objects
    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);
    for (let obj of this.gameObjects) {
      obj.render(ctx);
    }
    ctx.restore();
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      gameObjects: this.gameObjects.map(obj => obj.serialize()),
      camera: this.camera,
      backgroundColor: this.backgroundColor,
      properties: this.properties,
      version: '1.0'
    };
  }

  static deserialize(data) {
    const scene = new GameScene(data.name, data.width, data.height);
    scene.id = data.id;
    scene.gameObjects = data.gameObjects.map(obj => GameObject.deserialize(obj));
    scene.camera = data.camera;
    scene.backgroundColor = data.backgroundColor;
    scene.properties = data.properties;
    return scene;
  }
}

class SceneEditor {
  constructor() {
    this.scenes = [];
    this.currentSceneIndex = 0;
    this.selectedObjects = [];
    this.showGrid = true;
    this.snapToGrid = true;
    this.gridSize = 32;
  }

  createScene(name = 'Scene', width = 1280, height = 720) {
    const scene = new GameScene(name, width, height);
    this.scenes.push(scene);
    return scene;
  }

  getCurrentScene() {
    return this.scenes[this.currentSceneIndex];
  }

  addGameObject(gameObject) {
    const scene = this.getCurrentScene();
    if (scene) {
      scene.addGameObject(gameObject);
    }
  }

  placeGameObject(name, x, y, width = 32, height = 32) {
    const obj = new GameObject(name, x, y, width, height);
    this.addGameObject(obj);
    return obj;
  }

  selectObject(id) {
    this.selectedObjects = [id];
  }

  selectMultiple(ids) {
    this.selectedObjects = ids;
  }

  deselectAll() {
    this.selectedObjects = [];
  }

  moveSelectedObjects(dx, dy) {
    const scene = this.getCurrentScene();
    for (let id of this.selectedObjects) {
      const obj = scene.getGameObjectById(id);
      if (obj) {
        if (this.snapToGrid) {
          obj.x = Math.round((obj.x + dx) / this.gridSize) * this.gridSize;
          obj.y = Math.round((obj.y + dy) / this.gridSize) * this.gridSize;
        } else {
          obj.x += dx;
          obj.y += dy;
        }
      }
    }
  }

  deleteSelectedObjects() {
    const scene = this.getCurrentScene();
    for (let id of this.selectedObjects) {
      scene.removeGameObject(id);
    }
    this.selectedObjects = [];
  }

  duplicateSelectedObjects() {
    const scene = this.getCurrentScene();
    const newObjects = [];
    for (let id of this.selectedObjects) {
      const obj = scene.getGameObjectById(id);
      if (obj) {
        const dup = JSON.parse(JSON.stringify(obj));
        dup.id = Math.random().toString(36).substr(2, 9);
        dup.x += this.gridSize;
        dup.y += this.gridSize;
        scene.addGameObject(dup);
        newObjects.push(dup.id);
      }
    }
    this.selectedObjects = newObjects;
  }

  getSceneCount() {
    return this.scenes.length;
  }

  getAllScenes() {
    return this.scenes;
  }

  serialize() {
    return {
      scenes: this.scenes.map(s => s.serialize()),
      currentSceneIndex: this.currentSceneIndex,
      settings: {
        showGrid: this.showGrid,
        snapToGrid: this.snapToGrid,
        gridSize: this.gridSize
      },
      version: '1.0'
    };
  }

  static deserialize(data) {
    const editor = new SceneEditor();
    editor.scenes = data.scenes.map(s => GameScene.deserialize(s));
    editor.currentSceneIndex = data.currentSceneIndex;
    Object.assign(editor, data.settings);
    return editor;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameObject, GameScene, SceneEditor };
}
