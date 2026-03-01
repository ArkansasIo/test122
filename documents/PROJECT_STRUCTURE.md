# Project Structure System

## Overview

The Enchantment Engine now features a GB Studio-like project structure system that organizes game files (C, ASM, assets) into individual project folders with a professional workflow.

## Screens Flow

### 1. Splash Screen (2.5 seconds)
- **Logo animation** with floating dragon icon
- **Loading bar** showing initialization progress
- **Version information** displayed at bottom
- Automatically transitions to Project Manager

### 2. Project Manager
The central hub for managing all your game projects.

**Features:**
- **New Project** - Create a fresh game project with wizard
- **Open Project** - Load an existing project
- **Import Project** - Import external projects
- **Example Projects** - Load pre-made example games
- **Recent Projects** - Quick access to your last 10 projects

**New Project Dialog:**
- Project Name (required)
- Author Name (optional)
- Description (optional)
- Auto-generates sanitized folder structure

### 3. Title Screen
Shows before entering the editor for a selected project.

**Displays:**
- Project name and icon
- Author and description
- Project statistics:
  - Scene count
  - Actor count
  - Script count
- **Open Editor** - Enter the development environment
- **Back to Projects** - Return to Project Manager
- Press ENTER to quickly open editor

### 4. Editor
The main development environment with all visual tools.

## Project Folder Structure

Each project is organized like GB Studio:

```
projects/
  my_game/
    src/
      actors/           # Actor definitions
      backgrounds/      # Background images
      music/            # Music files
      sounds/           # Sound effects
      sprites/          # Sprite sheets
      tilesets/         # Tile data
      game/             # Generated C and ASM files
    assets/
      art/              # Original artwork
      tiles/            # Tile graphics
      tms_tilemaps/     # Tilemap data
      strings/          # String resources
    scenes/             # Scene definitions (.json)
    build/
      obj/              # Compiled ASM objects
      rom/              # Built ROM files (.gbc)
    data/               # Generated C data files
```

## Project Data Structure

Projects are stored as JSON with the following structure:

```json
{
  "id": "proj_1234567890_abc123",
  "name": "My Game",
  "author": "Developer Name",
  "description": "A fun adventure",
  "version": "1.0.0",
  "created": "2026-03-01T12:00:00Z",
  "modified": "2026-03-01T12:30:00Z",
  "path": "projects/my_game",
  "structure": {
    "src": {
      "actors": [],
      "backgrounds": [],
      "music": [],
      "sprites": [],
      "game": []
    },
    "assets": {
      "art": [],
      "tiles": []
    },
    "scenes": [],
    "build": {
      "obj": [],
      "rom": []
    }
  },
  "settings": {
    "cartridgeType": "GBC",
    "colorMode": true,
    "playerSprite": null,
    "startScene": null
  },
  "stats": {
    "sceneCount": 0,
    "actorCount": 0,
    "backgroundCount": 0,
    "scriptCount": 0
  }
}
```

## File Management

### Adding Files to Project

```javascript
// Add a background image
projectSystem.addFile('src', 'backgrounds', {
  name: 'forest_bg.png',
  type: 'image/png',
  path: 'projects/my_game/src/backgrounds/forest_bg.png',
  size: 8192
});

// Add a C source file
projectSystem.addFile('src', 'game', {
  name: 'player.c',
  type: 'text/x-c',
  path: 'projects/my_game/src/game/player.c'
});
```

### Adding Scenes

```javascript
// Create a new scene
projectSystem.addScene({
  name: 'Starting Village',
  background: 'village_bg',
  actors: ['player', 'npc_elder'],
  triggers: ['door_trigger'],
  collisions: []
});
```

### Generating Game Files

The system can auto-generate C and ASM files from your project:

```javascript
const files = projectSystem.generateGameFiles();

// Returns:
// {
//   cFiles: [{ name: 'scene_0.c', path: '...', content: '...' }],
//   asmFiles: [...],
//   dataFiles: [...]
// }
```

## Project System API

### ProjectSystem Class

#### Constructor
```javascript
const projectSystem = new ProjectSystem();
```

#### Methods

**createProject(projectData)**
- Creates a new project with folder structure
- Parameters: `{ name, author, description }`
- Returns: Project object

