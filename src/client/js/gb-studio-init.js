/**
 * GB Studio Integration - Initializes all GB Studio components
 */

/* eslint-disable no-undef */
/* global window, document, GBStudio */

(function() {
  'use strict';

  // Initialize GB Studio when document is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initializing GB Studio features...');
    
    // Create project model
    const project = new GBStudio.ProjectModel();
    window.gbProject = project; // Make it globally accessible
    
    // Add some demo content
    initializeDemoContent(project);
    
    // Initialize Asset Browser
    const assetBrowser = new GBStudio.AssetBrowser('assetBrowserContainer', project);
    window.gbAssetBrowser = assetBrowser;
    
    // Initialize Properties Panel
    const propertiesPanel = new GBStudio.PropertiesPanel('propertiesPanelContainer', project);
    window.gbPropertiesPanel = propertiesPanel;
    
    // Initialize Scene Editor
    const sceneEditor = new GBStudio.SceneEditor('sceneEditorContainer', project, propertiesPanel);
    window.gbSceneEditor = sceneEditor;
    
    // Initialize Event Editor (we'll add a dedicated panel for this)
    const eventEditor = new GBStudio.EventEditor('eventEditorContainer', project);
    window.gbEventEditor = eventEditor;
    
    // Connect event handlers between components
    setupComponentInteractions(assetBrowser, sceneEditor, propertiesPanel, eventEditor);
    
    // Add tab switching support
    setupTabSwitching();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Add save/load functionality
    setupProjectPersistence(project);
    
    console.log('✅ GB Studio features initialized successfully!');
    console.log('📦 Project:', project.name);
    console.log('🎬 Scenes:', project.scenes.length);
    console.log('👤 Sprites:', project.sprites.length);
    console.log('🖼️ Backgrounds:', project.backgrounds.length);
  });
  
  function initializeDemoContent(project) {
    // Add demo scene
    const scene1 = project.addScene('Start Scene', null);
    scene1.width = 20;
    scene1.height = 18;
    
    // Add demo sprites
    project.addSprite('Player', 16, 16, []);
    project.addSprite('NPC', 16, 16, []);
    project.addSprite('Monster', 16, 16, []);
    
    // Add demo backgrounds
    project.addBackground('Forest', 160, 144, []);
    project.addBackground('Cave', 160, 144, []);
    project.addBackground('Town', 160, 144, []);
    
    // Add demo music tracks
    project.addMusic('Title Theme', '');
    project.addMusic('Battle Theme', '');
    project.addMusic('Victory', '');
    
    console.log('📝 Demo content created');
  }
  
  function setupComponentInteractions(assetBrowser, sceneEditor, propertiesPanel, eventEditor) {
    // When asset is selected in browser, do something based on type
    window.addEventListener('assetSelected', (e) => {
      const asset = e.detail;
      console.log('Asset selected:', asset.name, asset.type);
      
      if (asset.type === 'scene') {
        // Switch to scenes tab and load the scene
        switchToTab('scenes');
        sceneEditor.loadScene(asset.id);
      }
    });
    
    // When entity is selected in scene editor, update properties and event editor
    window.addEventListener('entitySelected', (e) => {
      const { entity } = e.detail;
      propertiesPanel.setEntity(entity, e.detail.type);
      eventEditor.setEntity(entity);
    });
    
    // When property is changed, update scene editor
    window.addEventListener('propertyChanged', (e) => {
      const { entity, property } = e.detail;
      console.log('Property changed:', property, 'on', entity.name);
      sceneEditor.render();
    });
    
    // When user double-clicks an entity, show event editor
    window.addEventListener('editEntity', (e) => {
      const { entity } = e.detail;
      eventEditor.setEntity(entity);
      // Could open a modal or switch to events tab
      showEventEditorModal(eventEditor);
    });
  }
  
  function setupTabSwitching() {
    // Tab switching logic (reuse existing tab system)
    const tabs = document.querySelectorAll('.ttab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const panelName = tab.dataset.panel;
        switchToTab(panelName);
      });
    });
  }
  
  function switchToTab(panelName) {
    const tabs = document.querySelectorAll('.ttab');
    const panels = document.querySelectorAll('.panel');
    
    tabs.forEach(t => {
      if (t.dataset.panel === panelName) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });
    
    panels.forEach(p => {
      if (p.id === `panel-${panelName}`) {
        p.classList.add('active');
        p.style.display = '';
      } else {
        p.classList.remove('active');
        p.style.display = 'none';
      }
    });
  }
  
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S = Save project
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
      
      // Ctrl/Cmd + O = Open project
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        loadProject();
      }
      
      // Ctrl/Cmd + N = New project
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        newProject();
      }
      
      // Tab numbers 1-9 to switch tabs quickly
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const tabs = document.querySelectorAll('.ttab');
        if (tabs[index]) {
          tabs[index].click();
        }
      }
    });
  }
  
  function setupProjectPersistence(project) {
    // Auto-save to localStorage every 30 seconds
    setInterval(() => {
      try {
        localStorage.setItem('gbstudio_project', project.toJSON());
        console.log('💾 Project auto-saved');
      } catch(e) {
        console.warn('Failed to auto-save:', e);
      }
    }, 30000);
    
    // Load project on startup
    try {
      const saved = localStorage.getItem('gbstudio_project');
      if (saved) {
        project.fromJSON(saved);
        console.log('📂 Project loaded from localStorage');
        
        // Refresh all UIs
        if (window.gbAssetBrowser) window.gbAssetBrowser.refresh();
        if (window.gbSceneEditor) window.gbSceneEditor.render();
      }
    } catch(e) {
      console.warn('Failed to load project:', e);
    }
  }
  
  function showEventEditorModal(eventEditor) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    modal.innerHTML = `
      <div id="eventEditorContainer" style="
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 8px;
        width: 90%;
        max-width: 800px;
        height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <div style="padding:16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">
          <h3 style="margin:0;flex:1;color:var(--text);">⚡ Event Editor</h3>
          <button class="scene-tool-btn" id="closeEventEditor">✕ Close</button>
        </div>
        <div style="flex:1;overflow:auto;" id="eventEditorContent"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Re-render event editor into modal
    const oldContainer = eventEditor.container;
    eventEditor.container = document.getElementById('eventEditorContent');
    eventEditor.render();
    
    document.getElementById('closeEventEditor').addEventListener('click', () => {
      eventEditor.container = oldContainer;
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        eventEditor.container = oldContainer;
        document.body.removeChild(modal);
      }
    });
  }
  
  function saveProject() {
    const project = window.gbProject;
    if (!project) return;
    
    const json = project.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.gbsproj`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('💾 Project saved!');
  }
  
  function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gbsproj,.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const project = window.gbProject;
          project.fromJSON(evt.target.result);
          
          // Refresh all UIs
          if (window.gbAssetBrowser) window.gbAssetBrowser.refresh();
          if (window.gbSceneEditor) window.gbSceneEditor.render();
          
          console.log('📂 Project loaded!');
          alert('Project loaded successfully!');
        } catch(error) {
          console.error('Failed to load project:', error);
          alert('Failed to load project: ' + error.message);
        }
      };
      reader.readAsText(file);
    });
    
    input.click();
  }
  
  function newProject() {
    if (!confirm('Create a new project? Current progress will be lost unless saved.')) {
      return;
    }
    
    const name = prompt('Project name:', 'My Game');
    if (!name) return;
    
    const project = new GBStudio.ProjectModel();
    project.name = name;
    window.gbProject = project;
    
    // Reinitialize components
    initializeDemoContent(project);
    
    if (window.gbAssetBrowser) {
      window.gbAssetBrowser.project = project;
      window.gbAssetBrowser.refresh();
    }
    if (window.gbSceneEditor) {
      window.gbSceneEditor.project = project;
      window.gbSceneEditor.currentScene = null;
      window.gbSceneEditor.render();
    }
    
    console.log('📝 New project created:', name);
  }
  
  // Expose utility functions globally
  window.gbStudio = {
    saveProject,
    loadProject,
    newProject,
    switchToTab
  };

})();
