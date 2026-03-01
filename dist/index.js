"use strict";
/**
 * Main entry point for game modules
 * Re-exports all game systems
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeGame = initializeGame;
__exportStar(require("./core"), exports);
__exportStar(require("./player"), exports);
__exportStar(require("./battle"), exports);
__exportStar(require("./monster"), exports);
__exportStar(require("./item"), exports);
__exportStar(require("./ability"), exports);
__exportStar(require("./map"), exports);
__exportStar(require("./textbox"), exports);
__exportStar(require("./save"), exports);
__exportStar(require("./utils"), exports);
// Import managers for convenience
const core_1 = require("./core");
const player_1 = require("./player");
const battle_1 = require("./battle");
const monster_1 = require("./monster");
const item_1 = require("./item");
const ability_1 = require("./ability");
const map_1 = require("./map");
const textbox_1 = require("./textbox");
const save_1 = require("./save");
/**
 * Initialize all game systems
 */
function initializeGame() {
    console.log("Initializing game systems...");
    // Create managers
    const engine = new core_1.GameEngine();
    const playerManager = new player_1.PlayerManager(engine.getGameState().player);
    const battleSystem = new battle_1.BattleSystem(playerManager);
    const monsterManager = new monster_1.MonsterManager();
    const itemManager = new item_1.ItemManager();
    const abilityManager = new ability_1.AbilityManager();
    const mapManager = new map_1.MapManager();
    const textBoxManager = new textbox_1.TextBoxManager();
    const dialogueManager = new textbox_1.DialogueManager(textBoxManager);
    const saveManager = new save_1.SaveManager();
    // Load default data
    (0, monster_1.loadDefaultMonsters)(monsterManager);
    (0, item_1.loadDefaultItems)(itemManager);
    (0, ability_1.loadDefaultAbilities)(abilityManager);
    // Load test floor
    const testFloor = (0, map_1.createTestFloor)();
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
//# sourceMappingURL=index.js.map