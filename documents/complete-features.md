# Dragon Studio - Complete Feature Documentation

## System Overview

Dragon Studio now includes all essential game development features in a unified, professional game creation platform.

---

## 📊 Character System

### Features
- **Hero Creation** - Create playable characters with stat allocation
- **Enemy Designer** - Define enemy behaviors and stat scaling
- **Stat System** - 9 core stats with leveling progression
- **Skill System** - Create and assign skills to characters
- **Equipment** - Weapon, armor, shield, and accessory slots
- **Inventory** - Item management and carrying capacity
- **Progression** - Level up with automated stat scaling

### Core Stats
```
- Health: Maximum hit points
- Mana: Magical resource pool
- Damage: Physical attack power
- Defense: Damage reduction
- Speed: Action speed and evasion
- Intelligence: Magic power
- Wisdom: Magic defense and healing
- Charisma: NPC interaction bonus
- Luck: Critical hit and item drop chance
```

### API Usage
```javascript
const chars = new CharacterSystem();
const hero = chars.createCharacter('Link', 'hero');
chars.updateCharacterStats(hero.id, { health: 120, damage: 15 });
chars.addSkillToCharacter(hero.id, new Skill('Slash', 'attack', 20, 5));
chars.equipItem(hero.id, new Weapon('Iron Sword', 15, 0.2), 'weapon');
```

---

## 🎬 Dialogue & Story System

### Features
- **Branching Dialogue Trees** - Complex narrative structures
- **Conditional Branches** - Dialogue changes based on story state
- **Story Variables** - Track game state across conversations
- **Multiple Characters** - Different speakers and emotions
- **Conversation History** - Track all player choices
- **Story Scenes** - Multi-dialogue level organization

### Dialogue Node Types
- **Dialogue** - NPC speech
- **Choice** - Player decision points
- **Condition** - Branch based on game state
- **Action** - Execute logic (give item, set flag)
- **End** - Conversation conclusion

### Emotions
- Happy, Sad, Angry, Surprised, Neutral (affects visuals)

### API Usage
```javascript
const dialogueMgr = new DialogueManager();
const tree = dialogueMgr.createDialogueTree('Meeting Elder');

const start = tree.createNode('Welcome, traveler!', 'dialogue', 'Elder');
const choice1 = tree.createNode('What brings you here?', 'choice');
const response = tree.createNode('Seeking the ancient artifact...', 'dialogue', 'Elder');

start.addChoice('Tell me about the artifact', choice1.id);
choice1.nextNodeId = response.id;

dialogueMgr.startConversation(tree.treeId);
```

---

## 🎨 Animation System

### Features
- **Frame Animation** - Sprite frame-by-frame animation
- **Spritesheet Parsing** - Automatic frame extraction
- **Animation States** - State machine for animation control
- **Playback Control** - Play, pause, resume, stop
- **Animation Blending** - Smooth transitions
- **Callbacks** - Execute code on animation complete

### Spritesheet Formats
- **Grid Layout** - Regular tile grid
- **Sprite Strip** - Horizontal or vertical strip
- **Custom Layouts** - Manual frame positioning

### API Usage
```javascript
const animation = new Animation('walk');
animation.addFrame(0, 2); // sprite 0, 2 frames duration
animation.addFrame(1, 2);
animation.addFrame(2, 2);
animation.loop = true;

const controller = new AnimationController(sprite);
controller.addAnimation(animation);
controller.play('walk');
controller.update(deltaTime);
controller.render(ctx, x, y, spriteSheet);
```

---

## 📦 Project & Asset Management

### Project System
- **Project Creation** - New game projects with templates
- **Save/Load** - Persist projects locally
- **Version Control** - Track project versions
- **Project Settings** - Game resolution, FPS, colors

### Asset Manager
- **Asset Organization** - Categorize by type
- **Asset Import** - Upload PNG, JSON, audio files
- **Asset Search** - Find by name or tags
- **Asset Categories** - Sprites, Tilesets, Audio, Fonts

### Scene Management
- **Create Scenes** - Multiple game levels
- **Scene Objects** - Manage game entities
- **Camera System** - Multiple cameras per scene
- **Physics Settings** - Per-scene gravity and bounds

### API Usage
```javascript
const manager = new ProjectManager();
const project = manager.createProject('My Game');

const assetMgr = new AssetManager();
const spriteAsset = assetMgr.createAsset('Hero', 'sprite');

const scene = new GameScene('Level 1', 1280, 720);
project.addScene('scene1', scene);

manager.saveProject(project);
```

---

## 🚀 Build & Export System

### Export Targets
- **Web (HTML5)** - Browser-based games
- **Windows EXE** - Desktop application (Electron)
- **macOS App** - Mac application bundle
- **Linux Binary** - Linux executable
- **iOS App** - Apple App Store ready (.ipa)
- **Android APK** - Google Play ready

### Build Process
1. Asset packaging and compression
2. Code bundling and optimization
3. Platform-specific compilation
4. Output generation

### Export Features
- Code minification
- Asset compression
- Source maps (optional)
- Platform optimization

### API Usage
```javascript
const builder = new ExportBuilder(project);
const result = builder.build('web');

// Returns: { format, files }
// Contains index.html, game.js, game.css, assets.json
```

---

## ⌨️ Input System

