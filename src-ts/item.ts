/**
 * Item management system
 */

import { Item, ItemType } from "../types";

export class ItemManager {
  private items: Map<number, Item> = new Map();

  /**
   * Register an item type
   */
  public registerItem(item: Item): void {
    this.items.set(item.id, item);
  }

  /**
   * Get item by ID
   */
  public getItem(itemId: number): Item | null {
    const item = this.items.get(itemId);
    return item ? { ...item } : null;
  }

  /**
   * Get all items
   */
  public getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  /**
   * Get items by type
   */
  public getItemsByType(type: ItemType): Item[] {
    return this.getAllItems().filter(item => item.type === type);
  }

  /**
   * Create item instance
   */
  public createItem(itemId: number): Item | null {
    return this.getItem(itemId);
  }
}

/**
 * Load default items
 */
export function loadDefaultItems(manager: ItemManager): void {
  // Consumables
  manager.registerItem({
    id: 1,
    name: "Potion",
    description: "Restores 30 HP",
    type: "consumable",
    value: 10,
    effect: {
      type: "heal_hp",
      power: 30,
      target: "self",
    },
    usableInBattle: true,
    usableInField: true,
  });

  manager.registerItem({
    id: 2,
    name: "Ether",
    description: "Restores 20 MP",
    type: "consumable",
    value: 15,
    effect: {
      type: "heal_mp",
      power: 20,
      target: "self",
    },
    usableInBattle: true,
    usableInField: true,
  });

  manager.registerItem({
    id: 3,
    name: "Hi-Potion",
    description: "Restores 60 HP",
    type: "consumable",
    value: 30,
    effect: {
      type: "heal_hp",
      power: 60,
      target: "self",
    },
    usableInBattle: true,
    usableInField: true,
  });

  manager.registerItem({
    id: 4,
    name: "Hi-Ether",
    description: "Restores 40 MP",
    type: "consumable",
    value: 45,
    effect: {
      type: "heal_mp",
      power: 40,
      target: "self",
    },
    usableInBattle: true,
    usableInField: true,
  });

  manager.registerItem({
    id: 5,
    name: "Elixir",
    description: "Fully restores HP and MP",
    type: "consumable",
    value: 100,
    effect: {
      type: "heal_hp",
      power: 9999,
      target: "self",
    },
    usableInBattle: true,
    usableInField: true,
  });

  // Weapons
  manager.registerItem({
    id: 10,
    name: "Rusty Sword",
    description: "A worn-out sword",
    type: "weapon",
    value: 50,
    usableInBattle: false,
    usableInField: false,
    equipType: "weapon",
    statModifiers: {
      attack: 5,
    },
  });

  manager.registerItem({
    id: 11,
    name: "Bone Sword",
    description: "Sword made from monster bones",
    type: "weapon",
    value: 100,
    usableInBattle: false,
    usableInField: false,
    equipType: "weapon",
    statModifiers: {
      attack: 10,
    },
  });

  manager.registerItem({
    id: 12,
    name: "Steel Sword",
    description: "A well-crafted steel blade",
    type: "weapon",
    value: 200,
    usableInBattle: false,
    usableInField: false,
    equipType: "weapon",
    statModifiers: {
      attack: 20,
    },
  });

  manager.registerItem({
    id: 13,
    name: "Flame Sword",
    description: "A blade imbued with fire magic",
    type: "weapon",
    value: 500,
    usableInBattle: false,
    usableInField: false,
    equipType: "weapon",
    statModifiers: {
      attack: 35,
      intelligence: 5,
    },
  });

  // Armor
  manager.registerItem({
    id: 20,
    name: "Leather Armor",
    description: "Basic leather protection",
    type: "armor",
    value: 75,
    usableInBattle: false,
    usableInField: false,
    equipType: "armor",
    statModifiers: {
      defense: 5,
    },
  });

  manager.registerItem({
    id: 21,
    name: "Chain Mail",
    description: "Interlocked metal rings",
    type: "armor",
    value: 150,
    usableInBattle: false,
    usableInField: false,
    equipType: "armor",
    statModifiers: {
      defense: 12,
    },
  });

  manager.registerItem({
    id: 22,
    name: "Steel Plate",
    description: "Heavy steel armor",
    type: "armor",
    value: 300,
    usableInBattle: false,
    usableInField: false,
    equipType: "armor",
    statModifiers: {
      defense: 25,
      speed: -2,
    },
  });

  manager.registerItem({
    id: 23,
    name: "Dragon Scale Mail",
    description: "Armor made from dragon scales",
    type: "armor",
    value: 800,
    usableInBattle: false,
    usableInField: false,
    equipType: "armor",
    statModifiers: {
      defense: 40,
      maxHp: 20,
    },
  });

  // Accessories
  manager.registerItem({
    id: 30,
    name: "Magic Staff",
    description: "Enhances magical abilities",
    type: "accessory",
    value: 250,
    usableInBattle: false,
    usableInField: false,
    equipType: "accessory",
    statModifiers: {
      intelligence: 10,
      maxMp: 15,
    },
  });

  manager.registerItem({
    id: 31,
    name: "Power Ring",
    description: "Increases physical strength",
    type: "accessory",
    value: 200,
    usableInBattle: false,
    usableInField: false,
    equipType: "accessory",
    statModifiers: {
      attack: 8,
    },
  });

  manager.registerItem({
    id: 32,
    name: "Speed Boots",
    description: "Increases movement speed",
    type: "accessory",
    value: 180,
    usableInBattle: false,
    usableInField: false,
    equipType: "accessory",
    statModifiers: {
      speed: 10,
    },
  });

  manager.registerItem({
    id: 33,
    name: "Lucky Charm",
    description: "Increases luck",
    type: "accessory",
    value: 220,
    usableInBattle: false,
    usableInField: false,
    equipType: "accessory",
    statModifiers: {
      luck: 15,
    },
  });

  // Key items
  manager.registerItem({
    id: 100,
    name: "Dragon Key",
    description: "Opens the path to the dragon",
    type: "key",
    value: 0,
    usableInBattle: false,
    usableInField: false,
  });

  manager.registerItem({
    id: 101,
    name: "Dragon Scale",
    description: "Proof of defeating the dragon",
    type: "quest",
    value: 0,
    usableInBattle: false,
    usableInField: false,
  });

  manager.registerItem({
    id: 102,
    name: "Dragon Sword",
    description: "The legendary blade of dragons",
    type: "weapon",
    value: 9999,
    usableInBattle: false,
    usableInField: false,
    equipType: "weapon",
    statModifiers: {
      attack: 99,
      intelligence: 20,
      maxHp: 30,
    },
  });
}
