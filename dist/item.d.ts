/**
 * Item management system
 */
import { Item, ItemType } from "../types";
export declare class ItemManager {
    private items;
    /**
     * Register an item type
     */
    registerItem(item: Item): void;
    /**
     * Get item by ID
     */
    getItem(itemId: number): Item | null;
    /**
     * Get all items
     */
    getAllItems(): Item[];
    /**
     * Get items by type
     */
    getItemsByType(type: ItemType): Item[];
    /**
     * Create item instance
     */
    createItem(itemId: number): Item | null;
}
/**
 * Load default items
 */
export declare function loadDefaultItems(manager: ItemManager): void;
