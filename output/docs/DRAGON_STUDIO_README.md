# Dragon Studio - Visual Game Creator

Modern game development studio without Game Boy Color constraints. Create amazing games with visual tools!

## 🎮 Features

### Visual Editors
- **Tile Editor** - Create pixel art and tilesets easily
- **Sprite Editor** - Design and animate character sprites
- **Map Builder** - Visually design level layouts
- **Animation Editor** - Smooth animation timelines

### Game Development Tools
- **Character Editor** - Create player characters with stats and abilities
- **Enemy Designer** - Define adversaries and behaviors
- **Item Manager** - Create weapons, armor, inventory items
- **Dialogue Editor** - Build branching story narratives

### Export Options
- **Web Games** - JavaScript/HTML5 ready-to-play games
- **Standalone Executables** - Packaged Windows/Mac/Linux games
- **Mobile Ready** - iOS/Android compatible exports

## 🚀 Quick Start

1. Open the studio at `http://localhost:5000/studio`
2. Choose a visual editor from the left sidebar
3. Create your game assets and stories
4. Click "Publish Game" to export

## 📁 Project Structure

```
Dragon Studio/
├── src/client/
│   ├── studio.html          (Main visual IDE)
│   ├── css/                 (Styling)
│   └── js/
│       ├── editors/         (Tile, sprite, map editors)
│       ├── game-engine.js   (Non-GB game runtime)
│       └── exporter.js      (Build & export tools)
├── game-engine/
│   ├── web-runtime.js       (Web game runtime)
│   ├── physics.js           (Physics simulation)
│   └── renderer.js          (2D/3D rendering)
└── export/
    ├── web/                 (Web game template)
    ├── desktop/             (Electron wrapper)
    └── mobile/              (React Native)
```

## 🎨 Supported Formats

- **Graphics:** PNG, GIF, Spritesheet
- **Audio:** MP3, WAV, OGG
- **Data:** JSON, CSV
- **Export:** HTML5, EXE, DMG, APK

## 🔧 Build Commands

```bash
npm run studio         # Start visual IDE
npm run build-game    # Compile game project
npm run export-web    # Export as web game
npm run package       # Create standalone exe
```

## 📚 Documentation

- [Game Engine API](./documents/game-engine-api.md)
- [Tutorial - First Game](./documents/tutorial.md)
- [Asset Guidelines](./documents/assets.md)
- [Export Guide](./documents/export.md)

## 🌟 No Constraints

Unlike the original Game Boy Color version, Dragon Studio allows:
- ✓ Full screen resolutions (not 160x144)
- ✓ Modern graphics (not limited palette)
- ✓ Unlimited sprites and tiles
- ✓ Complex stories and narratives
- ✓ Multiplayer networking ready
- ✓ Mobile responsiveness
- ✓ Physics and particle systems

## 📖 License

MIT - See [LICENSE](./LICENSE)

## 🎯 Getting Started

1. **Create New Project** - Start with a template
2. **Design Assets** - Use visual editors
3. **Build Story** - Create dialogue and scenes
4. **Test Game** - Run in built-in preview
5. **Export** - Publish to web, desktop, or mobile

---

Dragon Studio transforms Game Boy Color RPG development into a modern, visual game creation platform for all platforms and screen sizes!
