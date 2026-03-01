/* eslint-disable no-undef */
/* global window, document, confirm */
/**
 * Context Menu System - Right-click menus for various elements
 */
(function() {
  "use strict";

  const ContextMenuManager = {
    currentMenu: null,
    
    init() {
      document.addEventListener('click', () => this.hide());
      document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
    },
    
    handleContextMenu(e) {
      // Find if click is on a specific element type
      const target = e.target;
      
      if (target.closest('.sidebar-item')) {
        e.preventDefault();
        const item = target.closest('.sidebar-item');
        const panel = target.closest('.panel');
        if (panel) {
          const panelType = panel.id.replace('panel-', '');
          this.showSidebarItemMenu(e, item, panelType);
        }
      } else if (target.closest('.ttab')) {
        e.preventDefault();
        this.showTabMenu(e, target.closest('.ttab'));
      } else if (target.closest('.otree-leaf, .otree-node')) {
        e.preventDefault();
        this.showOutlinerMenu(e, target.closest('.otree-leaf, .otree-node'));
      } else if (target.closest('.code-editor, #stringsEditor, #srcEditor, #tablesEditor')) {
        e.preventDefault();
        this.showEditorMenu(e, target);
      } else if (target.closest('#mapCanvas, #tileCanvas')) {
        e.preventDefault();
        this.showCanvasMenu(e, target);
      }
    },
    
    showSidebarItemMenu(e, item, panelType) {
      const itemName = item.textContent.trim();
      const menus = {
        tiles: [
          { label: 'Open', icon: '📂', action: () => item.click() },
          { label: 'Rename', icon: '✏️', action: () => this.renameItem(itemName, panelType) },
          { separator: true },
          { label: 'Export PNG', icon: '📥', action: () => this.exportItem(itemName, panelType, 'png') },
          { label: 'Export 2BPP', icon: '📥', action: () => this.exportItem(itemName, panelType, '2bpp') },
          { separator: true },
          { label: 'Delete', icon: '🗑️', action: () => this.deleteItem(itemName, panelType), danger: true }
        ],
        maps: [
          { label: 'Open', icon: '📂', action: () => item.click() },
          { label: 'Rename', icon: '✏️', action: () => this.renameItem(itemName, panelType) },
          { label: 'Duplicate', icon: '📋', action: () => this.duplicateItem(itemName, panelType) },
          { separator: true },
          { label: 'Export Binary', icon: '📥', action: () => this.exportItem(itemName, panelType, 'bin') },
          { label: 'Export C Array', icon: '📥', action: () => this.exportItem(itemName, panelType, 'c') },
          { separator: true },
          { label: 'Properties', icon: '⚙️', action: () => this.showProperties(itemName, panelType) },
          { separator: true },
          { label: 'Delete', icon: '🗑️', action: () => this.deleteItem(itemName, panelType), danger: true }
        ],
        source: [
          { label: 'Open', icon: '📂', action: () => item.click() },
          { label: 'Rename', icon: '✏️', action: () => this.renameItem(itemName, panelType) },
          { label: 'Duplicate', icon: '📋', action: () => this.duplicateItem(itemName, panelType) },
          { separator: true },
          { label: 'Compile This File', icon: '🔨', action: () => this.compileFile(itemName) },
          { separator: true },
          { label: 'Open in External Editor', icon: '💻', action: () => this.openExternal(itemName) },
          { separator: true },
          { label: 'Delete', icon: '🗑️', action: () => this.deleteItem(itemName, panelType), danger: true }
        ]
      };
      
      const menuItems = menus[panelType] || [
        { label: 'Open', icon: '📂', action: () => item.click() },
        { label: 'Properties', icon: '⚙️', action: () => this.showProperties(itemName, panelType) }
      ];
      
      this.show(e.clientX, e.clientY, menuItems);
    },
    
    showTabMenu(e, tab) {
      const panelName = tab.dataset.panel;
      const menuItems = [
        { label: 'Close', icon: '✖️', action: () => {} },
        { label: 'Close Others', icon: '✖️', action: () => {} },
        { separator: true },
        { label: 'Reload Panel', icon: '🔄', action: () => this.reloadPanel(panelName) },
        { separator: true },
        { label: 'Float Panel', icon: '🪟', action: () => this.floatPanel(panelName) }
      ];
      
      this.show(e.clientX, e.clientY, menuItems);
    },
    
    showOutlinerMenu(e, node) {
      const isNode = node.classList.contains('otree-node');
      const menuItems = [
        { label: 'Select', icon: '✓', action: () => node.classList.toggle('selected') },
        { label: 'Rename', icon: '✏️', action: () => {} },
        { separator: true },
        { label: 'Duplicate', icon: '📋', action: () => {} },
        { label: 'Delete', icon: '🗑️', action: () => {}, danger: true },
        { separator: true },
        { label: 'Add Child', icon: '➕', action: () => {}, disabled: !isNode },
        { separator: true },
        { label: 'Copy Name', icon: '📋', action: () => {
          const text = node.textContent.trim();
          if (window.ClipboardManager) {
            window.ClipboardManager.copy(text, 'text');
          }
        }},
        { label: 'Properties', icon: '⚙️', action: () => {} }
      ];
      
      this.show(e.clientX, e.clientY, menuItems);
    },
    
    showEditorMenu(e, editor) {
      const hasSelection = editor.selectionStart !== editor.selectionEnd;
      const selectedText = hasSelection ? editor.value.substring(editor.selectionStart, editor.selectionEnd) : '';
      
      const menuItems = [
        { label: 'Cut', icon: '✂️', action: () => {
          if (window.ClipboardManager && hasSelection) {
            window.ClipboardManager.cut(selectedText);
            document.execCommand('cut');
          }
        }, disabled: !hasSelection },
        { label: 'Copy', icon: '📋', action: () => {
          if (window.ClipboardManager && hasSelection) {
            window.ClipboardManager.copy(selectedText);
          }
          document.execCommand('copy');
        }, disabled: !hasSelection },
        { label: 'Paste', icon: '📌', action: async () => {
          if (window.ClipboardManager) {
            const text = await window.ClipboardManager.paste();
            if (text) document.execCommand('insertText', false, text);
          }
        }},
        { separator: true },
        { label: 'Select All', icon: '▢', action: () => {
          editor.select();
        }},
        { separator: true },
        { label: 'Find...', icon: '🔍', action: () => {
          if (window.handleMenuAction) window.handleMenuAction('findReplace');
        }},
        { label: 'Replace...', icon: '🔄', action: () => {
          if (window.handleMenuAction) window.handleMenuAction('findReplace');
        }},
        { separator: true },
        { label: 'Comment Selection', icon: '💬', action: () => this.commentSelection(editor), disabled: !hasSelection },
        { label: 'Uncomment Selection', icon: '💬', action: () => this.uncommentSelection(editor), disabled: !hasSelection },
        { separator: true },
        { label: 'Format Document', icon: '✨', action: () => this.formatDocument(editor) }
      ];
      
      this.show(e.clientX, e.clientY, menuItems);
    },
    
    showCanvasMenu(e, canvas) {
      const isMap = canvas.id === 'mapCanvas';
      
      const menuItems = [
        { label: 'Zoom In', icon: '🔍', action: () => this.zoomCanvas(canvas, 1.25) },
        { label: 'Zoom Out', icon: '🔍', action: () => this.zoomCanvas(canvas, 0.8) },
        { label: 'Reset Zoom', icon: '🔍', action: () => this.resetZoomCanvas(canvas) },
        { separator: true },
        { label: 'Export as PNG', icon: '📥', action: () => this.exportCanvas(canvas, 'png') },
        { separator: true },
        { label: 'Show Grid', icon: '⊞', action: () => {}, checked: true },
        { label: 'Show Guides', icon: '┃', action: () => {} }
      ];
      
      if (isMap) {
        menuItems.push(
          { separator: true },
          { label: 'Fill Tool', icon: '🪣', action: () => {} },
          { label: 'Eyedropper', icon: '💧', action: () => {} }
        );
      }
      
      this.show(e.clientX, e.clientY, menuItems);
    },
    
    show(x, y, items) {
      this.hide(); // Hide any existing menu
      
      const menu = document.createElement('div');
      menu.className = 'context-menu';
      menu.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: var(--bg2);
        border: 1px solid var(--border);
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        padding: 4px 0;
        min-width: 180px;
        z-index: 10000;
        animation: contextMenuFadeIn 0.15s ease;
      `;
      
      items.forEach(item => {
        if (item.separator) {
          const sep = document.createElement('div');
          sep.style.cssText = 'height: 1px; background: var(--border); margin: 4px 8px;';
          menu.appendChild(sep);
        } else {
          const menuItem = document.createElement('div');
          menuItem.className = 'context-menu-item';
          const disabled = item.disabled || false;
          const danger = item.danger || false;
          
          menuItem.style.cssText = `
            padding: 8px 16px;
            cursor: ${disabled ? 'not-allowed' : 'pointer'};
            display: flex;
            align-items: center;
            gap: 10px;
            color: ${danger ? 'var(--red)' : disabled ? 'var(--text2)' : 'var(--text)'};
            font-size: 13px;
            opacity: ${disabled ? '0.5' : '1'};
          `;
          
          if (!disabled) {
            menuItem.addEventListener('mouseenter', () => {
              menuItem.style.background = 'var(--bg3)';
            });
            menuItem.addEventListener('mouseleave', () => {
              menuItem.style.background = 'transparent';
            });
            menuItem.addEventListener('click', () => {
              if (item.action) item.action();
              this.hide();
            });
          }
          
          const icon = item.icon ? `<span style="font-size:14px;">${item.icon}</span>` : '';
          const checked = item.checked ? '<span style="margin-left:auto;">✓</span>' : '';
          menuItem.innerHTML = `${icon}<span style="flex:1;">${item.label}</span>${checked}`;
          
          menu.appendChild(menuItem);
        }
      });
      
      document.body.appendChild(menu);
      this.currentMenu = menu;
      
      // Adjust position if menu would go off screen
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menu.style.left = (x - rect.width) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        menu.style.top = (y - rect.height) + 'px';
      }
      
      // Add animation keyframe if not exists
      if (!document.getElementById('contextMenuAnimation')) {
        const style = document.createElement('style');
        style.id = 'contextMenuAnimation';
        style.textContent = `
          @keyframes contextMenuFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    },
    
    hide() {
      if (this.currentMenu) {
        this.currentMenu.remove();
        this.currentMenu = null;
      }
    },
    
    // Helper methods
    renameItem(name, type) {
      if (window.openModal) {
        window.openModal('Rename ' + type, `
          <div class="form-group">
            <label>New name:</label>
            <input type="text" id="renameInput" value="${name}" style="width:100%;">
          </div>
          <div style="text-align:right;margin-top:16px;">
            <button class="btn" onclick="closeModal()">Cancel</button>
            <button class="save-btn" onclick="window.NotificationManager.info('Rename not yet implemented');closeModal();">Rename</button>
          </div>
        `);
        setTimeout(() => document.getElementById('renameInput')?.select(), 100);
      }
    },
    
    deleteItem(name, _type) {
      if (confirm(`Delete ${name}? This cannot be undone.`)) {
        if (window.NotificationManager) {
          window.NotificationManager.warning('Delete functionality not yet implemented');
        }
      }
    },
    
    duplicateItem(_name, _type) {
      if (window.NotificationManager) {
        window.NotificationManager.info('Duplicate functionality not yet implemented');
      }
    },
    
    exportItem(name, type, format) {
      if (window.NotificationManager) {
        window.NotificationManager.info(`Export to ${format.toUpperCase()} not yet implemented`);
      }
    },
    
    showProperties(name, type) {
      if (window.openModal) {
        window.openModal(name + ' Properties', `
          <div class="form-group">
            <label>Name:</label>
            <input type="text" value="${name}" readonly>
          </div>
          <div class="form-group">
            <label>Type:</label>
            <input type="text" value="${type}" readonly>
          </div>
          <div class="form-group">
            <label>Created:</label>
            <input type="text" value="${new Date().toLocaleString()}" readonly>
          </div>
          <div style="text-align:right;margin-top:16px;">
            <button class="save-btn" onclick="closeModal()">Close</button>
          </div>
        `);
      }
    },
    
    compileFile(name) {
      if (window.NotificationManager) {
        window.NotificationManager.info('Compiling ' + name + '...');
      }
    },
    
    openExternal(_name) {
      if (window.NotificationManager) {
        window.NotificationManager.warning('External editor not configured');
      }
    },
    
    reloadPanel(name) {
      const tab = document.querySelector(`.ttab[data-panel="${name}"]`);
      if (tab) {
        tab.click();
        setTimeout(() => tab.click(), 10);
      }
    },
    
    floatPanel(_name) {
      if (window.NotificationManager) {
        window.NotificationManager.info('Floating panels not yet implemented');
      }
    },
    
    commentSelection(editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = editor.value;
      const selected = text.substring(start, end);
      const lines = selected.split('\n');
      const commented = lines.map(line => '// ' + line).join('\n');
      
      editor.value = text.substring(0, start) + commented + text.substring(end);
      editor.setSelectionRange(start, start + commented.length);
      
      if (window.NotificationManager) {
        window.NotificationManager.success('Lines commented');
      }
    },
    
    uncommentSelection(editor) {
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const text = editor.value;
      const selected = text.substring(start, end);
      const lines = selected.split('\n');
      const uncommented = lines.map(line => line.replace(/^\/\/\s?/, '')).join('\n');
      
      editor.value = text.substring(0, start) + uncommented + text.substring(end);
      editor.setSelectionRange(start, start + uncommented.length);
      
      if (window.NotificationManager) {
        window.NotificationManager.success('Lines uncommented');
      }
    },
    
    formatDocument(_editor) {
      if (window.NotificationManager) {
        window.NotificationManager.info('Auto-formatting not yet implemented');
      }
    },
    
    zoomCanvas(canvas, factor) {
      const currentWidth = canvas.style.width || canvas.width + 'px';
      const currentPx = parseInt(currentWidth);
      canvas.style.width = (currentPx * factor) + 'px';
      canvas.style.height = (parseInt(canvas.style.height || canvas.height) * factor) + 'px';
    },
    
    resetZoomCanvas(canvas) {
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
    },
    
    exportCanvas(canvas, format) {
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = canvas.id + '.' + format;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };
  
  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    ContextMenuManager.init();
    console.log('[ContextMenuManager] Initialized');
  });
  
  window.ContextMenuManager = ContextMenuManager;
  
})();
