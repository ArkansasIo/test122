/**
 * Type definitions for Labyrinth of the Dragon
 * Game Boy Color RPG Game Types
 */

// Global game constants
declare const GAME_VERSION = "1.0.0";
declare const SCREEN_WIDTH = 160;
declare const SCREEN_HEIGHT = 144;
declare const TILE_SIZE = 8;

// Bank management
export type BankNumber = number; // 0-31 for Game Boy Color

export interface BankData {
  bankNumber: BankNumber;
  dataStart: number;
  dataEnd: number;
  isLoaded: boolean;
}

// Player types
export interface Player {
  id: number;
  name: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  luck: number;
  x: number;
  y: number;
  direction: Direction;
  abilities: Ability[];
  items: Item[];
  equipment: Equipment;
}

export type Direction = "up" | "down" | "left" | "right";

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  accessory?: Item;
}

// Battle system types
export interface BattleState {
  isActive: boolean;
  turn: number;
  player: Player;
  enemies: Monster[];
  currentAction?: BattleAction;
  turnOrder: Combatant[];
}

export interface BattleAction {
  type: "attack" | "ability" | "item" | "defend" | "flee";
  source: Combatant;
  target?: Combatant;
  abilityId?: number;
  itemId?: number;
}

export type Combatant = Player | Monster;

export interface BattleEffect {
  id: number;
  name: string;
  type: "damage" | "heal" | "buff" | "debuff" | "status";
  power: number;
  element?: Element;
  targetType: "single" | "all" | "self";
  animation?: string;
}

export type Element = "fire" | "water" | "earth" | "wind" | "light" | "dark" | "neutral";

// Monster types
export interface Monster {
  id: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  experience: number;
  gold: number;
  sprite: number;
  abilities: number[];
  drops: ItemDrop[];
  element?: Element;
}

export interface ItemDrop {
  itemId: number;
  chance: number; // 0-100
}

// Item types
export interface Item {
  id: number;
  name: string;
  description: string;
  type: ItemType;
  value: number;
  effect?: ItemEffect;
  usableInBattle: boolean;
  usableInField: boolean;
  equipType?: EquipType;
  statModifiers?: StatModifiers;
}

export type ItemType = "consumable" | "weapon" | "armor" | "accessory" | "key" | "quest";

export type EquipType = "weapon" | "armor" | "accessory";

export interface ItemEffect {
  type: "heal_hp" | "heal_mp" | "cure_status" | "buff" | "damage";
  power: number;
  target: "self" | "single" | "all";
}

export interface StatModifiers {
  attack?: number;
  defense?: number;
  speed?: number;
  intelligence?: number;
  luck?: number;
  maxHp?: number;
  maxMp?: number;
}

// Ability types
export interface Ability {
  id: number;
  name: string;
  description: string;
  mpCost: number;
  power: number;
  accuracy: number;
  element?: Element;
  effect?: BattleEffect;
  targetType: "single" | "all" | "self";
  animation?: string;
}

// Map and floor types
export interface Floor {
  id: number;
  name: string;
  width: number;
  height: number;
  tiles: number[][];
  entities: Entity[];
  encounters: Encounter[];
  music?: number;
  palette: number;
}

export interface Entity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  sprite: number;
  data?: Record<string, unknown>;
  isInteractable: boolean;
  onInteract?: () => void;
}

export type EntityType = "npc" | "chest" | "door" | "stairs" | "sign" | "trap" | "trigger";

export interface Encounter {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  monsterGroups: MonsterGroup[];
  encounterRate: number; // 0-255
}

export interface MonsterGroup {
  monsters: number[]; // Monster IDs
  weight: number; // Probability weight
}

// Map menu types
export interface MapMenu {
  isOpen: boolean;
  selectedOption: number;
  options: MapMenuOption[];
}

export interface MapMenuOption {
  label: string;
  action: () => void;
  isEnabled: boolean;
}

// Textbox types
export interface TextBox {
  isVisible: boolean;
  text: string;
  currentChar: number;
  speed: number;
  isComplete: boolean;
  hasMore: boolean;
  callback?: () => void;
}

// Graphics types
export interface Palette {
  id: number;
  colors: Color[];
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Sprite {
  id: number;
  width: number;
  height: number;
  tiles: number[];
  palette: number;
}

// Sound types
export interface SoundEffect {
  id: number;
  channel: number;
  frequency: number;
  duration: number;
  volume: number;
}

export interface Music {
  id: number;
  tempo: number;
  tracks: MusicTrack[];
}

export interface MusicTrack {
  channel: number;
  notes: Note[];
}

export interface Note {
  frequency: number;
  duration: number;
  volume: number;
}

// Game state types
export interface GameState {
  isRunning: boolean;
  currentScreen: Screen;
  player: Player;
  currentFloor: number;
  flags: Map<string, boolean>;
  variables: Map<string, number>;
  inventory: Item[];
  gold: number;
  playtime: number;
}

export type Screen = "title" | "main_menu" | "hero_select" | "game" | "battle" | "credits";

// Save/Load types
export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  player: Player;
  flags: Record<string, boolean>;
  variables: Record<string, number>;
}

// String table types
export interface StringTable {
  [key: string]: string;
}

// Asset types
export interface AssetManifest {
  sprites: Record<string, string>;
  tiles: Record<string, string>;
  maps: Record<string, string>;
  sounds: Record<string, string>;
  music: Record<string, string>;
}