### Supported Input
- **Keyboard** - All keys with WASD/Arrow support
- **Mouse** - Position tracking, button detection
- **Gamepad** - Analog sticks and button input
- **Touch** - Mobile/tablet support

### Default Bindings
```
Movement:     WASD / Arrow Keys
Jump:         Space
Interact:     E
Attack:       Mouse Button 0
Defend:       Shift
Pause:        Escape
Menu:         Escape
Inventory:    I
Stats:        C
```

### Custom Controls Mapping
```javascript
const input = new InputManager();
input.addBinding('customAction', ['q', 'mouse2']);
input.registerAction('customAction', () => {
  console.log('Custom action triggered!');
});

// Check input state
if (input.isActionActive('moveLeft')) {
  player.x -= player.speed;
}
```

---

## 🐛 Debug Console

### Built-in Console
- **Press `~` to toggle** debug console
- **Command history** with arrow keys
- **Real-time logging** of game events
- **Memory monitoring**
- **FPS tracking**

### Default Commands
```
help       - Show all commands
clear      - Clear console output
time       - Show current time
memory     - Display memory usage
fps        - Start FPS tracking
```

### Console API
```javascript
const debugConsole = new DebugConsole();
debugConsole.log('Game started!', 'info');
debugConsole.log('Warning!', 'warn');
debugConsole.log('Error!', 'error');

debugConsole.addCommand('spawn', () => {
  debugConsole.log('Spawning test entity');
});
```

---

## 🎮 Game Loop Integration

### Complete Example
```javascript
// Initialize all systems
const project = new GameProject('My Game');
const gameEngine = new GameEngine('gameCanvas');
const chars = new CharacterSystem();
const dialogue = new DialogueManager();
const animation = new AnimationController(sprite);
const input = new InputManager();
const debug = new DebugConsole();
const builder = new ExportBuilder(project);

// Create game objects
const hero = chars.createCharacter('Player', 'hero');
const scene = new GameScene('Main Level', 1280, 720);
project.addScene('level1', scene);

// Setup input
input.registerAction('moveLeft', () => {
  sprite.x -= sprite.speed;
});

// Game update loop
function update(deltaTime) {
  animation.update(deltaTime);
  input.checkBindings();
  scene.update(deltaTime);
}

// Render loop
function render() {
  gameEngine.render();
  animation.render(ctx, sprite.x, sprite.y, spriteSheet);
  scene.render(ctx);
}

// Start game
gameEngine.start();
```

---

## 📱 Platform-Specific Optimizations

### Web
- Gzip compression
- WebP image format
- Code minification
- Cache busting

### Desktop (Windows/Mac/Linux)
- LZ4 compression
- PNG image format
- Electron bundling
- Native modules support

### Mobile (iOS/Android)
- Brotli compression
- WebP format
- Memory optimization (128MB limit)
- Touch input optimization

---

## 🔄 Workflow Example: Complete Game

### Step 1: Create Project
```javascript
const manager = new ProjectManager();
const project = manager.createProject('Dragon Quest');
```

### Step 2: Create Characters
```javascript
const chars = new CharacterSystem();
const hero = chars.createCharacter('Hero', 'hero');
const sword = new Weapon('Iron Sword', 20, 0.15, 1.0);
chars.equipItem(hero.id, sword, 'weapon');
```

### Step 3: Build Dialogue
```javascript
const dialogueMgr = new DialogueManager();
const tree = dialogueMgr.createDialogueTree('Start');
// ... build dialogue tree
```

### Step 4: Create Level
```javascript
const scene = new GameScene('Level 1', 1280, 720);
project.addScene('level1', scene);
```

### Step 5: Add Animations
```javascript
const animation = new Animation('walk');
// ... add frames
controller.addAnimation(animation);
```

### Step 6: Export Game
```javascript
const builder = new ExportBuilder(project);
const webGame = builder.build('web');
const exeGame = builder.build('windows');
```

---

## 🎯 Next Steps

To use these systems in your Dragon Studio IDE:

1. **Open Code Editor** - Write custom game logic in C/C++/TypeScript
2. **Use Blueprint Scripting** - Visually create game flow
3. **Test in Preview** - Run games locally
4. **Export** - Build for any platform
5. **Debug** - Use debug console for troubleshooting

---

## 📖 API Reference

### All Exported Classes
- `CharacterSystem`, `Skill`, `Item`, `Weapon`, `Armor`
- `DialogueNode`, `DialogueTree`, `DialogueManager`, `StoryScene`
- `AnimationFrame`, `Animation`, `AnimationController`, `SpritesheetParser`, `AnimationStateMachine`
- `GameProject`, `AssetManager`, `Tileset`, `GameScene`, `ProjectManager`
- `BuildSettings`, `BuildTarget`, `ExportBuilder`, `PlatformOptimizer`
- `InputManager`, `DebugConsole`
- `GameEngine`, `Sprite`, `Tilemap` (from game-engine.js)

### Integration Points
All systems are designed to work together:
- **Characters** feed into dialogue and animation
- **Animation** displays character and sprite states
- **Dialogue** triggers story variables and events
- **Input** controls characters and game flow
- **Export** bundles everything for distribution

---

## Support

Refer to individual system documentation or GitHub issues for detailed help.

🐉 **Dragon Studio** - Your complete game development platform
