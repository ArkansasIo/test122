/**
 * GB Studio Event System - Visual Scripting Engine
 */

/* eslint-disable no-undef */
/* global window, document */

(function(window) {
  'use strict';

  /**
   * Event Templates - Defines all available event types
   */
  const EVENT_TEMPLATES = {
    // Dialog & Text
    text_showDialog: {
      name: 'Show Dialog',
      icon: '💬',
      category: 'dialog',
      fields: [
        { name: 'text', type: 'textarea', label: 'Text', default: '' },
        { name: 'avatarId', type: 'sprite', label: 'Avatar', default: null }
      ]
    },
    text_showChoice: {
      name: 'Show Choice',
      icon: '🔀',
      category: 'dialog',
      fields: [
        { name: 'text', type: 'text', label: 'Question', default: '' },
        { name: 'option1', type: 'text', label: 'Option 1', default: 'Yes' },
        { name: 'option2', type: 'text', label: 'Option 2', default: 'No' }
      ]
    },
    
    // Movement & Scenes
    actor_moveTo: {
      name: 'Actor Move To',
      icon: '↗️',
      category: 'actor',
      fields: [
        { name: 'actorId', type: 'actor', label: 'Actor', default: 'player' },
        { name: 'x', type: 'number', label: 'X', default: 0 },
        { name: 'y', type: 'number', label: 'Y', default: 0 },
        { name: 'moveType', type: 'select', label: 'Move Type', options: ['Horizontal First', 'Vertical First', 'Diagonal'], default: 'Horizontal First' }
      ]
    },
    actor_setDirection: {
      name: 'Actor Set Direction',
      icon: '➡️',
      category: 'actor',
      fields: [
        { name: 'actorId', type: 'actor', label: 'Actor', default: 'player' },
        { name: 'direction', type: 'select', label: 'Direction', options: ['Up', 'Down', 'Left', 'Right'], default: 'Down' }
      ]
    },
    scene_switchTo: {
      name: 'Switch Scene',
      icon: '🚪',
      category: 'scene',
      fields: [
        { name: 'sceneId', type: 'scene', label: 'Scene', default: null },
        { name: 'x', type: 'number', label: 'Player X', default: 0 },
        { name: 'y', type: 'number', label: 'Player Y', default: 0 },
        { name: 'fadeType', type: 'select', label: 'Transition', options: ['None', 'Fade', 'Wipe'], default: 'Fade' }
      ]
    },
    
    // Variables & Logic
    variable_set: {
      name: 'Set Variable',
      icon: '📦',
      category: 'variables',
      fields: [
        { name: 'varId', type: 'variable', label: 'Variable', default: null },
        { name: 'operation', type: 'select', label: 'Operation', options: ['Set', 'Add', 'Subtract', 'Multiply', 'Divide'], default: 'Set' },
        { name: 'value', type: 'number', label: 'Value', default: 0 }
      ]
    },
    control_if: {
      name: 'If Condition',
      icon: '❓',
      category: 'control',
      fields: [
        { name: 'varId', type: 'variable', label: 'Variable', default: null },
        { name: 'comparison', type: 'select', label: 'Comparison', options: ['==', '!=', '>', '<', '>=', '<='], default: '==' },
        { name: 'value', type: 'number', label: 'Value', default: 0 }
      ],
      hasChildren: true
    },
    control_loop: {
      name: 'Loop Forever',
      icon: '🔁',
      category: 'control',
      fields: [],
      hasChildren: true
    },
    control_wait: {
      name: 'Wait',
      icon: '⏰',
      category: 'control',
      fields: [
        { name: 'duration', type: 'number', label: 'Duration (frames)', default: 60 }
      ]
    },
    
    // Audio
    audio_playMusic: {
      name: 'Play Music',
      icon: '🎵',
      category: 'audio',
      fields: [
        { name: 'musicId', type: 'music', label: 'Music', default: null },
        { name: 'loop', type: 'checkbox', label: 'Loop', default: true }
      ]
    },
    audio_playSound: {
      name: 'Play Sound',
      icon: '🔊',
      category: 'audio',
      fields: [
        { name: 'soundId', type: 'sound', label: 'Sound', default: null }
      ]
    },
    audio_stopMusic: {
      name: 'Stop Music',
      icon: '🔇',
      category: 'audio',
      fields: []
    },
    
    // Effects
    effect_fadeIn: {
      name: 'Fade In',
      icon: '🌅',
      category: 'camera',
      fields: [
        { name: 'speed', type: 'select', label: 'Speed', options: ['Slow', 'Medium', 'Fast', 'Instant'], default: 'Medium' }
      ]
    },
    effect_fadeOut: {
      name: 'Fade Out',
      icon: '🌑',
      category: 'camera',
      fields: [
        { name: 'speed', type: 'select', label: 'Speed', options: ['Slow', 'Medium', 'Fast', 'Instant'], default: 'Medium' }
      ]
    },
    camera_shake: {
      name: 'Camera Shake',
      icon: '📳',
      category: 'camera',
      fields: [
        { name: 'intensity', type: 'select', label: 'Intensity', options: ['Light', 'Medium', 'Heavy'], default: 'Medium' },
        { name: 'duration', type: 'number', label: 'Duration (frames)', default: 30 }
      ]
    },
    
    // Game
    game_saveData: {
      name: 'Save Game',
      icon: '💾',
      category: 'game',
      fields: []
    },
    game_loadData: {
      name: 'Load Game',
      icon: '📂',
      category: 'game',
      fields: []
    },
    game_startBattle: {
      name: 'Start Battle',
      icon: '⚔️',
      category: 'game',
      fields: [
        { name: 'monsterId', type: 'text', label: 'Monster ID', default: '' },
        { name: 'battleBg', type: 'background', label: 'Background', default: null }
      ]
    }
  };

  /**
   * Event Editor - Visual event scripting interface
   */
  class EventEditor {
    constructor(containerId, project) {
      this.container = document.getElementById(containerId);
      this.project = project;
      this.entity = null; // Actor or trigger whose events we're editing
      this.events = [];
      this.selectedEvent = null;
      this.clipboard = null;
      
      this.init();
    }
    
    init() {
      this.render();
    }
    
    setEntity(entity) {
      this.entity = entity;
      this.events = entity?.script || [];
      this.selectedEvent = null;
      this.render();
    }
    
    render() {
      if (!this.container) {
        console.warn('[EventEditor] Container not found');
        return;
      }
      
      if (!this.entity) {
        this.container.innerHTML = `
          <div class="event-editor">
            <div class="prop-empty">
              <div style="font-size:48px;margin-bottom:12px;">⚡</div>
              <div>Select an actor or trigger to edit events</div>
            </div>
          </div>
        `;
        return;
      }
      
      this.container.innerHTML = `
        <div class="event-editor">
          <div class="event-toolbar">
            <button class="scene-tool-btn" id="addEventBtn">➕ Add Event</button>
            <button class="scene-tool-btn" id="copyEventBtn" ${!this.selectedEvent ? 'disabled' : ''}>📋 Copy</button>
            <button class="scene-tool-btn" id="pasteEventBtn" ${!this.clipboard ? 'disabled' : ''}>📄 Paste</button>
            <button class="scene-tool-btn" id="deleteEventBtn" ${!this.selectedEvent ? 'disabled' : ''}>🗑️ Delete</button>
          </div>
          
          <div class="event-list" id="eventList">
            ${this.renderEventList()}
            <button class="event-add-btn" id="quickAddEventBtn">
              ➕ Add Event
            </button>
          </div>
        </div>
      `;
      
      this.attachEventListeners();
    }
    
    renderEventList() {
      if (this.events.length === 0) {
        return '<div class="prop-empty" style="padding:40px 20px;">No events yet. Click "Add Event" to start.</div>';
      }
      
      return this.events.map((event, index) => {
        const template = EVENT_TEMPLATES[event.type];
        if (!template) return '';
        
        return `
          <div class="event-block ${event === this.selectedEvent ? 'selected' : ''}" 
               data-event-index="${index}">
            <div class="event-block-header">
              <span class="event-block-icon">${template.icon}</span>
              <span>${template.name}</span>
            </div>
            <div class="event-block-body">
              ${this.renderEventSummary(event, template)}
            </div>
          </div>
        `;
      }).join('');
    }
    
    renderEventSummary(event, template) {
      const parts = [];
      
      template.fields.forEach(field => {
        const value = event.data[field.name];
        if (value !== undefined && value !== null && value !== '') {
          if (field.type === 'textarea' && value.length > 50) {
            parts.push(`"${value.substring(0, 50)}..."`);
          } else if (field.type === 'scene' || field.type === 'sprite' || field.type === 'music') {
            const asset = this.project.getAssetById(value);
            if (asset) {
              parts.push(`<strong>${asset.name}</strong>`);
            }
          } else {
            parts.push(`<strong>${value}</strong>`);
          }
        }
      });
      
      return parts.length > 0 ? parts.join(', ') : '<em>Click to configure</em>';
    }
    
    attachEventListeners() {
      // Add event button
      const addEventBtn = document.getElementById('addEventBtn');
      const quickAddEventBtn = document.getElementById('quickAddEventBtn');
      
      if (addEventBtn) {
        addEventBtn.addEventListener('click', () => this.showEventPicker());
      }
      if (quickAddEventBtn) {
        quickAddEventBtn.addEventListener('click', () => this.showEventPicker());
      }
      
      // Copy/Paste/Delete
      const copyBtn = document.getElementById('copyEventBtn');
      const pasteBtn = document.getElementById('pasteEventBtn');
      const deleteBtn = document.getElementById('deleteEventBtn');
      
      if (copyBtn) {
        copyBtn.addEventListener('click', () => this.copyEvent());
      }
      if (pasteBtn) {
        pasteBtn.addEventListener('click', () => this.pasteEvent());
      }
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteEvent());
      }
      
      // Event blocks
      document.querySelectorAll('.event-block').forEach(block => {
        block.addEventListener('click', () => {
          const index = parseInt(block.dataset.eventIndex);
          this.selectEvent(index);
        });
        
        block.addEventListener('dblclick', () => {
          const index = parseInt(block.dataset.eventIndex);
          this.editEvent(index);
        });
      });
    }
    
    showEventPicker() {
      // Create modal with event categories
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;';
      
      const categories = this.getEventCategories();
      
      modal.innerHTML = `
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:20px;max-width:600px;max-height:80vh;overflow-y:auto;">
          <h3 style="margin:0 0 16px 0;color:var(--text);">Add Event</h3>
          ${categories.map(cat => `
            <div style="margin-bottom:20px;">
              <h4 style="color:var(--text2);font-size:11px;text-transform:uppercase;margin-bottom:8px;">${cat.name}</h4>
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;">
                ${cat.events.map(eventType => {
                  const template = EVENT_TEMPLATES[eventType];
                  return `
                    <button class="scene-tool-btn" data-event-type="${eventType}" style="justify-content:flex-start;padding:10px;">
                      <span style="margin-right:8px;">${template.icon}</span>
                      <span style="font-size:11px;">${template.name}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
          <button class="scene-tool-btn" id="cancelEventPicker" style="width:100%;margin-top:12px;">Cancel</button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelectorAll('[data-event-type]').forEach(btn => {
        btn.addEventListener('click', () => {
          const eventType = btn.dataset.eventType;
          this.addEvent(eventType);
          document.body.removeChild(modal);
        });
      });
      
      document.getElementById('cancelEventPicker').addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    }
    
    getEventCategories() {
      const categories = {
        dialog: { name: 'Dialog & Text', events: [] },
        actor: { name: 'Actor & Movement', events: [] },
        scene: { name: 'Scenes', events: [] },
        variables: { name: 'Variables & Logic', events: [] },
        control: { name: 'Control Flow', events: [] },
        audio: { name: 'Audio', events: [] },
        camera: { name: 'Camera & Effects', events: [] },
        game: { name: 'Game', events: [] }
      };
      
      Object.keys(EVENT_TEMPLATES).forEach(eventType => {
        const template = EVENT_TEMPLATES[eventType];
        if (categories[template.category]) {
          categories[template.category].events.push(eventType);
        }
      });
      
      return Object.values(categories).filter(cat => cat.events.length > 0);
    }
    
    addEvent(eventType) {
      const template = EVENT_TEMPLATES[eventType];
      if (!template) return;
      
      const event = {
        type: eventType,
        data: {},
        children: template.hasChildren ? [] : undefined
      };
      
      // Set default values
      template.fields.forEach(field => {
        event.data[field.name] = field.default;
      });
      
      this.events.push(event);
      this.entity.script = this.events;
      this.selectedEvent = event;
      
      this.render();
      this.editEvent(this.events.length - 1);
    }
    
    selectEvent(index) {
      this.selectedEvent = this.events[index];
      this.render();
    }
    
    editEvent(index) {
      const event = this.events[index];
      const template = EVENT_TEMPLATES[event.type];
      if (!template) return;
      
      // Show event editor modal
      window.dispatchEvent(new CustomEvent('editEventDetail', { 
        detail: { event, template, project: this.project } 
      }));
    }
    
    copyEvent() {
      if (!this.selectedEvent) return;
      this.clipboard = JSON.parse(JSON.stringify(this.selectedEvent));
      this.render();
    }
    
    pasteEvent() {
      if (!this.clipboard) return;
      const copy = JSON.parse(JSON.stringify(this.clipboard));
      this.events.push(copy);
      this.entity.script = this.events;
      this.render();
    }
    
    deleteEvent() {
      if (!this.selectedEvent) return;
      const index = this.events.indexOf(this.selectedEvent);
      if (index !== -1) {
        this.events.splice(index, 1);
        this.entity.script = this.events;
        this.selectedEvent = null;
        this.render();
      }
    }
  }
  
  // Export to global scope
  window.GBStudio = window.GBStudio || {};
  window.GBStudio.EventEditor = EventEditor;
  window.GBStudio.EVENT_TEMPLATES = EVENT_TEMPLATES;
  
})(window);
