/**
 * Project & Asset Management System for Dragon Studio
 * Project creation, asset organization, and file management
 */

class GameProject {
  constructor(name, projectId = null) {
    this.name = name;
    this.projectId = projectId || this.generateId();
    this.version = '1.0.0';
    this.author = '';
    this.description = '';
    this.created = Date.now();
    this.modified = Date.now();
    this.settings = {
      gameWidth: 1280,
      gameHeight: 720,
      targetFPS: 60,
      scale: 1,
      clearColor: '#000000',
      canvasId: 'gameCanvas'
    };
    this.assets = new Map();
    this.scenes = new Map();
    this.characters = new Map();
    this.dialogueTrees = new Map();
    this.variables = {};
    this.entryPoint = null; // Starting scene
  }

  addAsset(assetId, asset) {
    this.assets.set(assetId, asset);
    this.modified = Date.now();
  }

  getAsset(assetId) {
    return this.assets.get(assetId);
  }

  removeAsset(assetId) {
    this.assets.delete(assetId);
    this.modified = Date.now();
  }

  addScene(sceneId, scene) {
    this.scenes.set(sceneId, scene);
    if (!this.entryPoint) {
      this.entryPoint = sceneId;
    }
    this.modified = Date.now();
  }

  getScene(sceneId) {
    return this.scenes.get(sceneId);
  }

  getAllScenes() {
    return Array.from(this.scenes.values());
  }

  setVariable(key, value) {
    this.variables[key] = value;
  }

  getVariable(key) {
    return this.variables[key];
  }

  serialize() {
    const scenesData = Array.from(this.scenes.values()).map(scene => scene.serialize?.() || scene);
    const assetsData = Array.from(this.assets.values());

    return {
      name: this.name,
      projectId: this.projectId,
      version: this.version,
      author: this.author,
      description: this.description,
      created: this.created,
      modified: this.modified,
      settings: this.settings,
      entryPoint: this.entryPoint,
      scenes: scenesData,
      assets: assetsData,
      variables: this.variables
    };
  }

  static deserialize(data) {
    const project = new GameProject(data.name, data.projectId);
    Object.assign(project, {
      version: data.version,
      author: data.author,
      description: data.description,
      created: data.created,
      modified: data.modified,
      settings: data.settings,
      entryPoint: data.entryPoint,
      variables: data.variables
    });
    return project;
  }

  generateId() {
    return 'proj_' + Math.random().toString(36).substr(2, 9);
  }
}

class AssetManager {
  constructor() {
    this.assets = new Map();
    this.assetTypes = new Map(); // Track asset types
    this.categories = new Map(); // Organize by category
  }

  createAsset(name, type, data = {}) {
    const asset = {
      id: this.generateId(),
      name: name,
      type: type, // 'sprite', 'tileset', 'animation', 'audio', 'font', 'script'
      data: data,
      created: Date.now(),
      modified: Date.now(),
      tags: [],
      category: 'general'
    };

    this.assets.set(asset.id, asset);
    this.updateTypeIndex(type, asset.id);

    return asset;
  }

  getAsset(assetId) {
    return this.assets.get(assetId);
  }

  getAllAssets() {
    return Array.from(this.assets.values());
  }

  getAssetsByType(type) {
    const typeAssets = this.assetTypes.get(type) || [];
    return typeAssets.map(id => this.assets.get(id)).filter(a => a);
  }

  getAssetsByCategory(category) {
    return this.getAllAssets().filter(asset => asset.category === category);
  }

  importAsset(file) {
    const asset = {
      id: this.generateId(),
      name: file.name,
      type: this.detectAssetType(file.type),
      data: file,
      created: Date.now(),
      modified: Date.now(),
      tags: [],
      category: 'imported'
    };

    this.assets.set(asset.id, asset);
    return asset;
  }

  updateTypeIndex(type, assetId) {
    if (!this.assetTypes.has(type)) {
      this.assetTypes.set(type, []);
    }
    this.assetTypes.get(type).push(assetId);
  }

