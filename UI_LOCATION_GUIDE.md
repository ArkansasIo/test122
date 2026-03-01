# UI Menus & Screens Location Guide
## Labyrinth of the Dragon - UI Architecture

This document maps where all UI menus, screens, and interface elements are located in the application.

---

## 📁 UI Source Code Locations

### **Game Boy C Source (src/)**
The actual Game Boy game UI is implemented in C and located in the `/src` directory:

#### **Main Screens & Menus**

| File | Description | Status |
|------|-------------|--------|
| [src/title_screen.c](src/title_screen.c) | Title screen with animations (dragon eyes, fire, smoke) | ✅ 697 lines |
| [src/main_menu.c](src/main_menu.c) | Main menu & save select screen | ✅ 230 lines |
| [src/hero_select.c](src/hero_select.c) | Character/hero selection screen | ✅ 148 lines |
| [src/credits.c](src/credits.c) | Credits/ending screen | ✅ Implemented |
| [src/map.menu.c](src/map.menu.c) | In-game map menu system | ✅ Implemented |

#### **UI Components**

| File | Description | Status |
|------|-------------|--------|
| [src/textbox.c](src/textbox.c) | Dialog/message textbox system | ✅ 73 lines |
| [src/text_writer.c](src/text_writer.c) | Text rendering engine | ✅ Implemented |
| [src/battle.c](src/battle.c) | Battle UI and interface | ✅ Implemented |
| [src/stats.c](src/stats.c) | Player stats display | ✅ Implemented |

#### **Core UI Headers**

| File | Description |
|------|-------------|
| [src/title_screen.h](src/title_screen.h) | Title screen definitions |
| [src/main_menu.h](src/main_menu.h) | Main menu definitions |
| [src/hero_select.h](src/hero_select.h) | Hero select definitions |
| [src/textbox.h](src/textbox.h) | Textbox definitions |
| [src/text_writer.h](src/text_writer.h) | Text writer definitions |

---

## 🎮 UI State Management

### **Main Game Loop (src/main.c)**
- **File:** [src/main.c](src/main.c)
- **Purpose:** Main game initialization and state machine
- **Key States:**
  - `GAME_STATE_TITLE` - Title screen
  - `GAME_STATE_MAIN_MENU` - Main menu
  - `GAME_STATE_HERO_SELECT` - Character selection
  - `GAME_STATE_PLAYING` - Gameplay
  - `GAME_STATE_BATTLE` - Combat
  - `GAME_STATE_CREDITS` - Credits

### **Game State Enum**
```c
typedef enum GameState {
  GAME_STATE_TITLE,
  GAME_STATE_HERO_SELECT,
  GAME_STATE_PLAYING,
  GAME_STATE_BATTLE,
  GAME_STATE_CREDITS,
  // ... other states
} GameState;
```

---

## 🎨 UI Assets & Graphics

### **Tile Graphics**
- **Location:** `assets/tiles/`
- **Processed to:** `res/tiles/`
- **Format:** PNG images converted to Game Boy tile format

### **Tilemaps**
- **Location:** `assets/tms_tilemaps/`
- **Purpose:** Screen layouts, menu backgrounds
- **Format:** Tilemap data for background rendering

### **Strings & Text**
- **Location:** `assets/strings.js`
- **Generated:** `data/strings_*.c` files
- **Banks:** Organized by bank (bank00, bank01, etc.)

---

## 📊 UI Screen Flow

```
┌─────────────────┐
│  Title Screen   │ ← src/title_screen.c
│ (Dragon Logo)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Main Menu     │ ← src/main_menu.c
│ - New Game      │
│ - Continue      │
│ - Options       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hero Select    │ ← src/hero_select.c
│ (Choose Hero)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Game Map      │ ← src/map.c + src/map.menu.c
│  (Gameplay)     │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────┐   ┌──────────────┐
│   Battle    │   │  Map Menu    │
│     UI      │   │  - Inventory │
│             │   │  - Stats     │
│             │   │  - Save      │
└─────────────┘   └──────────────┘
```

---

## 🧩 TypeScript UI Prototypes (src-ts/)

The TypeScript version contains UI prototypes and tools:

### **UI Systems (src-ts/)**

| File | Description | Purpose |
|------|-------------|---------|
| [src-ts/core.ts](src-ts/core.ts) | Game core with screen management | Screen states, UI logic |
| [src-ts/textbox.ts](src-ts/textbox.ts) | Textbox system prototype | Dialog rendering |
| [src-ts/battle.ts](src-ts/battle.ts) | Battle UI system | Combat interface |

### **Screen Types (types/index.d.ts)**
```typescript
export type Screen = 
  | "title"
  | "main_menu"
  | "hero_select"
  | "game"
  | "battle"
  | "map_menu"
  | "credits";
```

---

## 🎯 Key UI Components

### **1. Title Screen (src/title_screen.c)**
**Features:**
- Animated dragon eyes
- Fire animation
- Smoke effects
- "Neshacker Presents" intro
- Press Start prompt

