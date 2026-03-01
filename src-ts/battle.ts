/**
 * Battle system
 */

import { BattleState, BattleAction, Combatant, Player, Monster } from "../types";
import { PlayerManager } from "./player";

export class BattleSystem {
  private battleState: BattleState | null = null;
  private playerManager: PlayerManager;

  constructor(playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  /**
   * Start a new battle
   */
  public startBattle(enemies: Monster[]): void {
    const player = this.playerManager.getPlayer();
    
    this.battleState = {
      isActive: true,
      turn: 0,
      player: player,
      enemies: enemies,
      turnOrder: this.calculateTurnOrder([player, ...enemies]),
    };

    console.log(`Battle started! Enemies: ${enemies.map(e => e.name).join(", ")}`);
  }

  /**
   * End current battle
   */
  public endBattle(victory: boolean): void {
    if (!this.battleState) {
      return;
    }

    if (victory) {
      this.handleVictory();
    } else {
      this.handleDefeat();
    }

    this.battleState = null;
  }

  /**
   * Calculate turn order based on speed
   */
  private calculateTurnOrder(combatants: Combatant[]): Combatant[] {
    return [...combatants].sort((a, b) => b.speed - a.speed);
  }

  /**
   * Execute a battle action
   */
  public executeAction(action: BattleAction): void {
    if (!this.battleState) {
      return;
    }

    switch (action.type) {
      case "attack":
        this.executeAttack(action);
        break;
      case "ability":
        this.executeAbility(action);
        break;
      case "item":
        this.executeItem(action);
        break;
      case "defend":
        this.executeDefend(action);
        break;
      case "flee":
        this.executeFlee(action);
        break;
    }

    this.checkBattleEnd();
  }

  /**
   * Execute physical attack
   */
  private executeAttack(action: BattleAction): void {
    if (!action.target) {
      return;
    }

    const attacker = action.source;
    const defender = action.target;

    // Calculate damage
    const attackPower = this.isPlayer(attacker) 
      ? this.playerManager.getAttackPower() 
      : attacker.attack;
    
    const defensePower = this.isPlayer(defender)
      ? this.playerManager.getDefensePower()
      : defender.defense;

    const baseDamage = Math.max(1, attackPower - defensePower / 2);
    const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
    const damage = Math.floor(baseDamage * (1 + variance));

    // Apply damage
    defender.hp -= damage;
    console.log(`${attacker.name} attacks ${defender.name} for ${damage} damage!`);

    if (defender.hp <= 0) {
      console.log(`${defender.name} has been defeated!`);
    }
  }

  /**
   * Execute ability
   */
  private executeAbility(action: BattleAction): void {
    if (!action.target || action.abilityId === undefined) {
      return;
    }

    const attacker = action.source;
    const ability = this.isPlayer(attacker)
      ? attacker.abilities.find(a => a.id === action.abilityId)
      : null;

    if (!ability) {
      console.log("Ability not found!");
      return;
    }

    // Check MP cost
    if (this.isPlayer(attacker)) {
      if (!this.playerManager.useMp(ability.mpCost)) {
        console.log("Not enough MP!");
        return;
      }
    }

    // Calculate ability damage/effect
    const power = ability.power;
    const intelligence = attacker.intelligence;
    const damage = Math.floor(power * (1 + intelligence / 100));

    action.target.hp -= damage;
    console.log(`${attacker.name} uses ${ability.name} on ${action.target.name} for ${damage} damage!`);
  }

  /**
   * Execute item use
   */
  private executeItem(action: BattleAction): void {
    if (!action.itemId) {
      return;
    }

    const player = this.playerManager.getPlayer();
    const item = player.items.find(i => i.id === action.itemId);

    if (!item || !item.usableInBattle) {
      console.log("Cannot use that item in battle!");
      return;
    }

    if (!item.effect) {
      return;
    }

    // Apply item effect
    switch (item.effect.type) {
      case "heal_hp":
        this.playerManager.heal(item.effect.power);
        console.log(`Used ${item.name}! Restored ${item.effect.power} HP.`);
        break;
      case "heal_mp":
        this.playerManager.restoreMp(item.effect.power);
        console.log(`Used ${item.name}! Restored ${item.effect.power} MP.`);
        break;
    }

    // Remove item from inventory
    this.playerManager.removeItem(item.id);
  }

  /**
   * Execute defend action
   */
  private executeDefend(action: BattleAction): void {
    console.log(`${action.source.name} takes a defensive stance!`);
    // Defense boost would be applied in damage calculation
  }

  /**
   * Execute flee action
   */
  private executeFlee(_action: BattleAction): void {
    const fleeChance = Math.random();
    if (fleeChance > 0.5) {
      console.log("Successfully fled from battle!");
      this.endBattle(false);
    } else {
      console.log("Failed to flee!");
    }
  }

  /**
   * Check if battle should end
   */
  private checkBattleEnd(): void {
    if (!this.battleState) {
      return;
    }

    // Check if all enemies are defeated
    const allEnemiesDefeated = this.battleState.enemies.every(e => e.hp <= 0);
    if (allEnemiesDefeated) {
      this.endBattle(true);
      return;
    }

    // Check if player is defeated
    if (!this.playerManager.isAlive()) {
      this.endBattle(false);
      return;
    }
  }

  /**
   * Handle battle victory
   */
  private handleVictory(): void {
    if (!this.battleState) {
      return;
    }

    let totalExp = 0;
    let totalGold = 0;

    for (const enemy of this.battleState.enemies) {
      totalExp += enemy.experience;
      totalGold += enemy.gold;
    }

    console.log(`Victory! Gained ${totalExp} EXP and ${totalGold} gold.`);
    
    const leveledUp = this.playerManager.gainExperience(totalExp);
    if (leveledUp) {
      console.log("Level up!");
    }
  }

  /**
   * Handle battle defeat
   */
  private handleDefeat(): void {
    console.log("Defeated...");
    // Handle game over logic
  }

  /**
   * Get enemy action (AI)
   */
  public getEnemyAction(enemy: Monster): BattleAction {
    // Simple AI: 80% attack, 20% ability (if available)
    const useAbility = Math.random() < 0.2 && enemy.abilities.length > 0;

    if (useAbility) {
      const abilityId = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
      return {
        type: "ability",
        source: enemy,
        target: this.playerManager.getPlayer(),
        abilityId: abilityId,
      };
    }

    return {
      type: "attack",
      source: enemy,
      target: this.playerManager.getPlayer(),
    };
  }

  /**
   * Check if combatant is a player
   */
  private isPlayer(combatant: Combatant): combatant is Player {
    return "equipment" in combatant;
  }

  /**
   * Get current battle state
   */
  public getBattleState(): BattleState | null {
    return this.battleState;
  }

  /**
   * Check if battle is active
   */
  public isActive(): boolean {
    return this.battleState !== null && this.battleState.isActive;
  }
}
