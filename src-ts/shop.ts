/**
 * Shop and Trading System
 */

import { InventoryItem } from './inventory';

export enum ShopType {
  GENERAL = 'general',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  POTION = 'potion',
  MAGIC = 'magic',
  INN = 'inn',
  BLACKSMITH = 'blacksmith'
}

export interface ShopItem extends InventoryItem {
  buyPrice: number;
  sellPrice: number;
  stock: number;
  infinite: boolean;
}

export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  keeper: string;
  items: ShopItem[];
  buybackItems: ShopItem[];
  priceModifier: number; // 1.0 = normal, 0.8 = 20% discount, 1.2 = 20% markup
}

export class ShopSystem {
  private shops: Map<string, Shop>;
  private currentShop: Shop | null;

  constructor() {
    this.shops = new Map();
    this.currentShop = null;
  }

  /**
   * Register a shop
   */
  registerShop(shop: Shop): void {
    this.shops.set(shop.id, shop);
  }

  /**
   * Open a shop
   */
  openShop(shopId: string): boolean {
    const shop = this.shops.get(shopId);
    if (!shop) {
      console.error(`Shop ${shopId} not found`);
      return false;
    }

    this.currentShop = shop;
    return true;
  }

  /**
   * Close current shop
   */
  closeShop(): void {
    this.currentShop = null;
  }

  /**
   * Get current shop
   */
  getCurrentShop(): Shop | null {
    return this.currentShop;
  }

  /**
   * Buy item from shop
   */
  buyItem(itemId: string, quantity: number = 1): { success: boolean; totalCost: number; message: string } {
    if (!this.currentShop) {
      return { success: false, totalCost: 0, message: 'No shop is open' };
    }

    const shopItem = this.currentShop.items.find(item => item.id === itemId);
    if (!shopItem) {
      return { success: false, totalCost: 0, message: 'Item not found in shop' };
    }

    // Check stock
    if (!shopItem.infinite && shopItem.stock < quantity) {
      return { 
        success: false, 
        totalCost: 0, 
        message: `Not enough stock. Available: ${shopItem.stock}` 
      };
    }

    // Calculate price with modifier
    const totalCost = Math.floor(shopItem.buyPrice * quantity * this.currentShop.priceModifier);

    // Note: Actual gold check and inventory add should be done by caller
    // This just calculates and updates shop stock

    if (!shopItem.infinite) {
      shopItem.stock -= quantity;
    }

    return {
      success: true,
      totalCost,
      message: `Purchased ${quantity}x ${shopItem.name} for ${totalCost} gold`
    };
  }

  /**
   * Sell item to shop
   */
  sellItem(item: InventoryItem, quantity: number = 1): { success: boolean; totalPrice: number; message: string } {
    if (!this.currentShop) {
      return { success: false, totalPrice: 0, message: 'No shop is open' };
    }

    // Calculate sell price (usually less than buy price)
    const sellPrice = Math.floor(item.value * 0.5 * this.currentShop.priceModifier);
    const totalPrice = sellPrice * quantity;

    // Add to buyback list
    const buybackItem: ShopItem = {
      ...item,
      buyPrice: Math.floor(item.value * 0.7), // Can buy back for 70% of original value
      sellPrice,
      stock: quantity,
      infinite: false,
      quantity
    };

    this.currentShop.buybackItems.unshift(buybackItem);

    // Keep only last 10 buyback items
    if (this.currentShop.buybackItems.length > 10) {
      this.currentShop.buybackItems.pop();
    }

    return {
      success: true,
      totalPrice,
      message: `Sold ${quantity}x ${item.name} for ${totalPrice} gold`
    };
  }

  /**
   * Get shop items by category/filter
   */
  getShopItems(filter?: (item: ShopItem) => boolean): ShopItem[] {
    if (!this.currentShop) return [];

    let items = this.currentShop.items;

    if (filter) {
      items = items.filter(filter);
    }

    // Filter out items with no stock (unless infinite)
    return items.filter(item => item.infinite || item.stock > 0);
  }

  /**
   * Get buyback items
   */
  getBuybackItems(): ShopItem[] {
    return this.currentShop?.buybackItems || [];
  }

  /**
   * Restock shop (called periodically or after rest)
   */
  restockShop(shopId: string): void {
    const shop = this.shops.get(shopId);
    if (!shop) return;

    for (const item of shop.items) {
      if (!item.infinite) {
        // Restock to max capacity (could be customized per item)
        item.stock = item.maxStack;
      }
    }

    // Clear buyback items on restock
    shop.buybackItems = [];
  }

  /**
   * Repair item at blacksmith
   */
  repairItem(item: InventoryItem): { success: boolean; cost: number; message: string } {
    if (!this.currentShop || this.currentShop.type !== ShopType.BLACKSMITH) {
      return { success: false, cost: 0, message: 'Not at a blacksmith' };
    }

    // Calculate repair cost based on item value
    const repairCost = Math.floor(item.value * 0.2);

    return {
      success: true,
      cost: repairCost,
      message: `Repaired ${item.name} for ${repairCost} gold`
    };
  }

  /**
   * Rest at inn
   */
  restAtInn(hours: number = 8): { success: boolean; cost: number; message: string } {
    if (!this.currentShop || this.currentShop.type !== ShopType.INN) {
      return { success: false, cost: 0, message: 'Not at an inn' };
    }

    const innCost = hours * 5; // 5 gold per hour

    return {
      success: true,
      cost: innCost,
      message: `Rested for ${hours} hours. Cost: ${innCost} gold. HP and MP restored!`
    };
  }

  /**
   * Apply reputation discount
   */
  setReputationDiscount(shopId: string, reputation: number): void {
    const shop = this.shops.get(shopId);
    if (!shop) return;

    // Reputation affects price: 0-25% discount based on reputation (0-100)
    const discount = Math.min(0.25, reputation / 400);
    shop.priceModifier = 1.0 - discount;
  }

  /**
   * Serialize shop data for saving
   */
  serialize(): string {
    const data = {
      shops: Array.from(this.shops.entries()).map(([id, shop]) => ({
        id,
        items: shop.items.map(item => ({
          id: item.id,
          stock: item.stock
        })),
        buybackItems: shop.buybackItems
      }))
    };
    return JSON.stringify(data);
  }

  /**
   * Restore shop data from save
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    for (const shopData of parsed.shops) {
      const shop = this.shops.get(shopData.id);
      if (!shop) continue;

      // Restore stock levels
      for (const itemData of shopData.items) {
        const item = shop.items.find(i => i.id === itemData.id);
        if (item) {
          item.stock = itemData.stock;
        }
      }

      // Restore buyback items
      shop.buybackItems = shopData.buybackItems;
    }
  }
}
