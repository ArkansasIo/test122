/**
 * GB Studio Scene Editor - Visual drag-and-drop scene builder
 */

/* eslint-disable no-undef */
/* global window, document, prompt */

(function(window) {
  'use strict';

  class SceneEditor {
    constructor(containerId, project, propertiesPanel) {
      this.container = document.getElementById(containerId);
      this.project = project;
      this.propertiesPanel = propertiesPanel;
      
      this.currentScene = null;
      this.selectedEntity = null;
      this.tool = 'select'; // 'select', 'actor', 'trigger', 'collision'
      this.zoom = 2;
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      
      this.init();
    }
    
    init() {
      this.render();
      this.attachEvents();
    }
    
    render() {
      this.container.innerHTML = `
        <div class="scene-editor">
          <div class="scene-toolbar">
            <div class="scene-toolbar-group">
              <select class="prop-select" id="sceneSelect" style="min-width:200px">
                <option value="">Select a scene...</option>
                ${this.project.scenes.map(s => `
                  <option value="${s.id}" ${s.id === this.currentScene?.id ? 'selected' : ''}>
                    ${s.name}
                  </option>
                `).join('')}
              </select>
              <button class="scene-tool-btn" id="newSceneBtn" title="New Scene">➕ Scene</button>
            </div>
            
            <div class="scene-toolbar-group">
              <button class="scene-tool-btn ${this.tool === 'select' ? 'active' : ''}" 
                      data-tool="select" title="Select (V)">
                ↖️ Select
              </button>
              <button class="scene-tool-btn ${this.tool === 'actor' ? 'active' : ''}" 
                      data-tool="actor" title="Add Actor (A)">
                👤 Actor
              </button>
              <button class="scene-tool-btn ${this.tool === 'trigger' ? 'active' : ''}" 
                      data-tool="trigger" title="Add Trigger (T)">
                ⚡ Trigger
              </button>
              <button class="scene-tool-btn ${this.tool === 'collision' ? 'active' : ''}" 
                      data-tool="collision" title="Paint Collision (C)">
                🚧 Collision
              </button>
            </div>
            
            <div class="scene-toolbar-group">
              <button class="scene-tool-btn" id="zoomOutBtn">🔍-</button>
              <span style="color:var(--text2);font-size:11px;min-width:50px;text-align:center">
                ${Math.round(this.zoom * 100)}%
              </span>
              <button class="scene-tool-btn" id="zoomInBtn">🔍+</button>
            </div>
            
            <div class="scene-toolbar-group">
              <button class="scene-tool-btn" id="gridToggleBtn">📏 Grid</button>
              <button class="scene-tool-btn" id="playTestBtn">▶️ Test</button>
            </div>
          </div>
          
          <div class="scene-canvas-area" id="sceneCanvasArea">
            ${this.currentScene ? this.renderScene() : '<div class="prop-empty">Select a scene to edit</div>'}
          </div>
        </div>
      `;
      
      this.attachToolbarEvents();
      if (this.currentScene) {
        this.renderEntities();
      }
    }
    
    renderScene() {
      const scene = this.currentScene;
      
      const canvasWidth = (scene.width || 20) * 8 * this.zoom;
      const canvasHeight = (scene.height || 18) * 8 * this.zoom;
      
      return `
        <div style="position:relative;width:${canvasWidth}px;height:${canvasHeight}px;">
          <canvas id="sceneCanvas" 
                  class="scene-canvas"
                  width="${canvasWidth}" 
                  height="${canvasHeight}"
                  style="width:${canvasWidth}px;height:${canvasHeight}px;">
          </canvas>
          <div id="sceneEntities"></div>
        </div>
      `;
    }
    
    renderEntities() {
      const entitiesContainer = document.getElementById('sceneEntities');
      if (!entitiesContainer || !this.currentScene) return;
      
      entitiesContainer.innerHTML = '';
      
      // Render actors
      this.currentScene.actors.forEach(actor => {
        const el = this.createEntityElement(actor, 'actor');
        entitiesContainer.appendChild(el);
      });
      
      // Render triggers
      this.currentScene.triggers.forEach(trigger => {
        const el = this.createEntityElement(trigger, 'trigger');
        entitiesContainer.appendChild(el);
      });
    }
    
    createEntityElement(entity, type) {
      const el = document.createElement('div');
      el.className = `scene-entity ${type} ${entity.id === this.selectedEntity?.id ? 'selected' : ''}`;
      el.dataset.entityId = entity.id;
      el.dataset.entityType = type;
      
      const width = (entity.width || 2) * 8 * this.zoom;
      const height = (entity.height || 2) * 8 * this.zoom;
      const x = entity.x * 8 * this.zoom;
      const y = entity.y * 8 * this.zoom;
      
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.width = width + 'px';
      el.style.height = height + 'px';
      
      const label = document.createElement('div');
      label.className = 'scene-entity-label';
      label.textContent = entity.name;
      el.appendChild(label);
      
      this.attachEntityEvents(el, entity, type);
      
      return el;
    }
    
    attachEntityEvents(el, entity, type) {
      el.addEventListener('mousedown', (e) => {
        if (this.tool !== 'select') return;
        
        e.stopPropagation();
        this.selectEntity(entity, type);
        
        this.isDragging = true;
        this.dragStartX = e.clientX - entity.x * 8 * this.zoom;
        this.dragStartY = e.clientY - entity.y * 8 * this.zoom;
        
        const onMouseMove = (moveEvent) => {
          if (!this.isDragging) return;
          
          const newX = Math.round((moveEvent.clientX - this.dragStartX) / (8 * this.zoom));
          const newY = Math.round((moveEvent.clientY - this.dragStartY) / (8 * this.zoom));
          
          entity.x = Math.max(0, Math.min(newX, this.currentScene.width - 1));
          entity.y = Math.max(0, Math.min(newY, this.currentScene.height - 1));
          
          el.style.left = (entity.x * 8 * this.zoom) + 'px';
          el.style.top = (entity.y * 8 * this.zoom) + 'px';
          
          if (this.propertiesPanel) {
            this.propertiesPanel.refresh();
          }
        };
        
        const onMouseUp = () => {
          this.isDragging = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.editEntity(entity, type);
      });
    }
    
    attachToolbarEvents() {
      // Scene selection
      const sceneSelect = document.getElementById('sceneSelect');
      if (sceneSelect) {
        sceneSelect.addEventListener('change', (e) => {
          const sceneId = e.target.value;
          this.loadScene(sceneId);
        });
      }
      
      // New scene button
      const newSceneBtn = document.getElementById('newSceneBtn');
      if (newSceneBtn) {
        newSceneBtn.addEventListener('click', () => this.createNewScene());
      }
      
      // Tool buttons
      document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.tool = btn.dataset.tool;
          this.render();
        });
      });
      
      // Zoom buttons
      const zoomInBtn = document.getElementById('zoomInBtn');
      const zoomOutBtn = document.getElementById('zoomOutBtn');
      if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
          this.zoom = Math.min(4, this.zoom + 0.5);
          this.render();
        });
      }
      if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
          this.zoom = Math.max(0.5, this.zoom - 0.5);
          this.render();
        });
      }
      
      // Canvas click for adding entities
      const canvas = document.getElementById('sceneCanvas');
      if (canvas) {
        canvas.addEventListener('click', (e) => {
          if (this.tool === 'select') return;
          
          const rect = canvas.getBoundingClientRect();
          const x = Math.floor((e.clientX - rect.left) / (8 * this.zoom));
          const y = Math.floor((e.clientY - rect.top) / (8 * this.zoom));
          
          this.addEntityAtPosition(x, y);
        });
      }
      
      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key.toLowerCase()) {
          case 'v': this.tool = 'select'; this.render(); break;
          case 'a': this.tool = 'actor'; this.render(); break;
          case 't': this.tool = 'trigger'; this.render(); break;
          case 'c': this.tool = 'collision'; this.render(); break;
          case 'delete':
          case 'backspace':
            if (this.selectedEntity) {
              this.deleteSelectedEntity();
              e.preventDefault();
            }
            break;
        }
      });
    }
    
    loadScene(sceneId) {
      this.currentScene = this.project.scenes.find(s => s.id === sceneId);
      this.selectedEntity = null;
      this.render();
      
      if (this.propertiesPanel) {
        this.propertiesPanel.setEntity(null);
      }
    }
    
    createNewScene() {
      const name = prompt('Scene name:', 'New Scene');
      if (!name) return;
      
      const scene = this.project.addScene(name, null);
      this.currentScene = scene;
      this.render();
    }
    
    addEntityAtPosition(x, y) {
      if (!this.currentScene) return;
      
      let entity;
      if (this.tool === 'actor') {
        entity = this.project.addActor(this.currentScene.id, null, x, y);
      } else if (this.tool === 'trigger') {
        entity = this.project.addTrigger(this.currentScene.id, x, y, 2, 2);
      }
      
      this.render();
      if (entity && this.propertiesPanel) {
        this.selectEntity(entity, this.tool);
      }
    }
    
    selectEntity(entity, type) {
      this.selectedEntity = entity;
      this.render();
      
      if (this.propertiesPanel) {
        this.propertiesPanel.setEntity(entity, type);
      }
      
      window.dispatchEvent(new CustomEvent('entitySelected', { 
        detail: { entity, type } 
      }));
    }
    
    editEntity(entity, type) {
      // Open event editor or detailed properties
      window.dispatchEvent(new CustomEvent('editEntity', { 
        detail: { entity, type } 
      }));
    }
    
    deleteSelectedEntity() {
      if (!this.selectedEntity || !this.currentScene) return;
      
      // Remove from actors
      let index = this.currentScene.actors.findIndex(a => a.id === this.selectedEntity.id);
      if (index !== -1) {
        this.currentScene.actors.splice(index, 1);
      } else {
        // Remove from triggers
        index = this.currentScene.triggers.findIndex(t => t.id === this.selectedEntity.id);
        if (index !== -1) {
          this.currentScene.triggers.splice(index, 1);
        }
      }
      
      this.selectedEntity = null;
      this.render();
      
      if (this.propertiesPanel) {
        this.propertiesPanel.setEntity(null);
      }
    }
    
    attachEvents() {
      // Additional event handlers
    }
  }
  
  /**
   * Properties Panel - Inspector for selected entities
   */
  class PropertiesPanel {
    constructor(containerId, project) {
      this.container = document.getElementById(containerId);
      this.project = project;
      this.entity = null;
      this.entityType = null;
      
      this.init();
    }
    
    init() {
      this.render();
    }
    
    setEntity(entity, type) {
      this.entity = entity;
      this.entityType = type;
      this.render();
    }
    
    render() {
      if (!this.entity) {
        this.container.innerHTML = `
          <div class="properties-panel">
            <div class="prop-empty">
              <div style="font-size:48px;margin-bottom:12px;">📋</div>
              <div>Select an entity to edit properties</div>
            </div>
          </div>
        `;
        return;
      }
      
      this.container.innerHTML = `
        <div class="properties-panel">
          <div class="prop-header">
            <h3>${this.entity.name}</h3>
            <div class="prop-type">${this.entityType}</div>
          </div>
          
          ${this.renderProperties()}
        </div>
      `;
      
      this.attachPropertyEvents();
    }
    
    renderProperties() {
      if (this.entityType === 'actor') {
        return this.renderActorProperties();
      } else if (this.entityType === 'trigger') {
        return this.renderTriggerProperties();
      }
      return '';
    }
    
    renderActorProperties() {
      const actor = this.entity;
      const sprites = this.project.sprites;
      
      return `
        <div class="prop-section">
          <div class="prop-section-title">Basic</div>
          <div class="prop-section-content">
            <div class="prop-field">
              <label class="prop-label">Name</label>
              <input type="text" class="prop-input" data-prop="name" value="${actor.name}" />
            </div>
            
            <div class="prop-field">
              <label class="prop-label">Sprite</label>
              <select class="prop-select" data-prop="spriteId">
                <option value="">None</option>
                ${sprites.map(s => `
                  <option value="${s.id}" ${s.id === actor.spriteId ? 'selected' : ''}>
                    ${s.name}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>
        
        <div class="prop-section">
          <div class="prop-section-title">Position</div>
          <div class="prop-section-content">
            <div class="prop-input-group">
              <div class="prop-field">
                <label class="prop-label">X</label>
                <input type="number" class="prop-input" data-prop="x" value="${actor.x}" />
              </div>
              <div class="prop-field">
                <label class="prop-label">Y</label>
                <input type="number" class="prop-input" data-prop="y" value="${actor.y}" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="prop-section">
          <div class="prop-section-title">Movement</div>
          <div class="prop-section-content">
            <div class="prop-field">
              <label class="prop-label">Move Speed</label>
              <select class="prop-select" data-prop="moveSpeed">
                <option value="0" ${actor.moveSpeed === 0 ? 'selected' : ''}>0 - Static</option>
                <option value="1" ${actor.moveSpeed === 1 ? 'selected' : ''}>1 - Slow</option>
                <option value="2" ${actor.moveSpeed === 2 ? 'selected' : ''}>2 - Normal</option>
                <option value="3" ${actor.moveSpeed === 3 ? 'selected' : ''}>3 - Fast</option>
              </select>
            </div>
            
            <div class="prop-field">
              <label class="prop-label">Direction</label>
              <select class="prop-select" data-prop="direction">
                <option value="up" ${actor.direction === 'up' ? 'selected' : ''}>Up</option>
                <option value="down" ${actor.direction === 'down' ? 'selected' : ''}>Down</option>
                <option value="left" ${actor.direction === 'left' ? 'selected' : ''}>Left</option>
                <option value="right" ${actor.direction === 'right' ? 'selected' : ''}>Right</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="prop-section">
          <div class="prop-section-title">Options</div>
          <div class="prop-section-content">
            <div class="prop-field">
              <label>
                <input type="checkbox" class="prop-checkbox" data-prop="isPersistent" 
                       ${actor.isPersistent ? 'checked' : ''} />
                Persistent across scenes
              </label>
            </div>
            
            <div class="prop-field">
              <label class="prop-label">Collision Group</label>
              <input type="text" class="prop-input" data-prop="collisionGroup" 
                     value="${actor.collisionGroup}" />
            </div>
          </div>
        </div>
      `;
    }
    
   renderTriggerProperties() {
      const trigger = this.entity;
      
      return `
        <div class="prop-section">
          <div class="prop-section-title">Basic</div>
          <div class="prop-section-content">
            <div class="prop-field">
              <label class="prop-label">Name</label>
              <input type="text" class="prop-input" data-prop="name" value="${trigger.name}" />
            </div>
            
            <div class="prop-field">
              <label class="prop-label">Trigger Type</label>
              <select class="prop-select" data-prop="triggerType">
                <option value="interact" ${trigger.triggerType === 'interact' ? 'selected' : ''}>On Interact (A button)</option>
                <option value="enter" ${trigger.triggerType === 'enter' ? 'selected' : ''}>On Player Enter</option>
                <option value="leave" ${trigger.triggerType === 'leave' ? 'selected' : ''}>On Player Leave</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="prop-section">
          <div class="prop-section-title">Position & Size</div>
          <div class="prop-section-content">
            <div class="prop-input-group">
              <div class="prop-field">
                <label class="prop-label">X</label>
                <input type="number" class="prop-input" data-prop="x" value="${trigger.x}" />
              </div>
              <div class="prop-field">
                <label class="prop-label">Y</label>
                <input type="number" class="prop-input" data-prop="y" value="${trigger.y}" />
              </div>
            </div>
            
            <div class="prop-input-group">
              <div class="prop-field">
                <label class="prop-label">Width</label>
                <input type="number" class="prop-input" data-prop="width" value="${trigger.width}" min="1" />
              </div>
              <div class="prop-field">
                <label class="prop-label">Height</label>
                <input type="number" class="prop-input" data-prop="height" value="${trigger.height}" min="1" />
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    attachPropertyEvents() {
      // Text inputs
      document.querySelectorAll('.prop-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const prop = e.target.dataset.prop;
          let value = e.target.value;
          
          if (e.target.type === 'number') {
            value = parseFloat(value);
          }
          
          this.entity[prop] = value;
          this.onPropertyChanged(prop, value);
        });
      });
      
      // Selects
      document.querySelectorAll('.prop-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const prop = e.target.dataset.prop;
          let value = e.target.value;
          
          if (!isNaN(value) && value !== '') {
            value = parseFloat(value);
          }
          
          this.entity[prop] = value;
          this.onPropertyChanged(prop, value);
        });
      });
      
      // Checkboxes
      document.querySelectorAll('.prop-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const prop = e.target.dataset.prop;
          const value = e.target.checked;
          
          this.entity[prop] = value;
          this.onPropertyChanged(prop, value);
        });
      });
    }
    
    onPropertyChanged(property, value) {
      window.dispatchEvent(new CustomEvent('propertyChanged', { 
        detail: { entity: this.entity, property, value } 
      }));
    }
    
    refresh() {
      this.render();
    }
  }
  
  // Export to global scope
  window.GBStudio = window.GBStudio || {};
  window.GBStudio.SceneEditor = SceneEditor;
  window.GBStudio.PropertiesPanel = PropertiesPanel;
  
})(window);
