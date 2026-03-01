/**
 * Monster management system
 */
import { Monster, MonsterGroup } from "../types";
export declare class MonsterManager {
    private monsters;
    /**
     * Register a monster type
     */
    registerMonster(monster: Monster): void;
    /**
     * Create a monster instance
     */
    createMonster(monsterId: number, level?: number): Monster | null;
    /**
     * Generate random monster group
     */
    generateEncounter(groups: MonsterGroup[], playerLevel: number): Monster[];
    /**
     * Get monster by ID
     */
    getMonster(monsterId: number): Monster | null;
    /**
     * Calculate monster drops
     */
    calculateDrops(monster: Monster): number[];
    /**
     * Get all registered monsters
     */
    getAllMonsters(): Monster[];
}
/**
 * Load default monsters
 */
export declare function loadDefaultMonsters(manager: MonsterManager): void;
