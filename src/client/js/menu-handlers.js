/* eslint-disable no-undef */
/* global window, document */
/**
 * Enhanced Menu Action Handlers - Integrates with core systems
 */
(function() {
  "use strict";

  // Override/extend the existing handleMenuAction function
  const originalHandleMenuAction = window.handleMenuAction;
  
  window.handleMenuAction = function(action) {
    // Handle actions that require new core systems
    switch(action) {
      // ===== FILE OPERATIONS =====
      case 'newProject':
        if (window.ProjectManager) {
          window.openModal('New Project', `
            <div class="form-group">
              <label>Project Name</label>
              <input type="text" id="projNameInput" value="My RPG Game" style="width:100%;">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Platform</label>
                <select id="projPlatformInput">
                  <option value="gbc">Game Boy Color</option>
                  <option value="gb">Game Boy (DMG)</option>
                  <option value="gba">Game Boy Advance</option>
                  <option value="nds">Nintendo DS</option>
                  <option value="n64">Nintendo 64</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Template</label>
              <select id="projTemplateInput">
                <option value="blank">Blank Project</option>
                <option value="rpg">RPG Starter (turn-based)</option>
                <option value="action">Action RPG</option>
                <option value="platformer">Platformer</option>
                <option value="adventure">Adventure Game</option>
              </select>
            </div>
            <div style="text-align:right;margin-top:16px;">
              <button class="btn" onclick="closeModal()">Cancel</button>
              <button class="save-btn" onclick="window._createNewProject()">Create</button>
            </div>
          `);
          
          window._createNewProject = function() {
            const name = document.getElementById('projNameInput').value;
            const platform = document.getElementById('projPlatformInput').value;
            window.ProjectManager.newProject(name, platform);
            
            window.NotificationManager.success('Project created: ' + name);
            window.closeModal();
          };
        }
        return;
        
      case 'openProject':
        if (window.ProjectManager) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.egp,.json';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              window.ProjectManager.import(file);
              window.NotificationManager.success('Project opened: ' + file.name);
            }
          };
          input.click();
        }
        return;
        
      case 'saveProject':
        if (window.ProjectManager) {
          const saved = window.ProjectManager.save();
          if (saved) {
            window.NotificationManager.success('Project saved');
          } else {
            window.NotificationManager.warning('No project to save');
          }
        }
        return;
        
      case 'saveAll':
        if (window.ProjectManager) {
          window.ProjectManager.save();
          
          // Save all open editors
          const promises = [];
          const stringsEditor = document.getElementById('stringsEditor');
          const srcEditor = document.getElementById('srcEditor');
          
          if (stringsEditor && stringsEditor.value) {
            promises.push(
              fetch('/api/strings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: stringsEditor.value })
              })
            );
          }
          
          if (window.getTableCSV) {
            promises.push(
              fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: window.getTableCSV() })
              })
            );
          }
          
          if (srcEditor && window.currentSrcFile) {
            promises.push(
              fetch('/api/src-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  name: window.currentSrcFile,
                  content: srcEditor.value 
                })
              })
            );
          }
          
          Promise.all(promises)
            .then(() => window.NotificationManager.success('All files saved'))
            .catch(e => window.NotificationManager.error('Save failed: ' + e.message));
        }
        return;
        
      // ===== EDIT OPERATIONS =====
      case 'undo':
        if (window.HistoryManager) {
          const activePanel = document.querySelector('.panel.active');
          if (activePanel) {
            const editorType = activePanel.id.replace('panel-', '');
            const state = window.HistoryManager.undo(editorType);
            if (state) {
              // Restore state based on editor type
              window.NotificationManager.info('Undo');
            } else {
              window.NotificationManager.warning('Nothing to undo');
            }
          }
        }
        return;
        
      case 'redo':
        if (window.HistoryManager) {
          const activePanel = document.querySelector('.panel.active');
          if (activePanel) {
            const editorType = activePanel.id.replace('panel-', '');
            const state = window.HistoryManager.redo(editorType);
            if (state) {
              window.NotificationManager.info('Redo');
            } else {
              window.NotificationManager.warning('Nothing to redo');
            }
          }
        }
        return;
        
      case 'cut': {
        const cutTarget = document.activeElement;
        if (cutTarget && (cutTarget.tagName === 'TEXTAREA' || cutTarget.tagName === 'INPUT')) {
          const selectedText = cutTarget.value.substring(cutTarget.selectionStart, cutTarget.selectionEnd);
          if (selectedText && window.ClipboardManager) {
            window.ClipboardManager.cut(selectedText);
          }
          document.execCommand('cut');
        }
        return;
      }
        
      case 'copy': {
        const copyTarget = document.activeElement;
        if (copyTarget && (copyTarget.tagName === 'TEXTAREA' || copyTarget.tagName === 'INPUT')) {
          const selectedText = copyTarget.value.substring(copyTarget.selectionStart, copyTarget.selectionEnd);
          if (selectedText && window.ClipboardManager) {
            window.ClipboardManager.copy(selectedText);
          }
          document.execCommand('copy');
        }
        return;
      }
        
      case 'paste': {
        const pasteTarget = document.activeElement;
        if (pasteTarget && (pasteTarget.tagName === 'TEXTAREA' || pasteTarget.tagName === 'INPUT') && window.ClipboardManager) {
          window.ClipboardManager.paste().then(text => {
            if (text) {
              const start = pasteTarget.selectionStart;
              const end = pasteTarget.selectionEnd;
              const value = pasteTarget.value;
              pasteTarget.value = value.substring(0, start) + text + value.substring(end);
              pasteTarget.selectionStart = pasteTarget.selectionEnd = start + text.length;
            }
          });
        }
        return;
      }
        
      case 'delete': {
        const deleteTarget = document.activeElement;
        if (deleteTarget && (deleteTarget.tagName === 'TEXTAREA' || deleteTarget.tagName === 'INPUT')) {
          const start = deleteTarget.selectionStart;
          const end = deleteTarget.selectionEnd;
          if (start !== end) {
            const value = deleteTarget.value;
            deleteTarget.value = value.substring(0, start) + value.substring(end);
            deleteTarget.selectionStart = deleteTarget.selectionEnd = start;
          }
        }
        return;
      }
        
      case 'selectAll': {
        const selectTarget = document.activeElement;
        if (selectTarget && (selectTarget.tagName === 'TEXTAREA' || selectTarget.tagName === 'INPUT')) {
          selectTarget.select();
        }
        return;
      }
        
      case 'findReplace': {
        if (window.SearchManager) {
          window.openModal('Find & Replace', `
            <div class="form-group">
              <label>Find</label>
              <input type="text" id="searchQueryInput" style="width:100%;" placeholder="Search text...">
            </div>
            <div class="form-group">
              <label>Replace with</label>
              <input type="text" id="replaceQueryInput" style="width:100%;" placeholder="Replacement text...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Scope</label>
                <select id="searchScopeInput">
                  <option value="current">Current File</option>
                  <option value="strings">Strings</option>
                  <option value="source">Source Code</option>
                  <option value="all">All Files</option>
                </select>
              </div>
            </div>
            <div class="form-group" style="font-size:12px;">
              <label style="cursor:pointer;">
                <input type="checkbox" id="searchCaseSensitive"> Case sensitive
              </label>
              <br>
              <label style="cursor:pointer;">
                <input type="checkbox" id="searchRegex"> Use regex
              </label>
            </div>
            <div id="searchResults" style="margin-top:12px;max-height:200px;overflow:auto;"></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
              <button class="btn" onclick="closeModal()">Cancel</button>
              <button class="btn" onclick="window._doSearch()">Find</button>
              <button class="btn" onclick="window._doReplace()">Replace</button>
              <button class="save-btn" onclick="window._doReplaceAll()">Replace All</button>
            </div>
          `);
          
          window._doSearch = function() {
            const query = document.getElementById('searchQueryInput').value;
            const scope = document.getElementById('searchScopeInput').value;
            const caseSensitive = document.getElementById('searchCaseSensitive').checked;
            const useRegex = document.getElementById('searchRegex').checked;
            
            const results = window.SearchManager.search(query, scope, { caseSensitive, useRegex });
            
            const resultsDiv = document.getElementById('searchResults');
            if (results.length === 0) {
              resultsDiv.innerHTML = '<div style="color:var(--text2);padding:8px;">No matches found</div>';
            } else {
              resultsDiv.innerHTML = `
                <div style="color:var(--text2);padding:4px;font-size:11px;">
                  Found ${results.length} match(es)
                </div>
                ${results.slice(0, 20).map((r, i) => `
                  <div style="padding:4px;cursor:pointer;font-size:11px;font-family:monospace;border-bottom:1px solid var(--border);"
                       onmouseenter="this.style.background='var(--bg3)'"
                       onmouseleave="this.style.background=''"
                       onclick="window.SearchManager.currentIndex=${i};window.SearchManager._highlightResult(window.SearchManager.currentResults[${i}])">
                    <strong>${r.editor}</strong>:${r.line+1}:${r.column+1} - ${r.context.substring(0, 60)}${r.context.length > 60 ? '...' : ''}
                  </div>
                `).join('')}
                ${results.length > 20 ? '<div style="padding:4px;color:var(--text2);font-size:11px;">... and ' + (results.length - 20) + ' more</div>' : ''}
              `;
            }
          };
          
          window._doReplace = function() {
            const replacement = document.getElementById('replaceQueryInput').value;
            
            if (window.SearchManager.currentResults.length > 0) {
              const current = window.SearchManager.currentResults[window.SearchManager.currentIndex || 0];
              window.SearchManager._replaceMatch(current, replacement);
              window.NotificationManager.success('Replaced 1 occurrence');
              window._doSearch(); // Refresh results
            }
          };
          
          window._doReplaceAll = function() {
            const query = document.getElementById('searchQueryInput').value;
            const replacement = document.getElementById('replaceQueryInput').value;
            const scope = document.getElementById('searchScopeInput').value;
            
            const count = window.SearchManager.replaceAll(query, replacement, scope);
            window.NotificationManager.success(`Replaced ${count} occurrence(s)`);
            window.closeModal();
          };
        }
        return;
      }
        
      // ===== VIEW OPERATIONS =====
      case 'zoomIn':
        document.body.style.zoom = (parseFloat(document.body.style.zoom || 1) + 0.1).toFixed(1);
        window.NotificationManager.info('Zoom: ' + (parseFloat(document.body.style.zoom) * 100).toFixed(0) + '%');
        return;
        
      case 'zoomOut':
        document.body.style.zoom = Math.max(0.5, parseFloat(document.body.style.zoom || 1) - 0.1).toFixed(1);
        window.NotificationManager.info('Zoom: ' + (parseFloat(document.body.style.zoom) * 100).toFixed(0) + '%');
        return;
        
      case 'zoomReset':
        document.body.style.zoom = 1;
        window.NotificationManager.info('Zoom: 100%');
        return;
        
      case 'toggleSidebar': {
        const sidebars = document.querySelectorAll('.sidebar');
        sidebars.forEach(sb => {
          sb.style.display = sb.style.display === 'none' ? '' : 'none';
        });
        return;
      }
        
      // ===== BUILD OPERATIONS =====
      case 'cleanBuild':
        if (window.triggerBuild) {
          window.NotificationManager.info('Cleaning build...');
          fetch('/api/build', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: 'clean' })
          })
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              window.NotificationManager.success('Build cleaned');
            } else {
              window.NotificationManager.error('Clean failed');
            }
          });
        }
        return;
        
      // ===== TARGET PLATFORM =====
      case 'target:gb':
      case 'target:gbc':
      case 'target:gba':
      case 'target:nds':
      case 'target:n64':
      case 'target:switch':
      case 'target:switch2':
      case 'target:ps1':
      case 'target:ps2':
      case 'target:ps3':
      case 'target:ps4':
      case 'target:ps5':
      case 'target:xbox':
      case 'target:xbox360':
      case 'target:xboxone':
      case 'target:xboxsx':
      case 'target:windows':
      case 'target:macos':
      case 'target:linux':
      case 'target:ios':
      case 'target:android': {
        const targetId = action.split(':')[1];
        if (window.PlatformConfig && window.PlatformConfig.platforms[targetId]) {
          window.PlatformConfig.set(targetId);
          const platform = window.PlatformConfig.get();
          window.NotificationManager.success('Target platform: ' + platform.name);
          localStorage.setItem('targetPlatform', targetId);
          window.dispatchEvent(new Event('platformChanged'));
        }
        return;
      }
    }
    
    // Fall back to original handler
    if (originalHandleMenuAction) {
      originalHandleMenuAction(action);
    }
  };
  
  console.log('[MenuHandlers] Enhanced menu actions loaded');
  
})();
