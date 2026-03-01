/**
 * Ability system
 */
import { Ability } from "../types";
export declare class AbilityManager {
    private abilities;
    /**
     * Register an ability
     */
    registerAbility(ability: Ability): void;
    /**
     * Get ability by ID
     */
    getAbility(abilityId: number): Ability | null;
    /**
     * Get all abilities
     */
    getAllAbilities(): Ability[];
}
/**
 * Load default abilities
 */
export declare function loadDefaultAbilities(manager: AbilityManager): void;
