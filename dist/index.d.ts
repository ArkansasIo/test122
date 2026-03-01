/**
 * Main entry point for game modules
 * Re-exports all game systems
 */
export * from "./core";
export * from "./player";
export * from "./battle";
export * from "./monster";
export * from "./item";
export * from "./ability";
export * from "./map";
export * from "./textbox";
export * from "./save";
export * from "./utils";
import { GameEngine } from "./core";
import { PlayerManager } from "./player";
import { BattleSystem } from "./battle";
import { MonsterManager } from "./monster";
import { ItemManager } from "./item";
import { AbilityManager } from "./ability";
import { MapManager } from "./map";
import { TextBoxManager, DialogueManager } from "./textbox";
import { SaveManager } from "./save";
/**
 * Initialize all game systems
 */
export declare function initializeGame(): {
    engine: GameEngine;
    playerManager: PlayerManager;
    battleSystem: BattleSystem;
    monsterManager: MonsterManager;
    itemManager: ItemManager;
    abilityManager: AbilityManager;
    mapManager: MapManager;
    textBoxManager: TextBoxManager;
    dialogueManager: DialogueManager;
    saveManager: SaveManager;
};
