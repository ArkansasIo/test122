/**
 * Example usage of the TypeScript game systems
 * This demonstrates how to use the various game modules
 */

import { initializeGame } from "./src-ts";
import { Item, Monster, Ability } from "./types";

// Initialize the game
console.log("Initializing game...\n");
const game = initializeGame();

// ============================================
// Example 1: Player Management
// ============================================
console.log("=== Player Management Example ===");
const player = game.playerManager.getPlayer();
console.log(`Player: ${player.name} (Level ${player.level})`);
console.log(`HP: ${player.hp}/${player.maxHp}, MP: ${player.mp}/${player.maxMp}`);

// Move player
game.playerManager.move("right");
game.playerManager.move("down");
console.log(`Player position: (${player.x}, ${player.y})`);

// Gain experience
console.log("\nGaining 100 experience...");
const leveledUp = game.playerManager.gainExperience(100);
if (leveledUp) {
  console.log(`Level up! Now level ${player.level}`);
}

// ============================================
// Example 2: Item System
// ============================================
console.log("\n=== Item System Example ===");

// Get a potion
const potion = game.itemManager.getItem(1);
if (potion) {
  console.log(`Found item: ${potion.name} - ${potion.description}`);
  game.playerManager.addItem(potion);
  console.log("Added to inventory");
}

// Get a weapon
const sword = game.itemManager.getItem(11);
if (sword) {
  console.log(`\nFound weapon: ${sword.name} - ${sword.description}`);
  game.playerManager.addItem(sword);
  game.playerManager.equip(sword);
  console.log(`Equipped! Attack power: ${game.playerManager.getAttackPower()}`);
}

// ============================================
// Example 3: Monster System
// ============================================
console.log("\n=== Monster System Example ===");

// Create some monsters
const slime = game.monsterManager.createMonster(1);
const goblin = game.monsterManager.createMonster(2, player.level);

if (slime && goblin) {
  console.log(`Encountered ${slime.name} (Level ${slime.level})`);
  console.log(`Encountered ${goblin.name} (Level ${goblin.level})`);
}

// ============================================
// Example 4: Battle System
// ============================================
console.log("\n=== Battle System Example ===");

if (slime) {
  // Start a battle
  game.battleSystem.startBattle([slime]);
  
  console.log("Battle started!");
  console.log(`${player.name} vs ${slime.name}`);
  console.log(`Player HP: ${player.hp}/${player.maxHp}`);
  console.log(`Enemy HP: ${slime.hp}/${slime.maxHp}`);

  // Player attacks
  console.log("\n--- Turn 1 ---");
  game.battleSystem.executeAction({
    type: "attack",
    source: player,
    target: slime,
  });

  // Enemy attacks back (if still alive)
  if (slime.hp > 0) {
    const enemyAction = game.battleSystem.getEnemyAction(slime);
    game.battleSystem.executeAction(enemyAction);
  }

  console.log(`Player HP: ${player.hp}/${player.maxHp}`);
  console.log(`Enemy HP: ${slime.hp}/${slime.maxHp}`);
}

// ============================================
// Example 5: Ability System
// ============================================
console.log("\n=== Ability System Example ===");

// Learn an ability
const fireball = game.abilityManager.getAbility(1);
if (fireball) {
  console.log(`Learning ability: ${fireball.name}`);
  console.log(`  ${fireball.description}`);
  console.log(`  MP Cost: ${fireball.mpCost}, Power: ${fireball.power}`);
  game.playerManager.learnAbility(fireball);
}

// List player abilities
console.log("\nPlayer abilities:");
for (const ability of player.abilities) {
  console.log(`  - ${ability.name} (${ability.mpCost} MP)`);
}

// ============================================
// Example 6: Map System
// ============================================
console.log("\n=== Map System Example ===");

const currentFloor = game.mapManager.getCurrentFloor();
if (currentFloor) {
  console.log(`Current floor: ${currentFloor.name}`);
  console.log(`Size: ${currentFloor.width}x${currentFloor.height}`);
  console.log(`Entities: ${currentFloor.entities.length}`);
  console.log(`Encounter zones: ${currentFloor.encounters.length}`);

  // Check a tile
  game.playerManager.setPosition(5, 5);
  const tile = game.mapManager.getTile(5, 5);
  const walkable = game.mapManager.isWalkable(5, 5);
  console.log(`\nTile at (5, 5): ${tile} (walkable: ${walkable})`);

  // Check for entities
  const entity = game.mapManager.getEntityAt(10, 9);
  if (entity) {
    console.log(`Found entity: ${entity.type} at (${entity.x}, ${entity.y})`);
  }
}

// ============================================
// Example 7: Textbox System
// ============================================
console.log("\n=== Textbox System Example ===");

game.dialogueManager.startDialogue(
  [
    "Welcome to Labyrinth of the Dragon!",
    "This is an example dialogue.",
    "Press A to continue...",
  ],
  () => {
    console.log("Dialogue complete!");
  }
);

// Simulate advancing through dialogue
console.log("Showing dialogue...");
game.textBoxManager.showText("Hello, adventurer!");
console.log(`Text visible: ${game.textBoxManager.getVisibleText()}`);

// ============================================
// Example 8: Save System
// ============================================
console.log("\n=== Save System Example ===");

// Save game
const gameState = game.engine.getGameState();
game.saveManager.saveGame(1, gameState, player);
console.log("Game saved to slot 1");

// Check save info
const saveInfo = game.saveManager.getSaveInfo(1);
if (saveInfo) {
  console.log(`Save timestamp: ${new Date(saveInfo.timestamp).toLocaleString()}`);
  console.log(`Playtime: ${Math.floor(saveInfo.playtime / 1000)} seconds`);
}

// List all saves
console.log("\nAll save slots:");
const allSaves = game.saveManager.getAllSaveInfo();
for (const save of allSaves) {
  if (save.info) {
    console.log(`  Slot ${save.slot}: ${new Date(save.info.timestamp).toLocaleString()}`);
  } else {
    console.log(`  Slot ${save.slot}: Empty`);
  }
}

// ============================================
// Example 9: Utility Functions
// ============================================
console.log("\n=== Utility Functions Example ===");

import {
  clamp,
  randomInt,
  formatTime,
  distance,
  percentage,
} from "./src-ts/utils";

console.log(`Clamp 150 to 0-100: ${clamp(150, 0, 100)}`);
console.log(`Random int between 1-10: ${randomInt(1, 10)}`);
console.log(`Format 125000ms: ${formatTime(125000)}`);
console.log(`Distance from (0,0) to (3,4): ${distance(0, 0, 3, 4)}`);
console.log(`HP percentage: ${percentage(player.hp, player.maxHp).toFixed(2)}%`);

// ============================================
// Summary
// ============================================
console.log("\n===========================================");
console.log("Example completed!");
console.log("Check the TYPESCRIPT_README.md for more information");
console.log("===========================================");
