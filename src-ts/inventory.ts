/**
 * Advanced Inventory Management System
 */

export enum ItemSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  HELMET = 'helmet',
  SHIELD = 'shield',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  KEY_ITEM = 'key_item',
  MATERIAL = 'material'
}

export interface InventoryItem {
  id: string;
  name: string;
  slot: ItemSlot;
  stackable: boolean;
  maxStack: number;
  quantity: number;
  weight: number;
  value: number;
  description: string;
  equipped?: boolean;
}

export class Inventory {
  private items: Map<string, InventoryItem>;
  private maxCapacity: number;
  private maxWeight: number;

  constructor(maxCapacity: number = 50, maxWeight: number = 100) {
    this.items = new Map();
    this.maxCapacity = maxCapacity;
    this.maxWeight = maxWeight;
  }

  /**
   * Add item to inventory
   */
  addItem(item: InventoryItem, quantity: number = 1): boolean {
    // Check if inventory is full
    if (this.items.size >= this.maxCapacity && !this.items.has(item.id)) {
      console.warn('Inventory is full');
      return false;
    }

    // Check weight limit
    const currentWeight = this.getTotalWeight();
    if (currentWeight + (item.weight * quantity) > this.maxWeight) {
      console.warn('Item too heavy for current inventory');
      return false;
    }

    const existingItem = this.items.get(item.id);

    if (existingItem && item.stackable) {
      // Stack with existing item
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity <= item.maxStack) {
        existingItem.quantity = newQuantity;
        return true;
      } else {
        console.warn('Cannot stack more items');
        return false;
      }
    } else {
      // Add as new item
      this.items.set(item.id, { ...item, quantity });
      return true;
    }
  }

  /**
   * Remove item from inventory
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);
    if (!item) {
      console.warn(`Item ${itemId} not found in inventory`);
      return false;
    }

    if (item.quantity < quantity) {
      console.warn('Not enough items to remove');
      return false;
    }

    item.quantity -= quantity;

    if (item.quantity <= 0) {
      this.items.delete(itemId);
    }

    return true;
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): InventoryItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get all items
   */
  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Get items by slot type
   */
  getItemsBySlot(slot: ItemSlot): InventoryItem[] {
    return this.getAllItems().filter(item => item.slot === slot);
  }

  /**
   * Check if item exists in inventory
   */
  hasItem(itemId: string, minQuantity: number = 1): boolean {
    const item = this.items.get(itemId);
    return item ? item.quantity >= minQuantity : false;
  }

  /**
   * Get total weight of all items
   */
  getTotalWeight(): number {
    return Array.from(this.items.values())
      .reduce((total, item) => total + (item.weight * item.quantity), 0);
  }

  /**
   * Get number of unique items
   */
  getItemCount(): number {
    return this.items.size;
  }

  /**
   * Sort inventory by various criteria
   */
  sortInventory(by: 'name' | 'value' | 'weight' | 'slot' = 'name'): InventoryItem[] {
    const items = this.getAllItems();
    
    switch (by) {
      case 'name':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'value':
        return items.sort((a, b) => b.value - a.value);
      case 'weight':
        return items.sort((a, b) => a.weight - b.weight);
      case 'slot':
        return items.sort((a, b) => a.slot.localeCompare(b.slot));
      default:
        return items;
    }
  }

  /**
   * Equip an item
   */
  equipItem(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    // Unequip any other items in the same slot
    for (const [, invItem] of this.items.entries()) {
      if (invItem.slot === item.slot && invItem.equipped) {
        invItem.equipped = false;
      }
    }

    item.equipped = true;
    return true;
  }

  /**
   * Unequip an item
   */
  unequipItem(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    item.equipped = false;
    return true;
  }

  /**
   * Get all equipped items
   */
  getEquippedItems(): InventoryItem[] {
    return this.getAllItems().filter(item => item.equipped);
  }

  /**
   * Clear inventory
   */
  clear(): void {
    this.items.clear();
  }

  /**
   * Serialize inventory for saving
   */
  serialize(): string {
    const data = {
      items: Array.from(this.items.entries()),
      maxCapacity: this.maxCapacity,
      maxWeight: this.maxWeight
    };
    return JSON.stringify(data);
  }

  /**
   * Restore inventory from save
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.items = new Map(parsed.items);
    this.maxCapacity = parsed.maxCapacity;
    this.maxWeight = parsed.maxWeight;
  }
}