  detectAssetType(mimeType) {
    if (mimeType.startsWith('image/')) return 'sprite';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('font/')) return 'font';
    if (mimeType === 'application/json') return 'data';
    return 'unknown';
  }

  deleteAsset(assetId) {
    const asset = this.assets.get(assetId);
    if (asset) {
      const typeAssets = this.assetTypes.get(asset.type) || [];
      const index = typeAssets.indexOf(assetId);
      if (index > -1) {
        typeAssets.splice(index, 1);
      }
      this.assets.delete(assetId);
    }
  }

  tagAsset(assetId, tag) {
    const asset = this.assets.get(assetId);
    if (asset && !asset.tags.includes(tag)) {
      asset.tags.push(tag);
    }
  }

  searchAssets(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllAssets().filter(asset =>
      asset.name.toLowerCase().includes(lowerQuery) ||
      asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  generateId() {
    return 'asset_' + Math.random().toString(36).substr(2, 9);
  }
}

// Tileset asset
class Tileset {
  constructor(name, imagePath, tileWidth, tileHeight) {
    this.name = name;
    this.imagePath = imagePath;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tiles = new Map();
    this.tileCount = 0;
  }

  addTile(tileId, properties = {}) {
    this.tiles.set(tileId, {
      id: tileId,
      properties: properties,
      collision: false,
      animated: false
    });
    this.tileCount++;
  }

  getTile(tileId) {
    return this.tiles.get(tileId);
  }

  setTileCollision(tileId, hasCollision) {
    const tile = this.tiles.get(tileId);
    if (tile) {
      tile.collision = hasCollision;
    }
  }
}

// Scene asset
class GameScene {
  constructor(name, width, height) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.gameObjects = [];
    this.cameras = [];
    this.lights = [];
    this.physics = {
      enabled: true,
      gravity: { x: 0, y: 9.8 },
      bounds: { x: 0, y: 0, width: width, height: height }
    };
    this.parent = null;
  }

  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
    gameObject.scene = this;
  }

  removeGameObject(gameObject) {
    const index = this.gameObjects.indexOf(gameObject);
    if (index > -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  getGameObjectsByTag(tag) {
    return this.gameObjects.filter(obj => obj.tags?.includes(tag));
  }

  addCamera(camera) {
    this.cameras.push(camera);
  }

  update(deltaTime) {
    for (const obj of this.gameObjects) {
      if (obj.update) {
        obj.update(deltaTime);
      }
    }
  }

  render(ctx) {
    for (const obj of this.gameObjects) {
      if (obj.render) {
        obj.render(ctx);
      }
    }
  }

  serialize() {
    return {
      name: this.name,
      width: this.width,
      height: this.height,
      gameObjects: this.gameObjects,
      physics: this.physics
    };
  }
}

// Save/Load system
class ProjectManager {
  constructor() {
    this.currentProject = null;
    this.projectHistory = [];
  }

  createProject(name) {
    this.currentProject = new GameProject(name);
    this.projectHistory.push({
      projectId: this.currentProject.projectId,
      name: name,
      timestamp: Date.now()
    });
    return this.currentProject;
  }

  saveProject(project) {
    const data = project.serialize();
    const json = JSON.stringify(data, null, 2);
    
    // Trigger download in browser
    if (typeof window !== 'undefined') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.dragonproject`;
      a.click();
    }
    
    return json;
  }

  loadProject(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      this.currentProject = GameProject.deserialize(data);
      return this.currentProject;
    } catch (error) {
      console.error('Failed to load project:', error);
      return null;
    }
  }

  exportProject(project, format = 'html5') {
    const exportData = {
      format: format,
      project: project.serialize(),
      timestamp: Date.now()
    };

    return JSON.stringify(exportData, null, 2);
  }

  getCurrentProject() {
    return this.currentProject;
  }

  getProjectHistory() {
    return this.projectHistory;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    GameProject, 
    AssetManager, 
    Tileset, 
    GameScene, 
    ProjectManager 
  };
}
