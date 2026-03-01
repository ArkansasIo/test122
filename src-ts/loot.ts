/**
 * Treasure and Loot System
 */

import { InventoryItem } from './inventory';

export enum LootRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  UNIQUE = 'unique'
}

export interface LootTableEntry {
  itemId: string;
  weight: number; // Higher weight = higher chance
  minQuantity: number;
  maxQuantity: number;
  rarity: LootRarity;
  condition?: () => boolean; // Optional condition for drop
}

export interface LootTable {
  id: string;
  name: string;
  entries: LootTableEntry[];
  goldMin: number;
  goldMax: number;
  guaranteedDrops: string[]; // Item IDs that always drop
}

export interface TreasureChest {
  id: string;
  location: string;
  isLocked: boolean;
  lockLevel: number; // 0-10, higher = harder to pick
  keyRequired?: string;
  lootTable: string;
  isOpened: boolean;
  isMimic: boolean; // Surprise!
  mimicLevel?: number;
}

export class LootSystem {
  private lootTables: Map<string, LootTable>;
  private chests: Map<string, TreasureChest>;
  private itemDatabase: Map<string, InventoryItem>;
  private openedChests: Set<string>;

  constructor() {
    this.lootTables = new Map();
    this.chests = new Map();
    this.itemDatabase = new Map();
    this.openedChests = new Set();
  }

  /**
   * Register a loot table
   */
  registerLootTable(table: LootTable): void {
    this.lootTables.set(table.id, table);
  }

  /**
   * Register an item in the database
   */
  registerItem(item: InventoryItem): void {
    this.itemDatabase.set(item.id, item);
  }

  /**
   * Register a treasure chest
   */
  registerChest(chest: TreasureChest): void {
    this.chests.set(chest.id, chest);
  }

  /**
   * Generate loot from a loot table
   */
  generateLoot(tableId: string): {
    items: { item: InventoryItem; quantity: number }[];
    gold: number;
  } {
    const table = this.lootTables.get(tableId);
    if (!table) {
      console.error(`Loot table ${tableId} not found`);
      return { items: [], gold: 0 };
    }

    const items: { item: InventoryItem; quantity: number }[] = [];

    // Add guaranteed drops
    for (const itemId of table.guaranteedDrops) {
      const item = this.itemDatabase.get(itemId);
      if (item) {
        items.push({ item, quantity: 1 });
      }
    }

    // Calculate total weight
    const eligibleEntries = table.entries.filter(
      entry => !entry.condition || entry.condition()
    );

    if (eligibleEntries.length > 0) {
      const totalWeight = eligibleEntries.reduce((sum, entry) => sum + entry.weight, 0);

      // Roll for random drops
      const roll = Math.random() * totalWeight;
      let currentWeight = 0;

      for (const entry of eligibleEntries) {
        currentWeight += entry.weight;
        if (roll <= currentWeight) {
          const item = this.itemDatabase.get(entry.itemId);
          if (item) {
            const quantity = Math.floor(
              Math.random() * (entry.maxQuantity - entry.minQuantity + 1) + entry.minQuantity
            );
            items.push({ item, quantity });
          }
          break;
        }
      }
    }

    // Generate random gold amount
    const gold = Math.floor(
      Math.random() * (table.goldMax - table.goldMin + 1) + table.goldMin
    );

    return { items, gold };
  }

  /**
   * Open a treasure chest
   */
  openChest(chestId: string, hasKey?: boolean, lockpickSkill: number = 0): {
    success: boolean;
    message: string;
    loot?: { items: { item: InventoryItem; quantity: number }[]; gold: number };
    isMimic: boolean;
  } {
    const chest = this.chests.get(chestId);
    if (!chest) {
      return { success: false, message: 'Chest not found', isMimic: false };
    }

    if (this.openedChests.has(chestId) || chest.isOpened) {
      return { success: false, message: 'Chest is already empty', isMimic: false };
    }

    // Check if it's a mimic
    if (chest.isMimic) {
      return {
        success: false,
        message: `The chest was a mimic! Level ${chest.mimicLevel || 1} enemy attacks!`,
        isMimic: true
      };
    }

    // Check if locked
    if (chest.isLocked) {
      // Try using key
      if (chest.keyRequired && hasKey) {
        // Key opens the chest
        chest.isLocked = false;
      }
      // Try lockpicking
      else {
        const pickChance = Math.max(0, (lockpickSkill - chest.lockLevel * 10) / 100);
        if (Math.random() > pickChance) {
          return {
            success: false,
            message: `Failed to pick the lock (Level ${chest.lockLevel})`,
            isMimic: false
          };
        }
        chest.isLocked = false;
      }
    }

    // Generate loot
    const loot = this.generateLoot(chest.lootTable);
    chest.isOpened = true;
    this.openedChests.add(chestId);

    return {
      success: true,
      message: `Opened ${chest.id}!`,
      loot,
      isMimic: false
    };
  }

