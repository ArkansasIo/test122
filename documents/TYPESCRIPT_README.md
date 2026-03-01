# Labyrinth of the Dragon - TypeScript Setup

This folder contains TypeScript source code for game development, build tools, and asset processing for the Labyrinth of the Dragon Game Boy Color game.

## Project Structure

```
├── types/              # TypeScript type definitions
│   ├── index.d.ts     # Main game types
│   ├── gbc.d.ts       # Game Boy Color specific types
│   └── global.d.ts    # Global type definitions
├── src-ts/            # TypeScript source code
│   ├── core.ts        # Game engine core
│   ├── player.ts      # Player management
│   ├── battle.ts      # Battle system
│   ├── monster.ts     # Monster management
│   ├── item.ts        # Item system
│   ├── ability.ts     # Ability system
│   ├── map.ts         # Map management
│   ├── textbox.ts     # Text and dialogue
│   ├── save.ts        # Save/load system
│   ├── utils.ts       # Utility functions
│   └── index.ts       # Main exports
├── tools-ts/          # Build tools
│   ├── png-to-tiles.ts      # PNG to tile converter
│   ├── string-generator.ts  # String table generator
│   ├── map-converter.ts     # Map data converter
│   ├── build.ts             # Build system
│   └── index.ts             # Tools CLI
├── src/               # C source code for Game Boy
├── data/              # Generated data files
├── obj/               # Compiled object files
├── dist/              # Compiled TypeScript output
├── index.ts           # Main entry point
├── cli.ts             # CLI tool entry point
├── package.json       # Node.js dependencies
└── tsconfig.json      # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- SDCC (Small Device C Compiler) for Game Boy compilation

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript code
npm run build
```

### Development

```bash
# Run in development mode with ts-node
npm run dev

# Watch mode (auto-recompile on changes)
npm run build:watch

# Start the application
npm start
```

## Build Tools

The project includes several command-line tools for asset processing and building:

### Build the Game Boy ROM

```bash
# Build the Game Boy ROM
npm run build-game

# Or use the tools CLI directly
npm run tools build
```

### Asset Conversion

```bash
# Convert PNG images to Game Boy tiles
npm run tools convert-png <input-dir> <output-dir>

# Convert map data to C format
npm run tools convert-map <input-dir> <output-dir>

# Generate string tables
npm run tools generate-strings <input-json> <output-c> <table-name> [bank]
```

### Examples

```bash
# Convert all tiles
npm run tools convert-png ./assets/tiles ./data

# Convert all maps
npm run tools convert-map ./res/maps ./data

# Generate string table for floor 1
npm run tools generate-strings ./assets/strings_floor1.json ./data/strings_floor1.c strings_floor1 2
```

### Clean Build

```bash
# Clean all build artifacts
npm run clean

# Or use tools CLI
npm run tools clean
```

### Watch Mode

```bash
# Watch for changes and auto-rebuild
npm run tools watch
```

## TypeScript API

### Game Engine

```typescript
import { initializeGame } from './src-ts';

// Initialize all game systems
const game = initializeGame();

// Access managers
game.engine;         // Game engine
game.playerManager;  // Player management
game.battleSystem;   // Battle system
game.monsterManager; // Monster management
game.itemManager;    // Item management
game.abilityManager; // Ability management
game.mapManager;     // Map management
game.saveManager;    // Save/load system

// Start the game
game.engine.initialize();
game.engine.start();
```

### Player Management

```typescript
import { PlayerManager } from './src-ts/player';

const player = game.playerManager;

// Movement
player.move('up');
player.setPosition(10, 5);

// Stats
player.gainExperience(100);
player.takeDamage(10);
player.heal(20);

// Items and abilities
player.addItem(item);
player.learnAbility(ability);
player.equip(weapon);
```

### Battle System

```typescript
import { BattleSystem } from './src-ts/battle';

const battle = game.battleSystem;

// Start battle
battle.startBattle([monster1, monster2]);

// Execute actions
battle.executeAction({
  type: 'attack',
  source: player,
  target: monster1
});

// Check battle state
if (battle.isActive()) {
  // Battle is ongoing
}
```

## Type System

All game types are defined in the `types/` directory:

- **index.d.ts**: Core game types (Player, Monster, Item, etc.)
- **gbc.d.ts**: Game Boy Color hardware types
- **global.d.ts**: Global TypeScript definitions

Import types in your code:

```typescript
import { Player, Monster, Item, Ability } from '../types';
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run build:watch` | Watch mode compilation |
| `npm start` | Build and run the application |
| `npm run dev` | Run with ts-node (no build step) |
| `npm run tools` | Run build tools CLI |
| `npm run clean` | Clean all build artifacts |
| `npm run build-game` | Build Game Boy ROM |
| `npm run convert-assets` | Convert all assets |

## Contributing

1. Write TypeScript code in `src-ts/` or `tools-ts/`
2. Define types in `types/`
3. Run `npm run build` to compile
4. Test your changes
5. Use the tools CLI to convert assets and build the ROM

## License

See LICENSE file in the root directory.
