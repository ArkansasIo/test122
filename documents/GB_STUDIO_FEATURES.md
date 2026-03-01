# GB Studio Features - Complete Guide

## 🎮 Overview

Your Labyrinth of the Dragon project now includes **comprehensive GB Studio-style features** for visual game development! This transforms the project into a full-featured Game Boy Color game development IDE.

## ✨ New Features Added

### 1. 📦 Enhanced Asset Browser

**Location:** Project tab

**Features:**
- Visual asset management with categories
- Search and filter assets
- Import/export assets
- Asset preview thumbnails
- Quick access to all project resources

**Asset Types:**
- 🎬 Scenes - Game levels and maps
- 🖼️ Backgrounds - Tilemap backgrounds
- 👤 Sprites - Character and object graphics
- 🧱 Tilesets - Reusable tile collections
- 🎵 Music - Background music tracks
- 🔊 Sounds - Sound effects

**How to Use:**
1. Click the **📦 Project** tab
2. Select a category to filter assets
3. Use the search box to find specific assets
4. Click an asset to select it
5. Click "➕ Add" to create new assets
6. Click "📥 Import" to import files

### 2. 🎬 Visual Scene Editor

**Location:** Scenes tab

**Features:**
- Drag-and-drop scene building
- Place actors and triggers visually
- Real-time position editing
- Grid-based layout
- Zoom controls (50% - 400%)
- Multiple tool modes

**Tools:**
- **↖️ Select (V)** - Select and move entities
- **👤 Actor (A)** - Add character/NPC actors
- **⚡ Trigger (T)** - Add interactive trigger zones
- **🚧 Collision (C)** - Paint collision tiles

**Keyboard Shortcuts:**
- `V` - Select tool
- `A` - Actor tool
- `T` - Trigger tool
- `C` - Collision tool
- `Delete` - Delete selected entity
- `Arrow Keys` - Move selected entity (when in select mode)

**How to Use:**
1. Click **🎬 Scenes** tab
2. Select a scene from dropdown or create new
3. Choose a tool from the toolbar
4. Click on canvas to place entities
5. Drag entities to reposition them
6. Double-click entities to edit events

### 3. 📋 Properties Panel

**Location:** Right side of Scenes tab

**Features:**
- Inspect selected entities
- Edit properties in real-time
- Configure actor behavior
- Set trigger parameters
- Automatic validation

**Actor Properties:**
- Name and sprite assignment
- Position (X, Y coordinates)
- Movement speed and direction
- Animation settings
- Collision group
- Persistence across scenes

**Trigger Properties:**
- Name and description
- Position and size
- Trigger type (Interact/Enter/Leave)
- Event script

**How to Use:**
1. Select an entity in the scene editor
2. Properties appear in right panel
3. Edit values directly
4. Changes apply immediately
5. Use dropdown menus for references

### 4. ⚡ Event System (Visual Scripting)

**Location:** Double-click any actor or trigger

**Features:**
- 25+ event types
- Visual event blocks
- No-code game logic
- Copy/paste events
- Drag to reorder
- Nested event support

**Event Categories:**

**💬 Dialog & Text:**
- Show Dialog - Display text boxes
- Show Choice - Player decisions

**➡️ Actor & Movement:**
- Actor Move To - Move characters
- Actor Set Direction - Change facing

**🚪 Scenes:**
- Switch Scene - Change levels
- Transition effects

**📦 Variables & Logic:**
- Set Variable - Store data
- If Condition - Branching logic
- Loop Forever - Repeat events
- Wait - Delay execution

**🎵 Audio:**
- Play Music - Background music
- Play Sound - Sound effects
- Stop Music

**🌅 Camera & Effects:**
- Fade In/Out
- Camera Shake
- Screen flash

**⚔️ Game:**
- Save Game - Save progress
- Load Game - Load saved data
- Start Battle - Combat system

**How to Use:**
1. Double-click an actor or trigger
2. Event editor modal opens
3. Click "➕ Add Event"
4. Choose event type from picker
5. Configure event parameters
6. Repeat to build script
7. Events execute top-to-bottom

**Keyboard Shortcuts:**
- `Ctrl+C` - Copy selected event
- `Ctrl+V` - Paste event
- `Delete` - Delete selected event

### 5. 🎵 Music Tracker

**Features:**
- Pattern-based music composition
- 4 Game Boy audio channels
- Piano keyboard input
- Tracker-style interface
- Note preview
- BPM control

