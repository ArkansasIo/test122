/**
 * GB Studio Core - Project Structure & Asset Management
 * Foundational system for GB Studio-like features
 */

/* eslint-disable no-undef */
/* global window, document */

(function(window) {
  'use strict';

  /**
   * Project Data Model - Central data structure for entire game project
   */
  class ProjectModel {
    constructor() {
      this.name = 'Labyrinth of the Dragon';
      this.author = '';
      this.version = '1.0.0';
      
      // Asset collections
      this.backgrounds = [];
      this.sprites = [];
      this.tilesets = [];
      this.palettes = [];
      this.music = [];
      this.sounds = [];
      
      // Game structure  
      this.scenes = [];
      this.variables = [];
      this.customEvents = [];
      
      // Settings
      this.settings = {
        colorMode: 'color', // 'mono' or 'color'
        playerSpriteId: null,
        startSceneId: null,
        cartType: 'MBC5',
        batterySupport: true
      };
      
      this._idCounter = 1;
    }
    
    generateId() {
      return `gb_${Date.now()}_${this._idCounter++}`;
    }
    
    // Asset management
    addBackground(name, width, height, data) {
      const bg = {
        id: this.generateId(),
        type: 'background',
        name: name,
        width: width,
        height: height,
        tileData: data || [],
        created: Date.now()
      };
      this.backgrounds.push(bg);
      return bg;
    }
    
    addSprite(name, width, height, frames) {
      const sprite = {
        id: this.generateId(),
        type: 'sprite',
        name: name,
        width: width,
        height: height,
        frames: frames || [],
        animations: {},
        collisionBox: { x: 0, y: 0, w: width, h: height },
        created: Date.now()
      };
      this.sprites.push(sprite);
      return sprite;
    }
    
    addTileset(name, tileData) {
      const tileset = {
        id: this.generateId(),
        type: 'tileset',
        name: name,
        tiles: tileData || [],
        created: Date.now()
      };
      this.tilesets.push(tileset);
      return tileset;
    }
    
    addMusic(name, data) {
      const music = {
        id: this.generateId(),
        type: 'music',
        name: name,
        data: data || '',
        format: 'GBT', // Game Boy Tracker format
        created: Date.now()
      };
      this.music.push(music);
      return music;
    }
    
    addScene(name, backgroundId) {
      const scene = {
        id: this.generateId(),
        type: 'scene',
        name: name,
        backgroundId: backgroundId,
        actors: [],
        triggers: [],
        collisions: [],
        scripts: [],
        width: 20,
        height: 18,
        created: Date.now()
      };
      this.scenes.push(scene);
      return scene;
    }
    
    addActor(sceneId, spriteId, x, y) {
      const scene = this.scenes.find(s => s.id === sceneId);
      if (!scene) return null;
      
      const actor = {
        id: this.generateId(),
        type: 'actor',
        name: 'Actor',
        spriteId: spriteId,
        x: x || 0,
        y: y || 0,
        direction: 'down',
        moveSpeed: 1,
        animSpeed: 3,
        collisionGroup: 'default',
        script: [],
        isPersistent: false
      };
      scene.actors.push(actor);
      return actor;
    }
    
    addTrigger(sceneId, x, y, width, height) {
      const scene = this.scenes.find(s => s.id === sceneId);
      if (!scene) return null;
      
      const trigger = {
        id: this.generateId(),
        type: 'trigger',
        name: 'Trigger',
        x: x || 0,
        y: y || 0,
        width: width || 1,
        height: height || 1,
        script: [],
        triggerType: 'interact' // 'interact', 'enter', 'leave'
      };
      scene.triggers.push(trigger);
      return trigger;
    }
    
    // Find assets
    getAssetById(id) {
      const collections = [
        ...this.backgrounds,
        ...this.sprites,
        ...this.tilesets,
        ...this.music,
        ...this.sounds,
        ...this.scenes
      ];
      return collections.find(item => item.id === id);
    }
    
    getAssetsByType(type) {
      switch(type) {
        case 'background': return this.backgrounds;
        case 'sprite': return this.sprites;
        case 'tileset': return this.tilesets;
        case 'music': return this.music;
        case 'sound': return this.sounds;
        case 'scene': return this.scenes;
        default: return [];
      }
    }
    
    // Export/Import
    toJSON() {
      return JSON.stringify({
        name: this.name,
        author: this.author,
        version: this.version,
        backgrounds: this.backgrounds,
        sprites: this.sprites,
        tilesets: this.tilesets,
        palettes: this.palettes,
        music: this.music,
        sounds: this.sounds,
        scenes: this.scenes,
        variables: this.variables,
        customEvents: this.customEvents,
        settings: this.settings
      }, null, 2);
    }
    
    fromJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        Object.assign(this, data);
        return true;
      } catch(e) {
        console.error('Failed to parse project JSON:', e);
        return false;
      }
    }
  }
  
  /**
   * Asset Browser UI - Enhanced visual asset management
   */
  class AssetBrowser {
    constructor(containerId, project) {
      this.container = document.getElementById(containerId);
      this.project = project;
      this.currentCategory = 'all';
      this.searchQuery = '';
      this.selectedAsset = null;
      
      this.categories = [
        { id: 'all', name: 'All Assets', icon: '📦' },
        { id: 'scene', name: 'Scenes', icon: '🎬' },
        { id: 'background', name: 'Backgrounds', icon: '🖼️' },
        { id: 'sprite', name: 'Sprites', icon: '👤' },
        { id: 'tileset', name: 'Tilesets', icon: '🧱' },
        { id: 'music', name: 'Music', icon: '🎵' },
        { id: 'sound', name: 'Sounds', icon: '🔊' }
      ];
      
      this.init();
    }
    
    init() {
      this.render();
      this.attachEvents();
    }
    
    render() {
      this.container.innerHTML = `
        <div class="asset-browser">
          <div class="asset-browser-header">
            <h3>📦 Asset Browser</h3>
            <input type="text" class="asset-search" placeholder="Search assets..." id="assetSearch" />
          </div>
          
          <div class="asset-categories">
            ${this.categories.map(cat => `
              <button class="asset-category-btn ${cat.id === this.currentCategory ? 'active' : ''}" 
                      data-category="${cat.id}">
                <span class="cat-icon">${cat.icon}</span>
                <span class="cat-name">${cat.name}</span>
                <span class="cat-count">${this.getAssetCount(cat.id)}</span>
              </button>
            `).join('')}
          </div>
          
          <div class="asset-list" id="assetList">
            ${this.renderAssetList()}
          </div>
          
          <div class="asset-actions">
            <button class="asset-action-btn" id="addAssetBtn">
              <span>➕</span> Add ${this.getCategoryName()}
            </button>
            <button class="asset-action-btn" id="importAssetBtn">
              <span>📥</span> Import
            </button>
          </div>
        </div>
      `;
      
      this.attachCategoryEvents();
    }
    
    renderAssetList() {
      let assets = this.currentCategory === 'all' 
        ? [...this.project.backgrounds, ...this.project.sprites, ...this.project.tilesets, ...this.project.music, ...this.project.scenes]
        : this.project.getAssetsByType(this.currentCategory);
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        assets = assets.filter(a => a.name.toLowerCase().includes(query));
      }
      
      if (assets.length === 0) {
        return '<div class="asset-empty">No assets found</div>';
      }
      
      return assets.map(asset => `
        <div class="asset-item ${asset.id === (this.selectedAsset?.id) ? 'selected' : ''}" 
             data-asset-id="${asset.id}">
          <div class="asset-icon">${this.getAssetIcon(asset.type)}</div>
          <div class="asset-info">
            <div class="asset-name">${asset.name}</div>
            <div class="asset-meta">${this.getAssetMeta(asset)}</div>
          </div>
          <div class="asset-preview" style="display:none">
            <canvas width="32" height="32"></canvas>
          </div>
        </div>
      `).join('');
    }
    
    getAssetIcon(type) {
      const icons = {
        scene: '🎬',
        background: '🖼️',
        sprite: '👤',
        tileset: '🧱',
        music: '🎵',
        sound: '🔊'
      };
      return icons[type] || '📄';
    }
    
    getAssetMeta(asset) {
      switch(asset.type) {
        case 'background':
        case 'sprite':
        case 'tileset':
          return `${asset.width || 0}×${asset.height || 0}`;
        case 'scene':
          return `${asset.actors?.length || 0} actors`;
        case 'music':
          return asset.format || 'GBT';
        default:
          return '';
      }
    }
    
    getAssetCount(categoryId) {
      if (categoryId === 'all') {
        return this.project.backgrounds.length + 
               this.project.sprites.length + 
               this.project.tilesets.length + 
               this.project.music.length +
               this.project.scenes.length;
      }
      return this.project.getAssetsByType(categoryId).length;
    }
    
    getCategoryName() {
      return this.categories.find(c => c.id === this.currentCategory)?.name || 'Asset';
    }
    
    attachCategoryEvents() {
      document.querySelectorAll('.asset-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentCategory = btn.dataset.category;
          this.render();
        });
      });
      
      document.querySelectorAll('.asset-item').forEach(item => {
        item.addEventListener('click', () => {
          const assetId = item.dataset.assetId;
          this.selectedAsset = this.project.getAssetById(assetId);
          this.render();
          this.onAssetSelected(this.selectedAsset);
        });
      });
      
      const searchInput = document.getElementById('assetSearch');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          this.render();
        });
      }
    }
    
    attachEvents() {
      // Event handlers to be overridden
    }
    
    onAssetSelected(asset) {
      // Override this to handle asset selection
      window.dispatchEvent(new CustomEvent('assetSelected', { detail: asset }));
    }
    
    refresh() {
      this.render();
    }
  }
  
  // Export to global scope
  window.GBStudio = window.GBStudio || {};
  window.GBStudio.ProjectModel = ProjectModel;
  window.GBStudio.AssetBrowser = AssetBrowser;
  
})(window);
