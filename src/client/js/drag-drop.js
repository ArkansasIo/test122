/* eslint-disable no-undef */
/* global window, document, FileReader */
/**
 * Drag and Drop Manager - File upload and asset management
 */
(function() {
  "use strict";

  const DragDropManager = {
    dropZones: [],
    
    init() {
      this.setupGlobalDragDrop();
      this.setupPanelDropZones();
    },
    
    setupGlobalDragDrop() {
      // Prevent default drag behaviors globally
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        }, false);
      });
      
      // Highlight on drag enter
      document.body.addEventListener('dragenter', (_e) => {
        this.showDropOverlay();
      }, false);
      
      // Remove highlight on drag leave
      document.body.addEventListener('dragleave', (e) => {
        if (e.target === document.body || e.target === this.dropOverlay) {
          this.hideDropOverlay();
        }
      }, false);
      
      // Handle drop
      document.body.addEventListener('drop', (e) => {
        this.hideDropOverlay();
        this.handleDrop(e);
      }, false);
    },
    
    setupPanelDropZones() {
      // Tiles panel - accept PNG images
      const tilesPanel = document.getElementById('panel-tiles');
      if (tilesPanel) {
        this.createDropZone(tilesPanel, {
          accept: ['.png', '.bmp', '.gif'],
          onDrop: (files) => this.handleTilesDrop(files),
          label: 'Drop PNG image files here to import tiles'
        });
      }
      
      // Maps panel - accept tilemap files
      const mapsPanel = document.getElementById('panel-maps');
      if (mapsPanel) {
        this.createDropZone(mapsPanel, {
          accept: ['.tilemap', '.map', '.bin'],
          onDrop: (files) => this.handleMapsDrop(files),
          label: 'Drop tilemap files here'
        });
      }
      
      // Source panel - accept C/H files
      const sourcePanel = document.getElementById('panel-source');
      if (sourcePanel) {
        this.createDropZone(sourcePanel, {
          accept: ['.c', '.h', '.cpp', '.hpp'],
          onDrop: (files) => this.handleSourceDrop(files),
          label: 'Drop C/H source files here'
        });
      }
    },
    
    createDropZone(element, options) {
      const dropZone = {
        element,
        accept: options.accept || [],
        onDrop: options.onDrop,
        label: options.label || 'Drop files here'
      };
      
      element.addEventListener('dragenter', (e) => {
        e.stopPropagation();
        element.classList.add('drag-over');
      });
      
      element.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        if (!element.contains(e.relatedTarget)) {
          element.classList.remove('drag-over');
        }
      });
      
      element.addEventListener('drop', (e) => {
        e.stopPropagation();
        element.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        const accepted = files.filter(file => {
          const ext = '.' + file.name.split('.').pop().toLowerCase();
          return dropZone.accept.length === 0 || dropZone.accept.includes(ext);
        });
        
        if (accepted.length > 0 && dropZone.onDrop) {
          dropZone.onDrop(accepted);
        } else if (accepted.length === 0 && files.length > 0) {
          if (window.NotificationManager) {
            window.NotificationManager.warning('File type not accepted for this panel');
          }
        }
      });
      
      this.dropZones.push(dropZone);
      
      // Add visual indicator
      if (!element.querySelector('.drop-zone-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'drop-zone-indicator';
        indicator.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 40px;
          background: var(--bg2);
          border: 2px dashed var(--border);
          border-radius: 12px;
          color: var(--text2);
          font-size: 14px;
          text-align: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 100;
        `;
        indicator.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 12px;">📁</div>
          <div>${dropZone.label}</div>
        `;
        element.style.position = 'relative';
        element.appendChild(indicator);
      }
      
      // Add CSS for drag-over state
      if (!document.getElementById('dragDropStyles')) {
        const style = document.createElement('style');
        style.id = 'dragDropStyles';
        style.textContent = `
          .drag-over {
            background: rgba(88, 166, 255, 0.05);
            outline: 2px dashed var(--accent);
            outline-offset: -8px;
          }
          .drag-over .drop-zone-indicator {
            opacity: 1 !important;
          }
        `;
        document.head.appendChild(style);
      }
    },
    
    handleDrop(e) {
      const files = Array.from(e.dataTransfer.files);
      
      if (files.length === 0) return;
      
      // Determine file types
      const images = files.filter(f => /\.(png|bmp|gif|jpg|jpeg)$/i.test(f.name));
      const code = files.filter(f => /\.(c|h|cpp|hpp|asm)$/i.test(f.name));
      const roms = files.filter(f => /\.(gb|gbc|gba|nds|n64|z64)$/i.test(f.name));
      const data = files.filter(f => /\.(tilemap|map|bin|chr)$/i.test(f.name));
      
      // Route to appropriate handler
      if (roms.length > 0) {
        this.handleROMDrop(roms[0]);
      } else if (images.length > 0) {
        this.handleImageDrop(images);
      } else if (code.length > 0) {
        this.handleSourceDrop(code);
      } else if (data.length > 0) {
        this.handleDataDrop(data);
      } else {
        if (window.NotificationManager) {
          window.NotificationManager.warning('Unknown file type(s)');
        }
      }
    },
    
    async handleROMDrop(file) {
      if (window.NotificationManager) {
        window.NotificationManager.info('Loading ROM: ' + file.name);
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target.result);
        if (typeof loadRomData === 'function') {
          loadRomData(arr);
        } else if (window.loadRomData) {
          window.loadRomData(arr);
        }
        
        // Switch to emulator panel
        const emuTab = document.querySelector('.ttab[data-panel="emulator"]');
        if (emuTab) emuTab.click();
      };
      reader.readAsArrayBuffer(file);
    },
    
    async handleTilesDrop(files) {
      for (const file of files) {
        await this.uploadTileImage(file);
      }
      
      // Reload tiles list
      if (typeof loadTiles === 'function') {
        loadTiles();
      }
      
      if (window.NotificationManager) {
        window.NotificationManager.success(`Imported ${files.length} tile image(s)`);
      }
    },
    
    async handleMapsDrop(files) {
      for (const file of files) {
        await this.uploadMapData(file);
      }
      
      // Reload maps list
      if (typeof loadMaps === 'function') {
        loadMaps();
      }
      
      if (window.NotificationManager) {
        window.NotificationManager.success(`Imported ${files.length} map file(s)`);
      }
    },
    
    async handleImageDrop(files) {
      // Default to tiles panel
      const tab = document.querySelector('.ttab[data-panel="tiles"]');
      if (tab) tab.click();
      
      await this.handleTilesDrop(files);
    },
    
    async handleSourceDrop(files) {
      const tab = document.querySelector('.ttab[data-panel="source"]');
      if (tab) tab.click();
      
      for (const file of files) {
        await this.uploadSourceFile(file);
      }
      
      // Reload source files list
      if (typeof loadSrcFiles === 'function') {
        loadSrcFiles();
      }
      
      if (window.NotificationManager) {
        window.NotificationManager.success(`Imported ${files.length} source file(s)`);
      }
    },
    
    async handleDataDrop(files) {
      // Route based on extension
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (['tilemap', 'map', 'bin'].includes(ext)) {
          await this.handleMapsDrop([file]);
        } else if (ext === 'chr') {
          await this.handleCHRDrop(file);
        }
      }
    },
    
    async handleCHRDrop(_file) {
      if (window.NotificationManager) {
        window.NotificationManager.info('CHR import not yet implemented');
      }
    },
    
    async uploadTileImage(file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const resp = await fetch('/api/upload-tile', {
          method: 'POST',
          body: formData
        });
        
        const result = await resp.json();
        return result.success;
      } catch(e) {
        console.error('Upload failed:', e);
        if (window.NotificationManager) {
          window.NotificationManager.error('Upload failed: ' + e.message);
        }
        return false;
      }
    },
    
    async uploadMapData(file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const resp = await fetch('/api/upload-map', {
          method: 'POST',
          body: formData
        });
        
        const result = await resp.json();
        return result.success;
      } catch(e) {
        console.error('Upload failed:', e);
        if (window.NotificationManager) {
          window.NotificationManager.error('Upload failed: ' + e.message);
        }
        return false;
      }
    },
    
    async uploadSourceFile(file) {
      try {
        const content = await file.text();
        
        const resp = await fetch('/api/upload-source', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, content })
        });
        
        const result = await resp.json();
        return result.success;
      } catch(e) {
        console.error('Upload failed:', e);
        if (window.NotificationManager) {
          window.NotificationManager.error('Upload failed: ' + e.message);
        }
        return false;
      }
    },
    
    showDropOverlay() {
      if (!this.dropOverlay) {
        this.dropOverlay = document.createElement('div');
        this.dropOverlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          pointer-events: none;
        `;
        this.dropOverlay.innerHTML = `
          <div style="
            background: var(--bg2);
            border: 3px dashed var(--accent);
            border-radius: 20px;
            padding: 60px;
            text-align: center;
            color: var(--text);
            font-size: 18px;
          ">
            <div style="font-size: 72px; margin-bottom: 20px;">📁</div>
            <div>Drop files here to import</div>
            <div style="font-size: 13px; color: var(--text2); margin-top: 12px;">
              Supported: ROM, PNG, C/H, Tilemap, CHR
            </div>
          </div>
        `;
        document.body.appendChild(this.dropOverlay);
      } else {
        this.dropOverlay.style.display = 'flex';
      }
    },
    
    hideDropOverlay() {
      if (this.dropOverlay) {
        this.dropOverlay.style.display = 'none';
      }
    }
  };
  
  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    DragDropManager.init();
    console.log('[DragDropManager] Initialized');
  });
  
  window.DragDropManager = DragDropManager;
  
})();