**openProject(projectPath)**
- Opens an existing project
- Parameters: Path to project
- Returns: Project object or null

**saveProject()**
- Saves current project to storage
- Returns: true on success

**addFile(category, subcategory, fileData)**
- Adds a file to project structure
- Parameters: category ('src', 'assets', etc.), subcategory, fileData
- Returns: File object

**addScene(sceneData)**
- Adds a scene to the project
- Parameters: Scene data object
- Returns: Scene object

**updateStats()**
- Recalculates project statistics
- Automatically called on project changes

**generateGameFiles()**
- Generates C/ASM files from project data
- Returns: Object with cFiles, asmFiles, dataFiles arrays

**getRecentProjects()**
- Returns array of recently opened projects
- Limited to last 10 projects

**getCurrentProject()**
- Returns the currently loaded project
- Returns: Project object or null

**closeProject()**
- Closes the current project
- Clears currentProject reference

## Screen Manager API

### ScreenManager Class

#### Constructor
```javascript
const screenManager = new ScreenManager();
```

#### Methods

**start()**
- Starts the application flow
- Shows splash screen, then project manager

**showScreen(screenName)**
- Shows specific screen ('splash', 'projectManager', 'title', 'editor')
- Hides all other screens

**showTitleScreen(project)**
- Shows title screen with project details
- Parameters: Project object

**createNewProject(projectData)**
- Creates project and shows title screen
- Parameters: Project data

**openEditor()**
- Opens the main editor environment
- Dispatches 'editorOpened' event

**backToProjectManager()**
- Returns to project manager from title screen

## Storage

Projects are currently stored in **localStorage** for demo purposes:
- Key format: `project_{path}`
- Recent projects: `recentProjects`

In production, this would be replaced with:
- File system API (Electron/Tauri)
- IndexedDB for web version
- Server-side storage for cloud projects

## Keyboard Shortcuts

- **ENTER** on title screen - Open editor
- **Ctrl+Q** - Quit application
- **ESC** - Cancel dialogs

## Events

The system dispatches custom events:

**editorOpened**
```javascript
window.addEventListener('editorOpened', (e) => {
  const project = e.detail.project;
  // Initialize editor with project data
});
```

## Integration Example

```javascript
// Listen for editor opening
window.addEventListener('editorOpened', (e) => {
  const project = e.detail.project;
  console.log('Loading project:', project.name);
  
  // Load project assets into editor
  loadProjectAssets(project);
  
  // Initialize GB Studio components with project
  if (window.gbStudio) {
    window.gbStudio.loadProject(project);
  }
});

// Access current project anywhere
function getCurrentGameName() {
  const project = window.screenManager.projectSystem.getCurrentProject();
  return project ? project.name : 'No Project';
}
```

## Benefits

1. **Organized Structure** - All game files in logical folders
2. **Multiple Projects** - Easy to manage multiple games
3. **Professional Workflow** - Similar to GB Studio/Unity
4. **Code Generation** - Auto-generate C/ASM from visual tools
5. **Asset Management** - Track all resources in one system
6. **Recent Projects** - Quick access to your work
7. **Project Statistics** - See project complexity at a glance

## Future Enhancements

- [ ] Project templates (RPG, Platformer, Puzzle)
- [ ] Cloud project sync
- [ ] Version control integration
- [ ] Project export/sharing
- [ ] Asset preprocessing pipeline
- [ ] Build configuration per project
- [ ] Multi-language support in projects
- [ ] Project search and filtering
- [ ] Collaborative editing
- [ ] Project backups and restore

## Troubleshooting

**Projects not showing in recent list**
- Check localStorage is enabled in browser
- Clear browser cache and restart
- Projects saved in localStorage: `localStorage.getItem('recentProjects')`

**Splash screen not appearing**
- Ensure CSS files are loaded
- Check browser console for errors
- Verify screen-manager.js is loaded before app.js

**Editor not loading**
- Check 'editorOpened' event is fired
- Verify app element exists: `document.getElementById('app')`
- Ensure project is created before opening editor

---

**Created:** March 2026  
**Version:** 1.0.0  
**Engine:** Enchantment Engine
