/**
 * Battle system
 */
import { BattleState, BattleAction, Monster } from "../types";
import { PlayerManager } from "./player";
export declare class BattleSystem {
    private battleState;
    private playerManager;
    constructor(playerManager: PlayerManager);
    /**
     * Start a new battle
     */
    startBattle(enemies: Monster[]): void;
    /**
     * End current battle
     */
    endBattle(victory: boolean): void;
    /**
     * Calculate turn order based on speed
     */
    private calculateTurnOrder;
    /**
     * Execute a battle action
     */
    executeAction(action: BattleAction): void;
    /**
     * Execute physical attack
     */
    private executeAttack;
    /**
     * Execute ability
     */
    private executeAbility;
    /**
     * Execute item use
     */
    private executeItem;
    /**
     * Execute defend action
     */
    private executeDefend;
    /**
     * Execute flee action
     */
    private executeFlee;
    /**
     * Check if battle should end
     */
    private checkBattleEnd;
    /**
     * Handle battle victory
     */
    private handleVictory;
    /**
     * Handle battle defeat
     */
    private handleDefeat;
    /**
     * Get enemy action (AI)
     */
    getEnemyAction(enemy: Monster): BattleAction;
    /**
     * Check if combatant is a player
     */
    private isPlayer;
    /**
     * Get current battle state
     */
    getBattleState(): BattleState | null;
    /**
     * Check if battle is active
     */
    isActive(): boolean;
}