**Functions:**
- `init_title_screen()` - Initialize title
- `update_dragon_eyes()` - Animate eyes
- `update_fire_animation()` - Fire effects
- `update_smoke_animation()` - Smoke effects

---

### **2. Main Menu (src/main_menu.c)**
**Features:**
- New Game option
- Continue/Load Game
- Save file selection
- Animated hero sprites
- Cursor navigation

**State Enum:**
```c
typedef enum MainMenuState {
  TITLE,
  SAVE_SELECT,
  HERO_SELECT
} MainMenuState;
```

---

### **3. Hero Select (src/hero_select.c)**
**Features:**
- Multiple hero choices
- Hero stats display
- Selection cursor
- Confirmation prompt

**Layout:**
- Heroes displayed with sprites
- Stats shown on selection
- Color palette changes on selection

---

### **4. Textbox System (src/textbox.c)**
**Features:**
- Sliding window animation
- Text pagination
- Auto-scroll support
- Button prompts

**States:**
```c
typedef enum TextBoxState {
  TEXT_BOX_CLOSED,
  TEXT_BOX_OPENING,
  TEXT_BOX_OPEN,
  TEXT_BOX_CLOSING
} TextBoxState;
```

---

### **5. Map Menu (src/map.menu.c)**
**Features:**
- Inventory management
- Character stats
- Save/Load options
- Equipment screen

---

### **6. Battle UI (src/battle.c)**
**Features:**
- HP/MP bars
- Command menu (Attack, Magic, Item, Flee)
- Damage numbers
- Enemy display
- Turn indicators

---

## 🛠️ Building the UI

### **Compile All Sources**
```batch
# Build everything (UI included)
compile.exe all

# Or using make
make all
```

### **Test UI Screens**
The main.c file has test modes:
```c
typedef enum InitialGameMode {
  GAME_MODE_NORMAL,          // Start from title
  GAME_MODE_HERO_SELECT,     // Jump to hero select
  GAME_MODE_TEST_LEVEL,      // Test game map
  GAME_MODE_TEST_BATTLE,     // Test battle UI
  GAME_MODE_TEST_CREDITS,    // Test credits
} InitialGameMode;
```

Change `initial_mode` in main.c to test specific screens.

---

## 📱 UI File Summary Table

| Component | C Source | Header | TypeScript | Assets |
|-----------|----------|--------|------------|--------|
| Title Screen | title_screen.c | title_screen.h | - | tiles/title/ |
| Main Menu | main_menu.c | main_menu.h | - | tiles/menu/ |
| Hero Select | hero_select.c | hero_select.h | - | tiles/heroes/ |
| Textbox | textbox.c | textbox.h | textbox.ts | - |
| Map Menu | map.menu.c | map.h | - | - |
| Battle UI | battle.c | battle.h | battle.ts | tiles/battle/ |
| Credits | credits.c | credits.h | - | - |
| Text Writer | text_writer.c | text_writer.h | - | - |

---

## 🔍 Finding Specific UI Elements

### **Search by Feature:**

**Title Screen Elements:**
- File: `src/title_screen.c`
- Logo animation: Lines 13-50+
- Fire effects: `init_fire_animation()`, `update_fire_animation()`

**Menu Cursor:**
- File: `src/main_menu.c`
- Sprite: `SPRITE_CURSOR`
- Movement: `cursor` variable

**Dialog/Messages:**
- File: `src/textbox.c`
- Rendering: `text_writer.print()`
- Pagination: `text_writer.next_page()`

**Battle Commands:**
- File: `src/battle.c`
- Command selection UI
- HP/MP display

---

## 🎨 Customizing UI

### **Change Menu Colors:**
Edit palette definitions in respective files:
```c
const palette_color_t menu_palettes[] = {
  RGB8(r, g, b),  // Define colors
  // ...
};
```

### **Modify Text:**
Edit string tables in `assets/strings.js` then rebuild.

### **Change Layouts:**
Modify tilemap files in `assets/tms_tilemaps/`

---

## 📖 Documentation References

- **Core Engine:** [src/core.c](src/core.c), [src/core.h](src/core.h)
- **Main Loop:** [src/main.c](src/main.c)
- **Type Definitions:** [types/index.d.ts](types/index.d.ts)
- **Build System:** [Makefile](Makefile)

---

## ✨ Quick Reference

**Location of all UI menus:**
```
src/
├── title_screen.c      ← Title screen & logo
├── main_menu.c         ← Main menu UI
├── hero_select.c       ← Character selection
├── textbox.c           ← Dialog boxes
├── map.menu.c          ← In-game menu
├── battle.c            ← Battle interface
├── credits.c           ← Credits screen
└── text_writer.c       ← Text rendering

assets/
├── tiles/              ← UI graphics
├── tms_tilemaps/       ← Screen layouts
└── strings.js          ← All text content
```

---

**All UI components are compiled into `LabyrinthOfTheDragon.gbc` when you run:**
```batch
compile.exe all
```

The executable Game Boy ROM contains all UI screens, menus, and graphics ready to run on Game Boy Color hardware or emulators.
