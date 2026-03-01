# Labyrinth of the Dragon - ROM Build

This folder contains the compiled Game Boy Color ROM for **Labyrinth of the Dragon**.

## ROM Information

**Game Title:** Labyrinth of the Dragon  
**Platform:** Game Boy Color (GBC)  
**Genre:** RPG / Dungeon Crawler  
**Developer:** Enchantment Engine Team  
**Rom Size:** 512KB - 1MB  

## Features

### Core Gameplay
- 🐉 Explore 8 floors of the dragon's labyrinth
- ⚔️ Turn-based combat with D&D-inspired monsters
- 🎭 Character classes: Warrior, Mage, Rogue, Cleric
- 📦 Inventory and equipment system
- 🗺️ Procedurally generated dungeons

### Game Systems
- **Quest System**: Main story and side quests
- **Dialogue System**: Branching NPC conversations
- **Party Management**: Up to 4 party members
- **Shop System**: Buy, sell, and trade items
- **Status Effects**: Poison, burn, freeze, and more
- **Loot System**: Treasure chests and monster drops
- **Save System**: Multiple save slots

### Advanced Features
- **Status Effects**: 15+ different buffs and debuffs
- **Formation System**: Front row and back row tactics
- **Reputation System**: Affects shop prices
- **Lockpicking**: Pick locks or find keys
- **Crafting Materials**: Collect and craft items
- **Boss Battles**: Epic encounters on each floor

## Building the ROM

### Prerequisites
- GBDK-2020 installed
- Make utility
- Node.js (for asset conversion)

### Build Commands

```bash
# Install dependencies
npm install

# Convert assets (tiles, maps, strings)
make assets

# Compile ROM
make

# Build everything
make all

# Clean build artifacts
make clean
```

### Output Files
- `LabyrinthOfTheDragon.gbc` - Main ROM file
- `LabyrinthOfTheDragon.map` - Symbol map for debugging
- `LabyrinthOfTheDragon.sym` - Symbol definitions

## Running the ROM

### Emulators
- **BGB** (Windows) - Highly accurate, best for testing
- **SameBoy** (Cross-platform) - Accurate with debugging tools
- **mGBA** (Cross-platform) - Fast and compatible
- **Gambatte** (Cross-platform) - Cycle-accurate

### Real Hardware
The ROM is compatible with:
- Game Boy Color
- Game Boy Advance / SP
- Super Game Boy (limited colors)

**Note:** Game Boy (original) is NOT supported due to GBC-specific features.

## ROM Details

### Memory Banks
```
Bank 0: Core game logic, main menu
Bank 1: Floor 1-2 data
Bank 2: Floor 3-4 data  
Bank 3: Floor 5-6 data
Bank 4: Floor 7-8 data
Bank 5: Battle system
Bank 6: Monsters (part 1)
Bank 7: Monsters (part 2)
Bank 8-15: Graphics and tile data
```

### Save Data
The ROM uses battery-backed SRAM for save data:
- 3 save slots
- Auto-save support
- Each save stores:
  - Player progress
  - Party state
  - Inventory
  - Quest progress
  - Opened chests
  - Game time

### Controls
```
D-Pad:       Navigate menus, move in dungeon
A Button:    Confirm, interact, attack
B Button:    Cancel, run from battle  
Start:       Pause menu
Select:      Open map/status
```

## Game Structure

### Files
- `main.c` - Entry point and main loop
- `battle.c` - Combat system
- `map.c` - Dungeon navigation
- `player.c` - Player stats and management
- `monster.c` - Enemy AI and data
- `item.c` - Item system
- `textbox.c` - Text rendering
- `floor*.c` - Floor-specific content

### Data Files
- `data/tiles/*.png` - Sprite and tileset graphics
- `data/maps/*.json` - Dungeon layouts
- `data/strings.csv` - All game text
- `data/tables.csv` - Item/monster stats

## Testing

### Debug Mode
Compile with debug flags:
```bash
make DEBUG=1
```

Features:
- FPS counter
- Memory usage display
- Jump to any floor
- Invincibility toggle
- Item spawner

### Test ROM
```bash
make test
```

Runs automated tests for:
- Battle calculations
- Item effects
- Save/load functionality
- Collision detection

## Known Issues

- Minor graphical glitches on Super Game Boy
- Save data corruption if power is lost during save
- Rare freeze on floor transitions (investigating)

## Version History

### v1.0.0 (Current)
- Initial release
- 8 floors of content
- 50+ monsters
- 100+ items
- Full quest system

### Planned Features (v1.1.0)
- New Game+ mode
- Additional character classes
- Bonus dungeon floors
- Multiplayer link cable trading

## Credits

**Programming:** Enchantment Engine Team  
**Graphics:** Pixel Art Studio  
**Music:** Chiptune Composers  
**Testing:** Community Beta Testers  

## License

This ROM is provided for personal, non-commercial use only.  
Labyrinth of the Dragon © 2026 Enchantment Engine

---

**Enjoy your adventure in the Labyrinth! 🐉**
