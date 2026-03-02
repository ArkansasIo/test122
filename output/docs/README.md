# Labyrinth of the Dragon - Dragon Studio Edition

**Modern Visual Game Creator** - Create amazing games without Game Boy Color constraints!

## 🎮 What's New

Transformed from a Game Boy Color RPG project into a full-featured visual game development studio:

- ✨ **Visual Editors** - Tile editor, sprite designer, map builder, animation editor
- ✨ **No Constraints** - Full screen resolutions, modern graphics, unlimited sprites
- ✨ **Multi-Platform** - Export to web, Windows, Mac, Linux, iOS, Android
- ✨ **Story Builder** - Create branching narratives and dialogue trees
- ✨ **Asset Management** - Complete tooling for graphics, audio, data
- ✨ **Game Engine** - Modern 2D runtime with physics, collision, lighting

## 🚀 Quick Start

1. Start the studio:

   npm run web

2. Open in browser:

   http://localhost:5000/studio

3. Create your game using visual tools

4. Export as web game or standalone executable

## 📁 Project Structure

- `src/client/studio.html` - Main visual IDE
- `src/client/js/game-engine.js` - Modern 2D game runtime
- `documents/` - Complete documentation and guides
- `output/bin/` - Compiled executables

## 🎨 Available Tools

### Creation Suite
- **Tile Editor** - Design pixel art and tilesets
- **Sprite Editor** - Create animated characters
- **Map Builder** - Visually design levels
- **Animation Editor** - Smooth sprite animations

### Game Design
- **Character System** - Create heroes and NPCs
- **Enemy Designer** - Define adversaries
- **Item Manager** - Weapons, armor, inventory
- **Dialogue System** - Branching story narratives
- **Physics Engine** - Gravity, collisions, movement

### Export Options
- **Web Games** - HTML5 ready-to-play
- **Standalone EXE** - Windows desktop app
- **Mac/Linux** - Native applications
- **Mobile** - iOS/Android apps

## 📦 Output Files

All compiled executables are in `output/bin/`:

- `LabyrinthIDE.exe` (40.6 MB) - Full visual IDE with web server
- `compile.exe` (41.6 MB) - Build tool
- `labyrinth.exe` (41.6 MB) - Game engine
- `game-compiler.exe` (77.5 KB) - C++ project compiler

## 🔧 Build Commands

```bash
npm run web              # Start visual IDE
npm run build            # Compile TypeScript
npm run build-exe        # Create standalone executables
npm run build-game       # Compile game project
npm run export-web       # Export as web game
```

## 📚 Documentation

See [Dragon Studio README](./DRAGON_STUDIO_README.md) for complete features and usage guide.

- [Game Engine API](./documents/game-engine-api.md)
- [Tutorial - First Game](./documents/tutorial.md)
- [Asset Guidelines](./documents/assets.md)

## 🎯 Features

✅ No Game Boy constraints
✅ Modern graphics pipeline
✅ Web and desktop support
✅ Mobile ready
✅ Physics simulation
✅ Particle systems
✅ Networking ready
✅ Story editor
✅ Visual scripting
✅ Asset library

## 📋 License

MIT - See [LICENSE](./LICENSE)

---

**Dragon Studio** - The future of indie game development.# Labyrinth of the Dragon (GBC)
An 8-bit Adventure RPG with D&D Monsters!

## 🎮 Visual Development Environment

**NEW:** Enchantment Engine now includes a complete visual development studio!

### Features
- 🌟 **Splash Screen** - Professional branding on startup
- 📦 **Project Manager** - Organize multiple game projects
- 🎬 **Title Screen** - Project overview before editing
- 🎨 **GB Studio Tools** - Visual scene editor, event system, asset browser
- 📁 **Smart Organization** - Automatic C/ASM/asset folder structure

### Quick Start
```bash
npm install
npm run web
```
Visit `http://localhost:5000` to launch the visual IDE!

📖 **See [NEW_SCREENS_GUIDE.md](NEW_SCREENS_GUIDE.md) for the complete visual guide**  
📖 **See [GB_STUDIO_FEATURES.md](GB_STUDIO_FEATURES.md) for editor tutorials**  
📖 **See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for API documentation**

---

## How to Build the ROM

### Depedencies
* [GBDK-2020](https://github.com/gbdk-2020/gbdk-2020) - The Game Boy Development
  kit. Includes the libraries and binaries for C development on the Game Boy.
* [GNU Make](https://gnuwin32.sourceforge.net/packages/make.htm) - Build system
  tool (installation should only be required on Windows).
* [NodeJS](https://nodejs.org) - Used to run custom tools I made in the course
  of developing the game.

### Use Make to Build the ROM
Update the `MakeFile` or define a shell variable named `GBDK_HOME` pointing to
the directory where you installed GBDK.

To build the ROM run the following commands:

* `npm install`
* `make assets`
* `make`
Screen Manager: Creating new project with data: {name: "...", author: "..."}
Screen Manager: Project created: {...}
Screen Manager: About to show title screen
Screen Manager: showTitleScreen called with project: {...}
Screen Manager: Title screen elements: {gameName: true, projectInfo: true, ...}
Screen Manager: About to show title screen
Screen Manager: Showing screen: title
Screen Manager: Screen shown successfully: title