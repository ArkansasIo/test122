/**
 * Player management system
 */
import { Player, Ability, Item, Equipment, Direction } from "../types";
export declare class PlayerManager {
    private player;
    constructor(player: Player);
    /**
     * Move player in specified direction
     */
    move(direction: Direction): boolean;
    /**
     * Gain experience points
     */
    gainExperience(amount: number): boolean;
    /**
     * Level up the player
     */
    private levelUp;
    /**
     * Calculate experience needed for next level
     */
    private getExperienceForNextLevel;
    /**
     * Take damage
     */
    takeDamage(amount: number): void;
    /**
     * Heal HP
     */
    heal(amount: number): void;
    /**
     * Use MP
     */
    useMp(amount: number): boolean;
    /**
     * Restore MP
     */
    restoreMp(amount: number): void;
    /**
     * Check if player is alive
     */
    isAlive(): boolean;
    /**
     * Learn new ability
     */
    learnAbility(ability: Ability): boolean;
    /**
     * Add item to inventory
     */
    addItem(item: Item): boolean;
    /**
     * Remove item from inventory
     */
    removeItem(itemId: number): boolean;
    /**
     * Equip item
     */
    equip(item: Item): boolean;
    /**
     * Unequip item
     */
    unequip(slot: keyof Equipment): boolean;
    /**
     * Apply or remove stat modifiers from equipment
     */
    private applyStatModifiers;
    /**
     * Get player data
     */
    getPlayer(): Player;
    /**
     * Set player position
     */
    setPosition(x: number, y: number): void;
    /**
     * Get calculated attack power
     */
    getAttackPower(): number;
    /**
     * Get calculated defense power
     */
    getDefensePower(): number;
}
