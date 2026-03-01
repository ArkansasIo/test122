/**
 * Game Engine - Main controller for Labyrinth of the Dragon
 * Integrates all game systems
 */

import { QuestSystem } from './quest';
import { Inventory } from './inventory';
import { DialogueSystem } from './dialogue';
import { ShopSystem } from './shop';
import { PartySystem } from './party';
import { StatusEffectSystem } from './status-effects';
import { LootSystem } from './loot';

export interface GameState {
  currentFloor: number;
  currentRoom: string;
  gameTime: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  playTime: number;
  saveName: string;
  lastSaveTime: number;
}

export class GameEngine {
  // Core systems
  public questSystem: QuestSystem;
  public inventory: Inventory;
  public dialogueSystem: DialogueSystem;
  public shopSystem: ShopSystem;
  public partySystem: PartySystem;
  public statusEffectSystem: StatusEffectSystem;
  public lootSystem: LootSystem;

  // Game state
  public gameState: GameState;
  private isPaused: boolean;
  private isInBattle: boolean;

  constructor() {
    // Initialize all systems
    this.questSystem = new QuestSystem();
    this.inventory = new Inventory();
    this.dialogueSystem = new DialogueSystem();
    this.shopSystem = new ShopSystem();
    this.partySystem = new PartySystem();
    this.statusEffectSystem = new StatusEffectSystem();
    this.lootSystem = new LootSystem();

    // Initialize game state
    this.gameState = {
      currentFloor: 1,
      currentRoom: 'entrance',
      gameTime: 0,
      difficulty: 'normal',
      playTime: 0,
      saveName: 'autosave',
      lastSaveTime: Date.now()
    };

    this.isPaused = false;
    this.isInBattle = false;
  }

  /**
   * Initialize a new game
   */
  newGame(saveName: string, difficulty: 'easy' | 'normal' | 'hard' | 'nightmare' = 'normal'): void {
    this.gameState.saveName = saveName;
    this.gameState.difficulty = difficulty;
    this.gameState.currentFloor = 1;
    this.gameState.currentRoom = 'entrance';
    this.gameState.playTime = 0;
    this.gameState.gameTime = 0;

    console.log(`New game started: ${saveName} (${difficulty})`);
  }

  /**
   * Main game update loop
   */
  update(deltaTime: number): void {
    if (this.isPaused) return;

    this.gameState.playTime += deltaTime;
    this.gameState.gameTime += deltaTime;

    // Update turn-based status effects
    if (!this.isInBattle) {
      // Process status effects for all party members
      const party = this.partySystem.getActiveParty();
      for (const member of party) {
        this.statusEffectSystem.processTurn(member.id);
      }
    }

    // Auto-save every 5 minutes
    if (this.gameState.playTime - this.gameState.lastSaveTime > 300000) {
      this.autoSave();
    }
  }

  /**
   * Move to a new room/area
   */
  moveToRoom(roomId: string): void {
    console.log(`Moving to room: ${roomId}`);
    this.gameState.currentRoom = roomId;

    // Trigger room events (encounters, treasure, etc.)
    this.triggerRoomEvents(roomId);
  }

  /**
   * Move to a new floor
   */
  moveToFloor(floor: number): void {
    console.log(`Descending to floor ${floor}`);
    this.gameState.currentFloor = floor;
    this.gameState.currentRoom = 'entrance';

    // Heal party on floor transition
    this.partySystem.healParty();
  }

  /**
   * Trigger events when entering a room
   */
  private triggerRoomEvents(roomId: string): void {
    // Random encounter check
    if (Math.random() < 0.3) {
      this.triggerEncounter();
    }

    // Check for treasure chests
    const chests = this.lootSystem.getChestsInLocation(roomId);
    if (chests.length > 0) {
      console.log(`Found ${chests.length} treasure chest(s) in this room!`);
    }
  }

  /**
   * Trigger a random encounter
   */
  private triggerEncounter(): void {
    const floor = this.gameState.currentFloor;
    const partyLevel = this.partySystem.getAverageLevel();

    console.log(`Encounter! (Floor ${floor}, Party Lvl ${partyLevel})`);
    this.isInBattle = true;

    // Battle logic would go here
    // For now, just simulate and end it
    setTimeout(() => {
      this.endBattle(true);
    }, 1000);
  }