**Channels:**
1. **Square Wave 1** - Lead melodies
2. **Square Wave 2** - Harmonies
3. **Wave** - Custom waveforms
4. **Noise** - Percussion/effects

**How to Use:**
1. Select a music track from Project tab
2. Use arrow keys to navigate pattern
3. Press piano keys or keyboard (Z-M) to insert notes
4. Use number keys for octaves
5. Press Delete to remove notes
6. Click "▶️ Play" to preview
7. Click "💾 Save" to store changes

**Keyboard Shortcuts:**
- `Z X C V B N M` - White piano keys
- `S D G H J` - Black piano keys (sharps)
- `↑↓←→` - Navigate pattern
- `Delete` - Remove note
- `Space` - Play/pause

### 6. 💾 Project Management

**Features:**
- Save/load project files (.gbsproj)
- Auto-save every 30 seconds
- Export to JSON
- Import from file
- Version control friendly

**Global Shortcuts:**
- `Ctrl+S` - Save project
- `Ctrl+O` - Open project
- `Ctrl+N` - New project
- `Ctrl+1-9` - Quick tab switching

**How to Save:**
1. Press `Ctrl+S` or use File menu
2. Project saves as `.gbsproj` file
3. Include all assets, scenes, and scripts
4. Auto-saved to localStorage as backup

**How to Load:**
1. Press `Ctrl+O` or use File menu
2. Select `.gbsproj` file
3. Project loads all data
4. All panels refresh automatically

## 🎯 Quick Start Tutorial

### Creating Your First Game Scene

1. **Open the Project Tab**
   - Click **📦 Project** 
   - View all assets

2. **Create a Scene**
   - Switch to **🎬 Scenes** tab
   - Click "➕ Scene" button
   - Name it "Start Room"

3. **Add Background**
   - In Project tab, click "➕ Add" in Backgrounds
   - Import your background image
   - Assign to scene

4. **Place the Player**
   - Select **👤 Actor** tool (or press `A`)
   - Click on the scene to place
   - Properties panel shows actor settings
   - Select "Player" sprite

5. **Add an NPC**
   - Place another actor
   - Change sprite to "NPC"
   - Position near player

6. **Create Dialog**
   - Double-click the NPC
   - Event editor opens
   - Click "➕ Add Event"
   - Choose "💬 Show Dialog"
   - Type message: "Welcome to the dungeon!"
   - Close editor

7. **Add a Door Trigger**
   - Select **⚡ Trigger** tool (press `T`)
   - Place trigger at doorway
   - Resize to fit door
   - Double-click to edit events
   - Add "🚪 Switch Scene" event
   - Select next scene
   - Set player spawn position

8. **Test Your Scene**
   - Click **🎮 Emulator** tab
   - Click "Build ROM"
   - Load ROM in emulator
   - Walk around and interact!

### Adding Music

1. **Create Music Track**
   - Go to **📦 Project** tab
   - Click "🎵 Music" category
   - Click "➕ Add Music"
   - Name it "Dungeon Theme"

2. **Compose Pattern**
   - Select the music track
   - Use keyboard (Z-M) to add notes
   - Arrow keys to navigate
   - Build melody on Channel 1
   - Add bass on Channel 2

3. **Add to Scene**
   - Go back to **🎬 Scenes** tab
   - Double-click scene background
   - Add "🎵 Play Music" event
   - Select "Dungeon Theme"
   - Set loop: ON

## 🔧 Advanced Features

### Custom Events

Create reusable event scripts:
1. Use EventEditor to build complex logic
2. Save as custom event template
3. Reuse across multiple actors/triggers

### Actor Behaviors

**Movement Patterns:**
- Static (speed = 0) - Immovable objects
- Slow (speed = 1) - Deliberate movement
- Normal (speed = 2) - Standard walking
- Fast (speed = 3) - Running/dashing

**Directions:**
- Up, Down, Left, Right
- Affects sprite animation frames
- Used in movement events

### Trigger Types

**Interact:** - Activated by pressing A button near trigger - Use for NPCs, signs, chests
- Shows interaction prompt

**Enter:**
- Activates when player steps into area
- Use for zone transitions
- Triggers once per entry

**Leave:**
- Activates when player exits area
- Use for cleanup events
- Opposite of Enter

### Variables System

