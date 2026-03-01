/**
 * Main entry point for Labyrinth of the Dragon
 */

import { initializeGame } from "./src-ts";

console.log("===========================================");
console.log("  Labyrinth of the Dragon - TypeScript  ");
console.log("===========================================\n");

// Initialize game systems
const game = initializeGame();

// Start the game engine
game.engine.initialize();

// Example: Show title screen
console.log("\nGame ready!");
console.log("Use the game engine to start the game loop:");
console.log("  game.engine.start()");

// Export game instance for external use
export { game };

// If running as a standalone script
if (require.main === module) {
  console.log("\nStarting game...");
  game.engine.setScreen("title");
  game.engine.start();
}