  /**
   * End current battle
   */
  endBattle(victory: boolean): void {
    this.isInBattle = false;

    if (victory) {
      // Award experience
      const expReward = this.gameState.currentFloor * 100;
      this.partySystem.distributeExperience(expReward);

      // Generate loot
      const loot = this.lootSystem.generateMonsterLoot(
        this.gameState.currentFloor + 5,
        false
      );

      console.log(`Victory! Gained ${expReward} EXP and ${loot.gold} gold`);

      // Add loot to inventory
      for (const drop of loot.items) {
        this.inventory.addItem(drop.item, drop.quantity);
      }
    } else {
      console.log('Defeated! Game Over');
      // Handle game over
    }
  }

  /**
   * Rest at an inn or safe location
   */
  rest(hours: number = 8): void {
    console.log(`Resting for ${hours} hours...`);

    // Heal party
    this.partySystem.healParty();
    this.partySystem.reviveParty();

    // Clear negative status effects
    const party = this.partySystem.getActiveParty();
    for (const member of party) {
      this.statusEffectSystem.clearEffects(member.id, true);
    }

    // Advance game time
    this.gameState.gameTime += hours * 3600;

    console.log('Party fully restored!');
  }

  /**
   * Interact with NPC
   */
  talkToNPC(npcId: string): boolean {
    return this.dialogueSystem.startDialogue(npcId);
  }

  /**
   * Open shop
   */
  visitShop(shopId: string): boolean {
    return this.shopSystem.openShop(shopId);
  }

  /**
   * Use item from inventory
   */
  useItem(itemId: string, _targetMemberId?: string): boolean {
    const item = this.inventory.getItem(itemId);
    if (!item) {
      console.error('Item not found');
      return false;
    }

    // Handle item usage based on type
    // This is simplified - actual implementation would be more complex
    console.log(`Using ${item.name}`);

    // Remove item from inventory if consumable
    if (item.slot === 'consumable') {
      this.inventory.removeItem(itemId, 1);
    }

    return true;
  }

  /**
   * Pause game
   */
  pause(): void {
    this.isPaused = true;
    console.log('Game paused');
  }

  /**
   * Resume game
   */
  resume(): void {
    this.isPaused = false;
    console.log('Game resumed');
  }

  /**
   * Check if game is paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Save game
   */
  saveGame(): string {
    const saveData = {
      gameState: this.gameState,
      questSystem: this.questSystem.serialize(),
      inventory: this.inventory.serialize(),
      shopSystem: this.shopSystem.serialize(),
      partySystem: this.partySystem.serialize(),
      statusEffectSystem: this.statusEffectSystem.serialize(),
      lootSystem: this.lootSystem.serialize(),
      timestamp: Date.now()
    };

    this.gameState.lastSaveTime = saveData.timestamp;

    const saveString = JSON.stringify(saveData);
    console.log(`Game saved: ${this.gameState.saveName}`);

    return saveString;
  }

  /**
   * Load game from save data
   */
  loadGame(saveString: string): boolean {
    try {
      const saveData = JSON.parse(saveString);

      // Restore game state
      this.gameState = saveData.gameState;

      // Restore all systems
      this.questSystem.deserialize(saveData.questSystem);
      this.inventory.deserialize(saveData.inventory);
      this.shopSystem.deserialize(saveData.shopSystem);
      this.partySystem.deserialize(saveData.partySystem);
      this.statusEffectSystem.deserialize(saveData.statusEffectSystem);
      this.lootSystem.deserialize(saveData.lootSystem);

      console.log(`Game loaded: ${this.gameState.saveName}`);
      return true;
    } catch (error) {
      console.error('Failed to load save data:', error);
      return false;
    }
  }

  /**
   * Auto-save game
   */
  private autoSave(): void {
    this.saveGame();
    // In a real implementation, this would write to localStorage or file
    console.log('Auto-save completed');
  }

  /**
   * Get game statistics
   */
  getStatistics(): {
    playTime: string;
    currentFloor: number;
    partyLevel: number;
    questsCompleted: number;
    chestsOpened: number;
  } {
    const hours = Math.floor(this.gameState.playTime / 3600000);
    const minutes = Math.floor((this.gameState.playTime % 3600000) / 60000);

    return {
      playTime: `${hours}h ${minutes}m`,
      currentFloor: this.gameState.currentFloor,
      partyLevel: this.partySystem.getAverageLevel(),
      questsCompleted: this.questSystem.getActiveQuests().length,
      chestsOpened: 0 // Would track this separately
    };
  }
}

// Export singleton instance
export const gameEngine = new GameEngine();
