# 🔌 Complete API Integration Guide

**Version**: 2.0  
**Date**: March 1, 2026  
**Audience**: Developers, Plugin Creators, Tool Builders

---

## Table of Contents
1. [ProjectManager API](#projectmanager-api)
2. [HistoryManager API](#historymanager-api)
3. [ClipboardManager API](#clipboardmanager-api)
4. [SearchManager API](#searchmanager-api)
5. [KeyboardManager API](#keyboardmanager-api)
6. [NotificationManager API](#notificationmanager-api)
7. [Integration Examples](#integration-examples)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## ProjectManager API

### Overview
ProjectManager handles project creation, loading, saving, exporting, and metadata tracking.

### Methods

#### `ProjectManager.init()`
Initializes the project manager on page load.
```javascript
window.ProjectManager.init();
// Called automatically on page load
```

#### `ProjectManager.newProject(name, platform)`
Creates a new project.
```javascript
// Parameters:
// - name (string): Project name (1-50 chars)
// - platform (string): 'gb', 'gbc', 'gba', 'nds', 'n64', etc.

const project = window.ProjectManager.newProject('My RPG', 'gbc');

// Returns: Project object
// {
//   id: 'proj_xyz123',
//   name: 'My RPG',
//   platform: 'gbc',
//   created: timestamp,
//   modified: timestamp,
//   assets: { tiles: [], maps: [], strings: [], tables: [], source: [] },
//   settings: {}
// }

// Event fired: 'projectCreated'
document.addEventListener('projectCreated', (e) => {
  console.log('New project:', e.detail.project.name);
});
```

#### `ProjectManager.save()`
Saves the current project to localStorage.
```javascript
const success = window.ProjectManager.save();

if (success) {
  console.log('Project saved');
} else {
  console.error('Save failed');
}

// Event fired: 'projectSaved'
document.addEventListener('projectSaved', (e) => {
  console.log('Saved at:', e.detail.timestamp);
});
```

#### `ProjectManager.export()`
Exports project as .egp (Enchantment Game Project) file and triggers download.
```javascript
const jsonString = window.ProjectManager.export();

// Returns: Stringified JSON
// File is automatically downloaded as project_name.egp

// Event fired: 'projectExported'
document.addEventListener('projectExported', (e) => {
  console.log('Exported:', e.detail.filename);
});
```

#### `ProjectManager.import(file)`
Imports previously exported .egp file.
```javascript
// Use in file input handler
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  window.ProjectManager.import(file);
});

// Event fired: 'projectImported'
document.addEventListener('projectImported', (e) => {
  console.log('Imported project:', e.detail.project.name);
});
```

#### `ProjectManager.openProject(data)`
Opens an existing project by name or ID.
```javascript
// Load by name
window.ProjectManager.openProject('My RPG');

// Or load from exported data
window.ProjectManager.openProject(projectData);
```

#### `ProjectManager.enableAutoSave(intervalMs)`
Enables automatic saving at specified interval.
```javascript
// Auto-save every 5 minutes (300,000 ms)
window.ProjectManager.enableAutoSave(300000);

// Default: 5 minutes
// Minimum: 60000 ms (1 minute)
// Maximum: 3600000 ms (1 hour)

// Event fired: 'autoSaveTick' every save
document.addEventListener('autoSaveTick', (e) => {
  console.log('Auto-saved at:', e.detail.timestamp);
});
```

#### `ProjectManager.disableAutoSave()`
Stops automatic saving.
```javascript
window.ProjectManager.disableAutoSave();

// Event fired: 'autoSaveDisabled'
```

#### `ProjectManager.addAsset(type, assetData)`
Adds asset to current project.
```javascript
// Types: 'tiles', 'maps', 'strings', 'tables', 'source'

window.ProjectManager.addAsset('tiles', {
  name: 'hero.png',
  width: 8,
  height: 8,
  data: imageData,
  format: '2BPP'
});

// Event fired: 'assetAdded'
document.addEventListener('assetAdded', (e) => {
  console.log('Added:', e.detail.asset.name);
});
```

#### `ProjectManager.getRecentProjects(limit)`
Returns list of recently accessed projects.
```javascript
const recent = window.ProjectManager.getRecentProjects(5);

// Returns array of {name, platform, timestamp, id}
// Example:
// [
//   {name: 'Current Project', platform: 'gbc', timestamp: 1709305200000, id: 'proj_1'},
//   {name: 'Previous Project', platform: 'gba', timestamp: 1709218800000, id: 'proj_2'}
// ]

// Default limit: 10
// Maximum: 20
```

#### `ProjectManager.getProject(id)`
Gets project by ID.
```javascript
const proj = window.ProjectManager.getProject('proj_1');

if (proj) {
  console.log('Project:', proj.name);
} else {
  console.log('Not found');
}
```

#### `ProjectManager.deleteProject(id)`
Deletes a project.
```javascript
const deleted = window.ProjectManager.deleteProject('proj_xyz');

if (deleted) {
  console.log('Project deleted');
}

// Event fired: 'projectDeleted'
document.addEventListener('projectDeleted', (e) => {
  console.log('Deleted:', e.detail.projectId);
});
```

---

## HistoryManager API

### Overview
HistoryManager maintains undo/redo stacks for each editor (tiles, maps, strings, tables, source).

### Methods

#### `HistoryManager.init()`
Initializes history system.
```javascript
window.HistoryManager.init();
// Called automatically on page load
```

#### `HistoryManager.pushState(editor, state, description)`
Pushes a new state onto the history stack.
```javascript
// Parameters:
// - editor (string): 'tiles', 'maps', 'strings', 'tables', 'source'
// - state (any): The state object (snapshot)
// - description (string): Human-readable description (optional)

const currentState = document.getElementById('stringsEditor').value;

window.HistoryManager.pushState('strings', 
  { content: currentState }, 
  'Edit dialogue line 42'
);

// Each editor maintains independent history (max 100 states)
// Pushing resets future stack (redo becomes unavailable)

// Event fired: 'statePushed'
document.addEventListener('statePushed', (e) => {
  console.log('State pushed for:', e.detail.editor);
});
```

#### `HistoryManager.undo(editor)`
Undoes last action for specific editor.
```javascript
const previousState = window.HistoryManager.undo('strings');

if (previousState) {
  // Apply previous state
  document.getElementById('stringsEditor').value = previousState.content;
} else {
  // Nothing to undo
  console.log('No undo available');
}

// Event fired: 'stateUndone'
document.addEventListener('stateUndone', (e) => {
  console.log('Undone in:', e.detail.editor);
});
```

#### `HistoryManager.redo(editor)`
Redoes last undone action.
```javascript
const redoneState = window.HistoryManager.redo('strings');

if (redoneState) {
  document.getElementById('stringsEditor').value = redoneState.content;
} else {
  console.log('Nothing to redo');
}

// Event fired: 'stateRedone'
document.addEventListener('stateRedone', (e) => {
  console.log('Redone in:', e.detail.editor);
});
```

#### `HistoryManager.canUndo(editor)`
Checks if undo is available.
```javascript
if (window.HistoryManager.canUndo('strings')) {
  console.log('Undo available');
  // Enable Undo menu item
} else {
  console.log('Undo unavailable');
  // Disable Undo menu item
}

// Returns: boolean
```

#### `HistoryManager.canRedo(editor)`
Checks if redo is available.
```javascript
if (window.HistoryManager.canRedo('strings')) {
  console.log('Redo available');
  // Enable Redo menu item
} else {
  console.log('Redo unavailable');
  // Disable Redo menu item
}

// Returns: boolean
```

#### `HistoryManager.clear(editor)`
Clears history for an editor or all editors.
```javascript
// Clear specific editor
window.HistoryManager.clear('strings');

// Clear all editors
window.HistoryManager.clear();

// Event fired: 'historyCleared'
document.addEventListener('historyCleared', (e) => {
  console.log('Cleared:', e.detail.editors);
});
```

#### `HistoryManager.getUndoDescription(editor)`
Gets description of next undo action.
```javascript
const desc = window.HistoryManager.getUndoDescription('strings');

// Returns: "Edit dialogue line 42"
// Use in UI: "Undo: Edit dialogue line 42"
// Used in menu to show what will be undone
```

#### `HistoryManager.getRedoDescription(editor)`
Gets description of next redo action.
```javascript
const desc = window.HistoryManager.getRedoDescription('strings');

// Returns: "Edit dialogue line 42"
// Used in menu to show what will be redone
```

---

## ClipboardManager API

### Overview
ClipboardManager handles copy, cut, paste operations with system clipboard sync.

### Methods

#### `ClipboardManager.init()`
Initializes clipboard manager.
```javascript
window.ClipboardManager.init();
// Called automatically on page load
```

#### `ClipboardManager.copy(data, type)`
Copies data to clipboard.
```javascript
// Types: 'text', 'tiles', 'maps', 'strings', 'tables', 'code'

window.ClipboardManager.copy('Player sprite', 'text');

// For non-text data
window.ClipboardManager.copy({id: 'tile_42', pixels: [...]}, 'tiles');

// Event fired: 'dataCopied'
document.addEventListener('dataCopied', (e) => {
  console.log('Copied:', e.detail.type, e.detail.data);
});
```

#### `ClipboardManager.cut(data, type)`
Cuts data to clipboard (marks for deletion).
```javascript
window.ClipboardManager.cut('Hero sprite', 'tiles');

// Typically followed by deletion of the data
// Visually different from copy (might show grayed out in UI)

// Event fired: 'dataCut'
document.addEventListener('dataCut', (e) => {
  console.log('Cut:', e.detail.type);
});
```

#### `ClipboardManager.paste()`
Retrieves clipboard contents.
```javascript
// Synchronous for internal clipboard
const data = window.ClipboardManager.paste();

if (data) {
  console.log('Clipboard type:', data.type);
  console.log('Clipboard data:', data.content);
  // Returns: {type: 'text', content: '...'}
}

// Event fired: 'dataPasted'
document.addEventListener('dataPasted', (e) => {
  console.log('Pasted:', e.detail.type);
});
```

#### `ClipboardManager.hasData()`
Checks if clipboard has data.
```javascript
if (window.ClipboardManager.hasData()) {
  console.log('Clipboard is not empty');
  // Enable Paste menu item
} else {
  console.log('Clipboard is empty');
  // Disable Paste menu item
}

// Returns: boolean
```

#### `ClipboardManager.getType()`
Gets type of data in clipboard.
```javascript
const type = window.ClipboardManager.getType();

// Returns: 'text', 'tiles', 'maps', etc.
// Use to determine what can be pasted
```

#### `ClipboardManager.clear()`
Clears clipboard.
```javascript
window.ClipboardManager.clear();

// Event fired: 'clipboardCleared'
```

---

## SearchManager API

### Overview
SearchManager provides find, find-next, find-previous, and replace/replace-all functionality.

### Methods

#### `SearchManager.init()`
Initializes search manager.
```javascript
window.SearchManager.init();
```

#### `SearchManager.search(query, scope, options)`
Searches for text across files or current file.
```javascript
// Parameters:
// - query (string): Search term or regex
// - scope (string): 'current', 'all', or editor name ('strings', 'source', etc.)
// - options (object): {caseSensitive, useRegex, wholeWord}

const results = window.SearchManager.search('dragon', 'all', {
  caseSensitive: false,
  useRegex: false,
  wholeWord: false
});

// Returns array of:
// [
//   {
//     file: 'strings',
//     lineNumber: 12,
//     columnStart: 5,
//     columnEnd: 11,
//     text: '...dragon...',
//     line: 'A red dragon appears!'
//   },
//   ...
// ]

// Event fired: 'searchCompleted'
document.addEventListener('searchCompleted', (e) => {
  console.log(`Found ${e.detail.count} matches`);
});
```

#### `SearchManager.replace(query, replacement, scope, firstOnly)`
Replaces occurrences of search term.
```javascript
// Parameters:
// - query (string): What to find
// - replacement (string): What to replace with
// - scope (string): 'current', 'all', or specific editor
// - firstOnly (boolean): If true, replace only first match (optional)

const count = window.SearchManager.replace('player', 'hero', 'all', false);

// Returns: Number of replacements made
// Event fired: 'replacementMade' (fired for each replacement)
```

#### `SearchManager.replaceAll(query, replacement, scope)`
Replaces all occurrences in scope.
```javascript
const count = window.SearchManager.replaceAll('TODO', 'DONE', 'source');

console.log(`Replaced ${count} occurrences`);

// Shorthand for replace(..., false)
```

#### `SearchManager.next()`
Navigates to next search result.
```javascript
const result = window.SearchManager.next();

if (result) {
  // result: {file, lineNumber, columnStart, columnEnd, text}
  // Highlight this result in editor
  console.log(`Next match at line ${result.lineNumber}`);
} else {
  console.log('No more matches');
}

// Event fired: 'resultSelected'
```

#### `SearchManager.previous()`
Navigates to previous search result.
```javascript
const result = window.SearchManager.previous();

if (result) {
  console.log(`Previous match at line ${result.lineNumber}`);
}
```

#### `SearchManager.getCurrentIndex()`
Gets current position in search results.
```javascript
const {current, total} = window.SearchManager.getCurrentIndex();

console.log(`Position: ${current} of ${total}`);
// Returns: {current: 2, total: 15}
```

#### `SearchManager.validateRegex(pattern)`
Validates regex pattern before searching.
```javascript
if (window.SearchManager.validateRegex('[0-9]+')) {
  console.log('Valid regex');
} else {
  console.log('Invalid regex pattern');
}

// Returns: boolean
```

---

## KeyboardManager API

### Overview
KeyboardManager handles keyboard shortcuts and custom key bindings.

### Methods

#### `KeyboardManager.init()`
Initializes keyboard manager.
```javascript
window.KeyboardManager.init();
// Detects platform (Windows/Mac/Linux) for Ctrl/Cmd normalization
```

#### `KeyboardManager.register(shortcut, callback_or_action)`
Registers a keyboard shortcut.
```javascript
// Syntax: '[Ctrl|Shift|Alt|Cmd]+[Key]'

// With callback
window.KeyboardManager.register('Ctrl+K', () => {
  console.log('Ctrl+K pressed');
  // Do something
});

// With menu action string
window.KeyboardManager.register('Ctrl+Shift+P', 'togglePanel');

// Mac-friendly (auto-converts Ctrl to Cmd on Mac)
window.KeyboardManager.register('Ctrl+S', 'save');
// Press Cmd+S on Mac, Ctrl+S on Windows

// Event fired: 'shortcutRegistered'
document.addEventListener('shortcutRegistered', (e) => {
  console.log('Registered:', e.detail.shortcut);
});
```

#### `KeyboardManager.unregister(shortcut)`
Removes a registered shortcut.
```javascript
window.KeyboardManager.unregister('Ctrl+K');

// Event fired: 'shortcutUnregistered'
```

#### `KeyboardManager.getShortcut(action)`
Gets registered shortcut for an action.
```javascript
const shortcut = window.KeyboardManager.getShortcut('save');

// Returns: 'Ctrl+S' (or 'Cmd+S' on Mac)
```

#### `KeyboardManager.getAllShortcuts()`
Gets all registered shortcuts.
```javascript
const shortcuts = window.KeyboardManager.getAllShortcuts();

// Returns: {
//   'Ctrl+S': 'save',
//   'Ctrl+Z': 'undo',
//   'Ctrl+Y': 'redo',
//   ...
// }

// Use to display keyboard shortcut help
```

#### `KeyboardManager.disable()`
Temporarily disables all shortcuts.
```javascript
window.KeyboardManager.disable();

// Useful when user is typing in text input
// Shortcuts won't trigger until re-enabled
```

#### `KeyboardManager.enable()`
Re-enables shortcuts after disable().
```javascript
window.KeyboardManager.enable();
```

#### `KeyboardManager.isEnabled()`
Checks if shortcuts are currently enabled.
```javascript
if (window.KeyboardManager.isEnabled()) {
  console.log('Shortcuts active');
}

// Returns: boolean
```

---

## NotificationManager API

### Overview
NotificationManager displays toast notifications for system events.

### Methods

#### `NotificationManager.init()`
Initializes notification system.
```javascript
window.NotificationManager.init();
// Sets up container in top-right of page
```

#### `NotificationManager.info(message, duration)`
Shows info notification.
```javascript
window.NotificationManager.info('Processing...', 3000);
// duration: milliseconds (default: 3000)
// Show indefinitely: pass 0

// Event fired: 'notificationShown'
document.addEventListener('notificationShown', (e) => {
  console.log('Info:', e.detail.message);
});
```

#### `NotificationManager.success(message, duration)`
Shows success notification (green).
```javascript
window.NotificationManager.success('Saved successfully!', 3000);
```

#### `NotificationManager.warning(message, duration)`
Shows warning notification (yellow).
```javascript
window.NotificationManager.warning('Unsaved changes', 5000);
```

#### `NotificationManager.error(message, duration)`
Shows error notification (red).
```javascript
window.NotificationManager.error('Build failed!', 5000);
```

#### `NotificationManager.show(message, type, duration)`
Low-level notification method.
```javascript
// Types: 'info', 'success', 'warning', 'error'

window.NotificationManager.show(
  'Custom message',
  'warning',
  4000
);

// Returns: notification ID for manual dismissal
const notiId = window.NotificationManager.show('Test', 'info', 0);
```

#### `NotificationManager.dismiss(id)`
Manually dismiss notification by ID.
```javascript
const notiId = window.NotificationManager.show('Test');
setTimeout(() => {
  window.NotificationManager.dismiss(notiId);
}, 2000);
```

#### `NotificationManager.dismissAll()`
Dismisses all notifications.
```javascript
window.NotificationManager.dismissAll();
```

---

## Integration Examples

### Example 1: Full Project Workflow
```javascript
// 1. Create new project
const project = window.ProjectManager.newProject('Dragon Quest', 'gbc');
window.NotificationManager.success('New project created!');

// 2. Listen for changes and track history
const stringsEditor = document.getElementById('stringsEditor');
stringsEditor.addEventListener('change', (e) => {
  window.HistoryManager.pushState('strings', {
    content: e.target.value
  }, 'Edited string');
});

// 3. Enable keyboard shortcuts
stringsEditor.addEventListener('keydown', (e) => {
  if (e.key === 'z' && e.ctrlKey) {
    e.preventDefault();
    window.handleMenuAction('undo');
  }
});

// 4. Setup search when user presses Ctrl+F
window.KeyboardManager.register('Ctrl+F', () => {
  // Open search dialog
});

// 5. Auto-save every 5 minutes
window.ProjectManager.enableAutoSave(300000);

// 6. Save on demand
document.querySelector('[data-action="save"]').addEventListener('click', () => {
  if (window.ProjectManager.save()) {
    window.NotificationManager.success('Project saved!');
  } else {
    window.NotificationManager.error('Save failed!');
  }
});
```

### Example 2: Custom Tool with History Tracking
```javascript
class CustomTool {
  constructor(name, editorName) {
    this.name = name;
    this.editorName = editorName;
    this.currentState = {};
  }

  onDataChange(newState) {
    // Track change in history
    window.HistoryManager.pushState(
      this.editorName,
      newState,
      `${this.name} modified`
    );
    this.currentState = newState;
  }

  undo() {
    const previousState = window.HistoryManager.undo(this.editorName);
    if (previousState) {
      this.applyState(previousState);
    }
  }

  redo() {
    const nextState = window.HistoryManager.redo(this.editorName);
    if (nextState) {
      this.applyState(nextState);
    }
  }

  applyState(state) {
    this.currentState = state;
    this.render();
  }

  render() {
    // Update UI based on currentState
  }
}

// Usage
const tool = new CustomTool('Sprite Editor', 'tiles');
```

### Example 3: Search and Replace
```javascript
// Setup search form
const searchBtn = document.querySelector('[data-action="search"]');
searchBtn.addEventListener('click', () => {
  const query = document.querySelector('#searchInput').value;
  const caseSensitive = document.querySelector('#caseSensitive').checked;
  const useRegex = document.querySelector('#useRegex').checked;
  
  const results = window.SearchManager.search(query, 'all', {
    caseSensitive,
    useRegex
  });
  
  window.NotificationManager.info(`Found ${results.length} matches`);
  
  // Show results
  displaySearchResults(results);
});

// Replace all
const replaceAllBtn = document.querySelector('[data-action="replaceAll"]');
replaceAllBtn.addEventListener('click', () => {
  const query = document.querySelector('#searchInput').value;
  const replacement = document.querySelector('#replaceInput').value;
  
  const count = window.SearchManager.replaceAll(query, replacement, 'all');
  window.NotificationManager.success(`Replaced ${count} occurrences`);
});
```

### Example 4: Keyboard Shortcut Setup
```javascript
// Setup default shortcuts
const defaultShortcuts = {
  'Ctrl+S': 'save',
  'Ctrl+Shift+S': 'saveAll',
  'Ctrl+Z': 'undo',
  'Ctrl+Y': 'redo',
  'Ctrl+X': 'cut',
  'Ctrl+C': 'copy',
  'Ctrl+V': 'paste',
  'Ctrl+F': 'find',
  'Ctrl+H': 'replace',
  'Ctrl+A': 'selectAll',
  'Ctrl+N': 'newProject',
  'Ctrl+O': 'openProject',
  'Ctrl+B': 'buildAll',
  'Ctrl+Shift+B': 'cleanBuild',
  'Ctrl++': 'zoomIn',
  'Ctrl+-': 'zoomOut',
  'Ctrl+0': 'zoomReset',
  'F11': 'toggleFullscreen',
};

// Register all shortcuts
Object.entries(defaultShortcuts).forEach(([shortcut, action]) => {
  window.KeyboardManager.register(shortcut, action);
});

// Display help
const helpBtn = document.querySelector('[data-action="help"]');
helpBtn.addEventListener('click', () => {
  const shortcuts = window.KeyboardManager.getAllShortcuts();
  displayShortcutHelp(shortcuts);
});
```

---

## Error Handling

### Graceful Degradation
```javascript
// Check if manager exists before using
if (!window.ProjectManager) {
  console.error('ProjectManager not loaded');
  return;
}

// Check return values
const saved = window.ProjectManager.save();
if (!saved) {
  window.NotificationManager.error('Failed to save project');
}
```

### Event Handling for Errors
```javascript
// Listen for error events
document.addEventListener('error', (e) => {
  if (e.filename && e.filename.includes('core-systems.js')) {
    window.NotificationManager.error(`System error: ${e.message}`);
  }
});

// Search error handling
document.addEventListener('searchError', (e) => {
  window.NotificationManager.warning(`Invalid regex: ${e.detail.pattern}`);
});
```

### Validation
```javascript
// Validate before operations
function saveProject(name) {
  // Validate name
  if (!name || name.length === 0 || name.length > 50) {
    window.NotificationManager.error('Project name must be 1-50 characters');
    return false;
  }
  
  // Proceed with save
  return window.ProjectManager.save();
}
```

---

## Best Practices

### 1. Always Initialize on Page Load
```javascript
// At app startup
window.ProjectManager.init();
window.HistoryManager.init();
window.ClipboardManager.init();
window.SearchManager.init();
window.KeyboardManager.init();
window.NotificationManager.init();
```

### 2. Track History for User Actions
```javascript
// Every time user makes a change:
function onDataChange(data) {
  window.HistoryManager.pushState(
    'currentEditor',
    data,
    'User made changes'  // Descriptive message
  );
}

// Don't push on every keystroke - batch updates
let changeTimeout;
editor.addEventListener('input', (e) => {
  clearTimeout(changeTimeout);
  changeTimeout = setTimeout(() => {
    onDataChange(editor.value);
  }, 500); // Debounce for 500ms
});
```

### 3. Use Notifications for User Feedback
```javascript
// Good: Inform user of important actions
window.NotificationManager.success('Build completed!');

// Better: Use notifications for status only
// Use dialog for confirmations
window.NotificationManager.info('Processing...');
```

### 4. Handle Clipboard Gracefully
```javascript
// Check if data available before pasting
if (window.ClipboardManager.hasData()) {
  const {type, content} = window.ClipboardManager.paste();
  // Handle paste
} else {
  window.NotificationManager.warning('Clipboard is empty');
}
```

### 5. Provide Keyboard Shortcuts
```javascript
// Always provide keyboard shortcuts for common actions
const shortcuts = [
  {action: 'save', key: 'Ctrl+S'},
  {action: 'undo', key: 'Ctrl+Z'},
  {action: 'redo', key: 'Ctrl+Y'},
];

// Show in "Help > Keyboard Shortcuts"
function showKeyboardShortcuts() {
  const helpText = shortcuts
    .map(s => `${s.action}: ${s.key}`)
    .join('\n');
  showDialog(helpText);
}
```

### 6. Search with Context
```javascript
// Always provide search context to user
const results = window.SearchManager.search(query, 'all', options);

results.forEach(result => {
  console.log(`${result.file}:${result.lineNumber} - ${result.line}`);
  // Shows: strings:42 - "A red dragon appears!"
});
```

### 7. Auto-Save Protection
```javascript
// Enable auto-save for critical applications
window.ProjectManager.enableAutoSave(300000); // Every 5 min

// Also save on window close
window.addEventListener('beforeunload', (e) => {
  if (window.HistoryManager.canUndo('strings')) {
    e.preventDefault();
    e.returnValue = 'You have unsaved changes';
  }
});
```

### 8. Load Order Matters
```html
<!-- CORRECT ORDER in index.html -->
<script src="/js/platformconfig.js"></script>
<script src="/js/core-systems.js"></script>      <!-- Base systems -->
<script src="/js/context-menus.js"></script>    <!-- Uses core-systems -->
<script src="/js/drag-drop.js"></script>        <!-- Uses core-systems -->
<script src="/js/menus.js"></script>            <!-- Uses core-systems (handleMenuAction) -->
<script src="/js/menu-handlers.js"></script>    <!-- Wraps menus.js -->
<script src="/js/tools.js"></script>            <!-- All systems ready -->
<script src="/js/app.js"></script>              <!-- Main app -->
```

---

## Troubleshooting

### "Manager not defined" Error
```javascript
// Problem: Accessing manager before page load
// Solution: Wrap in DOMContentLoaded or check if window.ProjectManager exists

document.addEventListener('DOMContentLoaded', () => {
  // Safe to use ProjectManager now
  window.ProjectManager.newProject('Test', 'gbc');
});
```

### History not recording
```javascript
// Problem: States not being pushed
// Solution: Ensure pushState is called with complete state object

// WRONG:
window.HistoryManager.pushState('strings', document.getElementById('text'));

// RIGHT:
window.HistoryManager.pushState('strings', {
  content: document.getElementById('text').value
}, 'Edited text');
```

### Search results empty
```javascript
// Problem: No matches found
// Possible causes:
// 1. Query string incorrect
// 2. Scope set wrong ('current' vs 'all')
// 3. Case sensitivity mismatch

const results = window.SearchManager.search('dragon', 'all', {
  caseSensitive: false,  // Try disabling
  useRegex: false        // Make sure not using regex
});

console.log('Results:', results.length);
```

---

## Advanced Topics

### Custom Shortcuts with Modifiers
```javascript
// Support multiple modifier combinations
window.KeyboardManager.register('Ctrl+Alt+S', () => {
  // Save As...
});

// Shift modifier
window.KeyboardManager.register('Ctrl+Shift+R', () => {
  // Rebuild
});
```

### Batch Operations with Rollback
```javascript
// Start batch
window.HistoryManager.clearFutureStack = true;

// Perform multiple operations
for (let i = 0; i < 10; i++) {
  modifyData(i);
}

// Push single history state for all changes
window.HistoryManager.pushState('strings', getAllData(), 'Batch operation');

// User can now undo entire batch with one Ctrl+Z
```

---

**End of API Documentation**

For additional help, see:
- [NEW_FEATURES_GUIDE.md](NEW_FEATURES_GUIDE.md) - Feature overview
- [FEATURE_TESTING_GUIDE.md](FEATURE_TESTING_GUIDE.md) - Testing procedures
- Browser console documentation in DevTools
