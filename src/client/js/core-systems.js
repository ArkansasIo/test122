/* eslint-disable no-undef */
/* global window, document, localStorage, FileReader, navigator */
/**
 * Core Systems - Enhanced functionality for Enchantment Game Engine
 * This module provides: Project management, Undo/Redo, Clipboard, Search, etc.
 */
(function() {
  "use strict";

  // ============================================================================
  // PROJECT MANAGEMENT SYSTEM
  // ============================================================================
  
  const ProjectManager = {
    currentProject: null,
    recentProjects: [],
    maxRecent: 10,
    
    init() {
      this.loadRecentProjects();
      this.autoSaveInterval = null;
    },
    
    newProject(name, platform) {
      const project = {
        id: Date.now().toString(36),
        name: name || 'Untitled Project',
        platform: platform || 'gbc',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        assets: {
          tiles: [],
          maps: [],
          strings: {},
          tables: [],
          sprites: []
        },
        settings: {
          romSize: '512 KB',
          cartType: 'MBC5',
          sramSize: '32 KB',
          outputFile: name + '.gbc'
        },
        openFiles: []
      };
      
      this.currentProject = project;
      this.addToRecent(project);
      this.save();
      window.dispatchEvent(new CustomEvent('projectOpened', { detail: project }));
      return project;
    },
    
    openProject(data) {
      try {
        const project = typeof data === 'string' ? JSON.parse(data) : data;
        this.currentProject = project;
        this.addToRecent(project);
        window.dispatchEvent(new CustomEvent('projectOpened', { detail: project }));
        return project;
      } catch(e) {
        console.error('Failed to open project:', e);
        return null;
      }
    },
    
    save() {
      if (!this.currentProject) return false;
      this.currentProject.modified = new Date().toISOString();
      localStorage.setItem('currentProject', JSON.stringify(this.currentProject));
      return true;
    },
    
    export() {
      if (!this.currentProject) return null;
      const json = JSON.stringify(this.currentProject, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (this.currentProject.name || 'project') + '.egp';
      a.click();
      URL.revokeObjectURL(url);
      return json;
    },
    
    import(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        this.openProject(data);
      };
      reader.readAsText(file);
    },
    
    addToRecent(project) {
      const existing = this.recentProjects.findIndex(p => p.id === project.id);
      if (existing >= 0) this.recentProjects.splice(existing, 1);
      
      this.recentProjects.unshift({
        id: project.id,
        name: project.name,
        path: project.path || null,
        modified: project.modified
      });
      
      if (this.recentProjects.length > this.maxRecent) {
        this.recentProjects = this.recentProjects.slice(0, this.maxRecent);
      }
      
      localStorage.setItem('recentProjects', JSON.stringify(this.recentProjects));
    },
    
    loadRecentProjects() {
      const stored = localStorage.getItem('recentProjects');
      if (stored) {
        try {
          this.recentProjects = JSON.parse(stored);
        } catch(e) {
          this.recentProjects = [];
        }
      }
    },
    
    getRecentProjects() {
      return this.recentProjects;
    },
    
    enableAutoSave(intervalMs = 300000) { // 5 minutes default
      if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
      
      this.autoSaveInterval = setInterval(() => {
        if (this.currentProject) {
          this.save();
          console.log('[ProjectManager] Auto-saved at', new Date().toLocaleTimeString());
        }
      }, intervalMs);
    },
    
    disableAutoSave() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
      }
    }
  };
  
  // ============================================================================
  // UNDO/REDO HISTORY SYSTEM
  // ============================================================================
  
  const HistoryManager = {
    stacks: {}, // Separate history stacks per editor
    maxHistorySize: 100,
    
    init() {
      this.stacks = {
        tiles: { past: [], future: [] },
        maps: { past: [], future: [] },
        strings: { past: [], future: [] },
        tables: { past: [], future: [] },
        source: { past: [], future: [] }
      };
    },
    
    pushState(editor, state, description) {
      if (!this.stacks[editor]) {
        this.stacks[editor] = { past: [], future: [] };
      }
      
      const stack = this.stacks[editor];
      stack.past.push({
        state: JSON.parse(JSON.stringify(state)),
        description: description || 'Change',
        timestamp: Date.now()
      });
      
      if (stack.past.length > this.maxHistorySize) {
        stack.past.shift();
      }
      
      stack.future = []; // Clear redo stack when new action occurs
      window.dispatchEvent(new CustomEvent('historyChanged', { detail: { editor } }));
    },
    
    undo(editor) {
      const stack = this.stacks[editor];
      if (!stack || stack.past.length === 0) return null;
      
      const current = stack.past.pop();
      stack.future.push(current);
      
      const previousState = stack.past.length > 0 ? stack.past[stack.past.length - 1] : null;
      window.dispatchEvent(new CustomEvent('historyChanged', { detail: { editor } }));
      return previousState ? previousState.state : null;
    },
    
    redo(editor) {
      const stack = this.stacks[editor];
      if (!stack || stack.future.length === 0) return null;
      
      const nextState = stack.future.pop();
      stack.past.push(nextState);
      
      window.dispatchEvent(new CustomEvent('historyChanged', { detail: { editor } }));
      return nextState.state;
    },
    
    canUndo(editor) {
      const stack = this.stacks[editor];
      return stack && stack.past.length > 0;
    },
    
    canRedo(editor) {
      const stack = this.stacks[editor];
      return stack && stack.future.length > 0;
    },
    
    clear(editor) {
      if (editor) {
        this.stacks[editor] = { past: [], future: [] };
      } else {
        Object.keys(this.stacks).forEach(key => {
          this.stacks[key] = { past: [], future: [] };
        });
      }
    },
    
    getHistory(editor) {
      const stack = this.stacks[editor];
      if (!stack) return { past: [], future: [] };
      return {
        past: stack.past.map(s => ({ description: s.description, timestamp: s.timestamp })),
        future: stack.future.map(s => ({ description: s.description, timestamp: s.timestamp }))
      };
    }
  };
  
  // ============================================================================
  // CLIPBOARD SYSTEM
  // ============================================================================
  
  const ClipboardManager = {
    data: null,
    type: null,
    
    copy(data, type = 'text') {
      this.data = JSON.parse(JSON.stringify(data));
      this.type = type;
      
      // Try to use system clipboard for text
      if (type === 'text' && typeof data === 'string') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(data).catch(e => console.warn('Clipboard write failed:', e));
        }
      }
      
      window.dispatchEvent(new CustomEvent('clipboardChanged', { detail: { type, hasData: true } }));
      return true;
    },
    
    cut(data, type = 'text') {
      const result = this.copy(data, type);
      window.dispatchEvent(new CustomEvent('clipboardCut', { detail: { type } }));
      return result;
    },
    
    async paste() {
      // Try system clipboard first for text
      if (this.type === 'text' && navigator.clipboard && navigator.clipboard.readText) {
        try {
          const text = await navigator.clipboard.readText();
          if (text) return text;
        } catch(e) {
          console.warn('Clipboard read failed:', e);
        }
      }
      
      return this.data;
    },
    
    hasData() {
      return this.data !== null;
    },
    
    getType() {
      return this.type;
    },
    
    clear() {
      this.data = null;
      this.type = null;
      window.dispatchEvent(new CustomEvent('clipboardChanged', { detail: { type: null, hasData: false } }));
    }
  };
  
  // ============================================================================
  // SEARCH SYSTEM
  // ============================================================================
  
  const SearchManager = {
    currentQuery: '',
    currentResults: [],
    currentIndex: 0,
    caseSensitive: false,
    useRegex: false,
    
    search(query, scope = 'current', options = {}) {
      this.currentQuery = query;
      this.caseSensitive = options.caseSensitive || false;
      this.useRegex = options.useRegex || false;
      this.currentResults = [];
      this.currentIndex = 0;
      
      if (!query) return [];
      
      const editors = this._getSearchScope(scope);
      
      editors.forEach(editor => {
        const content = this._getEditorContent(editor);
        if (!content) return;
        
        const results = this._findMatches(content, query, editor);
        this.currentResults.push(...results);
      });
      
      window.dispatchEvent(new CustomEvent('searchCompleted', { 
        detail: { query, results: this.currentResults, scope } 
      }));
      
      return this.currentResults;
    },
    
    replace(query, replacement, scope = 'current') {
      const results = this.search(query, scope);
      let count = 0;
      
      results.forEach(result => {
        if (this._replaceMatch(result, replacement)) {
          count++;
        }
      });
      
      window.dispatchEvent(new CustomEvent('replaceCompleted', { 
        detail: { query, replacement, count } 
      }));
      
      return count;
    },
    
    replaceAll(query, replacement, scope = 'current') {
      return this.replace(query, replacement, scope);
    },
    
    next() {
      if (this.currentResults.length === 0) return null;
      
      this.currentIndex = (this.currentIndex + 1) % this.currentResults.length;
      const result = this.currentResults[this.currentIndex];
      this._highlightResult(result);
      return result;
    },
    
    previous() {
      if (this.currentResults.length === 0) return null;
      
      this.currentIndex = (this.currentIndex - 1 + this.currentResults.length) % this.currentResults.length;
      const result = this.currentResults[this.currentIndex];
      this._highlightResult(result);
      return result;
    },
    
    _getSearchScope(scope) {
      const activePanel = document.querySelector('.panel.active');
      if (!activePanel) return [];
      
      if (scope === 'current') {
        const editorId = activePanel.id.replace('panel-', '');
        return [editorId];
      } else if (scope === 'all') {
        return ['tiles', 'maps', 'strings', 'tables', 'source'];
      }
      
      return [scope];
    },
    
    _getEditorContent(editorId) {
      switch(editorId) {
        case 'strings':
          return document.getElementById('stringsEditor')?.value || '';
        case 'source':
          return document.getElementById('srcEditor')?.value || '';
        case 'tables':
          if (window.getTableCSV) return window.getTableCSV();
          return '';
        default:
          return '';
      }
    },
    
    _findMatches(content, query, editor) {
      const results = [];
      const lines = content.split('\n');
      
      let searchPattern;
      if (this.useRegex) {
        try {
          searchPattern = new RegExp(query, this.caseSensitive ? 'g' : 'gi');
        } catch(e) {
          console.warn('Invalid regex:', e);
          return results;
        }
      } else {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escapedQuery, this.caseSensitive ? 'g' : 'gi');
      }
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = searchPattern.exec(line)) !== null) {
          results.push({
            editor,
            line: lineIndex,
            column: match.index,
            text: match[0],
            context: line,
            length: match[0].length
          });
        }
      });
      
      return results;
    },
    
    _replaceMatch(result, replacement) {
      // Get editor element
      let editorEl = null;
      if (result.editor === 'strings') {
        editorEl = document.getElementById('stringsEditor');
      } else if (result.editor === 'source') {
        editorEl = document.getElementById('srcEditor');
      }
      
      if (!editorEl) return false;
      
      const content = editorEl.value;
      const lines = content.split('\n');
      
      if (result.line >= lines.length) return false;
      
      const line = lines[result.line];
      const before = line.substring(0, result.column);
      const after = line.substring(result.column + result.length);
      lines[result.line] = before + replacement + after;
      
      editorEl.value = lines.join('\n');
      return true;
    },
    
    _highlightResult(result) {
      // Switch to appropriate panel
      const tab = document.querySelector(`.ttab[data-panel="${result.editor}"]`);
      if (tab) tab.click();
      
      // Focus and select in editor
      let editorEl = null;
      if (result.editor === 'strings') {
        editorEl = document.getElementById('stringsEditor');
      } else if (result.editor === 'source') {
        editorEl = document.getElementById('srcEditor');
      }
      
      if (editorEl) {
        editorEl.focus();
        const content = editorEl.value;
        const lines = content.split('\n');
        let pos = 0;
        for (let i = 0; i < result.line; i++) {
          pos += lines[i].length + 1; // +1 for newline
        }
        pos += result.column;
        
        editorEl.setSelectionRange(pos, pos + result.length);
        editorEl.scrollTop = result.line * 20; // Rough estimate
      }
    }
  };
  
  // ============================================================================
  // KEYBOARD SHORTCUT SYSTEM
  // ============================================================================
  
  const KeyboardManager = {
    shortcuts: {},
    enabled: true,
    
    init() {
      this.registerDefaultShortcuts();
      document.addEventListener('keydown', (e) => this.handleKeydown(e));
    },
    
    registerDefaultShortcuts() {
      // File operations
      this.register('Ctrl+N', 'newProject');
      this.register('Ctrl+O', 'openProject');
      this.register('Ctrl+S', 'saveProject');
      this.register('Ctrl+Shift+S', 'saveAll');
      
      // Edit operations
      this.register('Ctrl+Z', 'undo');
      this.register('Ctrl+Y', 'redo');
      this.register('Ctrl+Shift+Z', 'redo');
      this.register('Ctrl+X', 'cut');
      this.register('Ctrl+C', 'copy');
      this.register('Ctrl+V', 'paste');
      this.register('Ctrl+A', 'selectAll');
      this.register('Ctrl+F', 'findReplace');
      this.register('Delete', 'delete');
      
      // View operations
      this.register('Ctrl+=', 'zoomIn');
      this.register('Ctrl+-', 'zoomOut');
      this.register('Ctrl+0', 'zoomReset');
      this.register('F11', 'toggleFullscreen');
      
      // Build operations
      this.register('Ctrl+Shift+A', 'buildAssets');
      this.register('Ctrl+Shift+R', 'buildRom');
      this.register('Ctrl+B', 'buildAll');
      
      // Navigation
      this.register('Ctrl+1', () => this.switchToPanel('emulator'));
      this.register('Ctrl+2', () => this.switchToPanel('tiles'));
      this.register('Ctrl+3', () => this.switchToPanel('maps'));
      this.register('Ctrl+4', () => this.switchToPanel('strings'));
      this.register('Ctrl+5', () => this.switchToPanel('tables'));
      this.register('Ctrl+6', () => this.switchToPanel('source'));
      this.register('Ctrl+7', () => this.switchToPanel('build'));
    },
    
    register(combo, action) {
      const key = this.normalizeCombo(combo);
      this.shortcuts[key] = action;
    },
    
    unregister(combo) {
      const key = this.normalizeCombo(combo);
      delete this.shortcuts[key];
    },
    
    normalizeCombo(combo) {
      return combo.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/command|cmd/g, 'ctrl')
        .replace(/option/g, 'alt');
    },
    
    handleKeydown(e) {
      if (!this.enabled) return;
      
      // Don't intercept if user is typing in an input/textarea
      const tag = e.target.tagName.toLowerCase();
      const isEditing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      
      const combo = this.getComboFromEvent(e);
      const action = this.shortcuts[combo];
      
      if (action) {
        // Check if this should be prevented while editing
        const allowInEditor = this.isAllowedInEditor(combo);
        
        if (!isEditing || allowInEditor) {
          e.preventDefault();
          
          if (typeof action === 'function') {
            action();
          } else if (typeof action === 'string') {
            if (window.handleMenuAction) {
              window.handleMenuAction(action);
            }
          }
        }
      }
    },
    
    getComboFromEvent(e) {
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');
      
      let key = e.key.toLowerCase();
      if (key === ' ') key = 'space';
      
      // Handle special keys
      if (!['ctrl', 'alt', 'shift', 'meta'].includes(key)) {
        parts.push(key);
      }
      
      return parts.join('+');
    },
    
    isAllowedInEditor(combo) {
      // These shortcuts should work even when editing
      const allowList = [
        'ctrl+s', 'ctrl+shift+s', 'ctrl+z', 'ctrl+y', 'ctrl+shift+z',
        'ctrl+f', 'ctrl+a', 'ctrl+x', 'ctrl+c', 'ctrl+v',
        'ctrl+b', 'ctrl+shift+b'
      ];
      return allowList.includes(combo);
    },
    
    switchToPanel(panelName) {
      const tab = document.querySelector(`.ttab[data-panel="${panelName}"]`);
      if (tab) tab.click();
    },
    
    enable() {
      this.enabled = true;
    },
    
    disable() {
      this.enabled = false;
    }
  };
  
  // ============================================================================
  // NOTIFICATION SYSTEM
  // ============================================================================
  
  const NotificationManager = {
    container: null,
    notifications: [],
    nextId: 1,
    
    init() {
      this.container = document.createElement('div');
      this.container.id = 'notificationContainer';
      this.container.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        z-index: 10000;
        width: 350px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    },
    
    show(message, type = 'info', duration = 3000) {
      const id = this.nextId++;
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.style.cssText = `
        background: var(--bg2);
        border: 1px solid var(--border);
        border-left: 4px solid var(--${this.getColor(type)});
        border-radius: 4px;
        padding: 12px 16px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        cursor: pointer;
      `;
      
      const icon = this.getIcon(type);
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">${icon}</span>
          <div style="flex: 1; color: var(--text); font-size: 13px;">${message}</div>
          <button onclick="this.closest('.notification').remove()" 
                  style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:18px;padding:0;line-height:1;">&times;</button>
        </div>
      `;
      
      this.container.appendChild(notification);
      
      // Trigger animation
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      }, 10);
      
      // Auto-remove
      if (duration > 0) {
        setTimeout(() => {
          this.remove(notification);
        }, duration);
      }
      
      notification.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
          this.remove(notification);
        }
      });
      
      return id;
    },
    
    remove(notification) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    },
    
    getColor(type) {
      const colors = {
        info: 'accent',
        success: 'green',
        warning: 'yellow',
        error: 'red'
      };
      return colors[type] || 'accent';
    },
    
    getIcon(type) {
      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      return icons[type] || 'ℹ️';
    },
    
    info(message, duration) {
      return this.show(message, 'info', duration);
    },
    
    success(message, duration) {
      return this.show(message, 'success', duration);
    },
    
    warning(message, duration) {
      return this.show(message, 'warning', duration);
    },
    
    error(message, duration) {
      return this.show(message, 'error', duration);
    }
  };
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  document.addEventListener('DOMContentLoaded', () => {
    ProjectManager.init();
    HistoryManager.init();
    KeyboardManager.init();
    NotificationManager.init();
    
    console.log('[CoreSystems] Initialized');
    
    // Enable auto-save (5 minutes)
    ProjectManager.enableAutoSave(300000);
    
    // Restore last project
    const saved = localStorage.getItem('currentProject');
    if (saved) {
      try {
        ProjectManager.openProject(saved);
      } catch(e) {
        console.warn('Failed to restore project:', e);
      }
    }
  });
  
  // Export to window for global access
  window.ProjectManager = ProjectManager;
  window.HistoryManager = HistoryManager;
  window.ClipboardManager = ClipboardManager;
  window.SearchManager = SearchManager;
  window.KeyboardManager = KeyboardManager;
  window.NotificationManager = NotificationManager;
  
})();
