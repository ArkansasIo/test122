# Labyrinth of the Dragon (GBC)
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
