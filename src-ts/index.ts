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

// Import managers for convenience
import { GameEngine } from "./core";
import { PlayerManager } from "./player";
import { BattleSystem } from "./battle";
import { MonsterManager, loadDefaultMonsters } from "./monster";
import { ItemManager, loadDefaultItems } from "./item";
import { AbilityManager, loadDefaultAbilities } from "./ability";
import { MapManager, createTestFloor } from "./map";
import { TextBoxManager, DialogueManager } from "./textbox";
import { SaveManager } from "./save";

/**
 * Initialize all game systems
 */
export function initializeGame() {
  console.log("Initializing game systems...");

  // Create managers
  const engine = new GameEngine();
  const playerManager = new PlayerManager(engine.getGameState().player);
  const battleSystem = new BattleSystem(playerManager);
  const monsterManager = new MonsterManager();
  const itemManager = new ItemManager();
  const abilityManager = new AbilityManager();
  const mapManager = new MapManager();
  const textBoxManager = new TextBoxManager();
  const dialogueManager = new DialogueManager(textBoxManager);
  const saveManager = new SaveManager();

  // Load default data
  loadDefaultMonsters(monsterManager);
  loadDefaultItems(itemManager);
  loadDefaultAbilities(abilityManager);

  // Load test floor
  const testFloor = createTestFloor();
  mapManager.registerFloor(testFloor);
  mapManager.loadFloor(1);

  console.log("Game systems initialized");

  return {
    engine,
    playerManager,
    battleSystem,
    monsterManager,
    itemManager,
    abilityManager,
    mapManager,
    textBoxManager,
    dialogueManager,
    saveManager,
  };
}