  /**
   * Generate monster loot drop
   */
  generateMonsterLoot(
    monsterLevel: number,
    isBoss: boolean = false
  ): { items: { item: InventoryItem; quantity: number }[]; gold: number } {
    // Calculate gold based on monster level
    const baseGold = monsterLevel * 10;
    const goldVariance = Math.floor(baseGold * 0.5);
    const gold = Math.floor(
      Math.random() * (goldVariance * 2 + 1) + (baseGold - goldVariance)
    );

    // Boss multiplier
    const multiplier = isBoss ? 5 : 1;

    const items: { item: InventoryItem; quantity: number }[] = [];

    // Chance to drop items based on level
    const dropChance = Math.min(0.3 + monsterLevel * 0.02, 0.8);

    if (Math.random() < dropChance) {
      // Select appropriate loot table based on monster level
      const tableId = this.selectLootTableByLevel(monsterLevel);
      if (tableId) {
        const loot = this.generateLoot(tableId);
        items.push(...loot.items);
      }
    }

    return {
      items,
      gold: gold * multiplier
    };
  }

  /**
   * Select appropriate loot table based on level
   */
  private selectLootTableByLevel(level: number): string | null {
    // This should be customized based on your game
    if (level <= 5) return 'common_loot';
    if (level <= 10) return 'uncommon_loot';
    if (level <= 20) return 'rare_loot';
    if (level <= 30) return 'epic_loot';
    return 'legendary_loot';
  }

  /**
   * Create a basic loot table (helper function)
   */
  static createBasicLootTable(
    id: string,
    name: string,
    itemIds: string[],
    rarityWeights: { [key in LootRarity]: number }
  ): LootTable {
    const entries: LootTableEntry[] = itemIds.map(itemId => {
      // Assign rarity randomly weighted
      const rarities = Object.keys(rarityWeights) as LootRarity[];
      const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
      
      let roll = Math.random() * totalWeight;
      let rarity: LootRarity = LootRarity.COMMON;
      
      for (const r of rarities) {
        roll -= rarityWeights[r];
        if (roll <= 0) {
          rarity = r;
          break;
        }
      }

      // Weight inversely proportional to rarity
      const rarityWeightMap: { [key in LootRarity]: number } = {
        [LootRarity.COMMON]: 100,
        [LootRarity.UNCOMMON]: 50,
        [LootRarity.RARE]: 20,
        [LootRarity.EPIC]: 5,
        [LootRarity.LEGENDARY]: 1,
        [LootRarity.UNIQUE]: 0.5
      };

      return {
        itemId,
        weight: rarityWeightMap[rarity],
        minQuantity: 1,
        maxQuantity: rarity === LootRarity.COMMON ? 3 : 1,
        rarity
      };
    });

    return {
      id,
      name,
      entries,
      goldMin: 10,
      goldMax: 100,
      guaranteedDrops: []
    };
  }

  /**
   * Get rarity color for UI
   */
  static getRarityColor(rarity: LootRarity): string {
    const colors: { [key in LootRarity]: string } = {
      [LootRarity.COMMON]: '#FFFFFF',
      [LootRarity.UNCOMMON]: '#1EFF00',
      [LootRarity.RARE]: '#0070DD',
      [LootRarity.EPIC]: '#A335EE',
      [LootRarity.LEGENDARY]: '#FF8000',
      [LootRarity.UNIQUE]: '#E6CC80'
    };
    return colors[rarity];
  }

  /**
   * Reset chest (for respawning)
   */
  resetChest(chestId: string): void {
    const chest = this.chests.get(chestId);
    if (chest) {
      chest.isOpened = false;
      chest.isLocked = true;
      this.openedChests.delete(chestId);
    }
  }

  /**
   * Get all chests in location
   */
  getChestsInLocation(location: string): TreasureChest[] {
    return Array.from(this.chests.values()).filter(
      chest => chest.location === location
    );
  }

  /**
   * Serialize loot system for saving
   */
  serialize(): string {
    const data = {
      openedChests: Array.from(this.openedChests),
      chestStates: Array.from(this.chests.entries()).map(([id, chest]) => ({
        id,
        isOpened: chest.isOpened,
        isLocked: chest.isLocked
      }))
    };
    return JSON.stringify(data);
  }

  /**
   * Restore loot system from save
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.openedChests = new Set(parsed.openedChests);

    for (const chestData of parsed.chestStates) {
      const chest = this.chests.get(chestData.id);
      if (chest) {
        chest.isOpened = chestData.isOpened;
        chest.isLocked = chestData.isLocked;
      }
    }
  }
}