Store game state:
- Numeric variables (0-255)
- Use in If Condition events
- Track quest progress
- Store inventory counts
- Control game flags

**Operations:**
- Set - Assign value
- Add - Increment
- Subtract - Decrement
- Multiply - Scale
- Divide - Split

### Scene Connections

Build your world:
1. Create multiple scenes
2. Add triggers at exits
3. Use "Switch Scene" events
4. Set player spawn positions
5. Test seamless transitions

## 📊 Project Structure

```
MyGame.gbsproj
├── backgrounds/    # Background images
├── sprites/        # Character sprites
├── tilesets/       # Reusable tiles
├── music/          # Music patterns
├── sounds/         # SFX samples
├── scenes/         # Game scenes
│   ├── actors[]    # Characters/objects
│   ├── triggers[]  # Interactive zones
│   └── scripts[]   # Event lists
└── settings        # Game configuration
```

## 🎨 Asset Guidelines

### Sprites
- Size: 8×8 or 16×16 pixels
- Format: 2-bit (4 colors)
- Frames: Up to 8 per animation
- Palettes: GBC color palettes

### Backgrounds
- Size: 160×144 pixels (fullscreen)
- Tiled: 20×18 tiles (8×8 each)
- Format: Tilemap + tileset
- Max tiles: 256 unique

### Music
- 4 channels max
- 64 rows per pattern
- Notes: C2 to B7
- Effects: Volume, pitch, duty

## 🐛 Troubleshooting

**Entities not appearing:**
- Check sprite is assigned
- Verify position is on screen
- Ensure scene has background

**Events not triggering:**
- Verify trigger type is correct
- Check trigger position/size
- Ensure script is not empty
- Test event logic step-by-step

**Music not playing:**
- Check pattern has notes
- Verify Play Music event in scene
- Ensure music track is saved
- Check BPM is reasonable (60-240)

**Changes not saving:**
- Look for browser storage errors
- Check localStorage quota
- Use Ctrl+S to manually save
- Export .gbsproj as backup

## 🚀 Performance Tips

1. **Limit actors per scene:** Keep under 10 for best performance
2. **Optimize sprites:** Reuse sprites across actors
3. **Simplify events:** Break complex scripts into smaller pieces
4. **Test frequently:** Build ROM often to catch issues early  
5. **Use triggers wisely:** Don't overlap trigger zones

## 📚 Additional Resources

**GB Studio Documentation:**
- Official GB Studio docs for more advanced techniques
- Game Boy development guides
- GBDK library reference

**Community:**
- Share your .gbsproj files
- Collaborate on GitHub
- Join Game Boy homebrew communities

## 🎉 What's Next?

Your project now has the foundation for GB Studio-like development! Here's what you can expand:

**Planned Enhancements:**
- [ ] Animation editor with frame-by-frame control
- [ ] Advanced collision layer painting
- [ ] Custom event plugin system
- [ ] Variable debugger/inspector
- [ ] Scene graph visualizer
- [ ] Sprite palette editor
- [ ] Advanced music effects (vibrato, arpeggio)
- [ ] Battle system designer
- [ ] Item/inventory editor
- [ ] Dialog tree branching
- [ ] Camera follow modes
- [ ] Parallax scrolling
- [ ] Save slot management

## 💡 Tips & Tricks

1. **Use descriptive names:** Name your actors, scenes, and variables clearly
2. **Organize with categories:** Group related assets together
3. **Test incrementally:** Build and test after each major change
4. **Use comments:** Document complex event logic
5. **Backup regularly:** Export .gbsproj files frequently
6. **Start simple:** Build core gameplay before adding complexity
7. **Reuse events:** Use custom events for repeated logic
8. **Optimize sprites:** Share sprite resources across actors
9. **Plan your scenes:** Sketch layouts before building
10. **Learn from examples:** Study example projects

---

## 🏁 Getting Started Checklist

- [ ] Switch to **Project** tab and explore asset browser
- [ ] Create your first scene in **Scenes** tab
- [ ] Place an actor and configure properties
- [ ] Add a trigger with a Show Dialog event
- [ ] Compose a simple melody in music tracker
- [ ] Connect two scenes with Switch Scene event
- [ ] Build ROM and test in emulator
- [ ] Save your project with Ctrl+S

**Congratulations!** You now have a complete GB Studio-style development environment. Start creating your Game Boy Color masterpiece! 🎮✨

---

*For more help, press F1 or check the Help menu in the application.*
