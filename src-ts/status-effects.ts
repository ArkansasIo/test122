/**
 * Status Effects System
 */

export enum StatusEffectType {
  // Beneficial
  HASTE = 'haste',
  PROTECT = 'protect',
  SHELL = 'shell',
  REGEN = 'regen',
  BERSERK = 'berserk',
  INVISIBLE = 'invisible',
  REFLECT = 'reflect',
  
  // Negative
  POISON = 'poison',
  BURN = 'burn',
  FREEZE = 'freeze',
  PARALYSIS = 'paralysis',
  SLEEP = 'sleep',
  CONFUSION = 'confusion',
  BLIND = 'blind',
  SILENCE = 'silence',
  CURSE = 'curse',
  SLOW = 'slow',
  WEAKNESS = 'weakness',
  DOOM = 'doom',
  PETRIFY = 'petrify'
}

export interface StatusEffect {
  type: StatusEffectType;
  name: string;
  description: string;
  isBeneficial: boolean;
  duration: number; // in turns/rounds
  potency: number; // strength of effect
  stackable: boolean;
  maxStacks: number;
  currentStacks: number;
  onApply?: (target: string) => void;
  onTick?: (target: string) => void;
  onRemove?: (target: string) => void;
  icon?: string;
}

export class StatusEffectSystem {
  private static effectDefinitions: Map<StatusEffectType, Partial<StatusEffect>> = new Map([
    [StatusEffectType.POISON, {
      name: 'Poison',
      description: 'Takes damage over time',
      isBeneficial: false,
      stackable: true,
      maxStacks: 3,
      icon: '🧪'
    }],
    [StatusEffectType.BURN, {
      name: 'Burn',
      description: 'Fire damage over time',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '🔥'
    }],
    [StatusEffectType.FREEZE, {
      name: 'Freeze',
      description: 'Cannot act',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '❄️'
    }],
    [StatusEffectType.PARALYSIS, {
      name: 'Paralysis',
      description: 'Cannot move or act',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '⚡'
    }],
    [StatusEffectType.SLEEP, {
      name: 'Sleep',
      description: 'Unconscious until damage',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '💤'
    }],
    [StatusEffectType.CONFUSION, {
      name: 'Confusion',
      description: 'May attack allies',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '😵'
    }],
    [StatusEffectType.BLIND, {
      name: 'Blind',
      description: 'Reduced accuracy',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '🌑'
    }],
    [StatusEffectType.SILENCE, {
      name: 'Silence',
      description: 'Cannot cast spells',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '🤐'
    }],
    [StatusEffectType.HASTE, {
      name: 'Haste',
      description: 'Increased speed',
      isBeneficial: true,
      stackable: false,
      maxStacks: 1,
      icon: '⚡'
    }],
    [StatusEffectType.PROTECT, {
      name: 'Protect',
      description: 'Increased physical defense',
      isBeneficial: true,
      stackable: false,
      maxStacks: 1,
      icon: '🛡️'
    }],
    [StatusEffectType.SHELL, {
      name: 'Shell',
      description: 'Increased magical defense',
      isBeneficial: true,
      stackable: false,
      maxStacks: 1,
      icon: '🔰'
    }],
    [StatusEffectType.REGEN, {
      name: 'Regen',
      description: 'Restores HP over time',
      isBeneficial: true,
      stackable: true,
      maxStacks: 3,
      icon: '💚'
    }],
    [StatusEffectType.PETRIFY, {
      name: 'Petrify',
      description: 'Turned to stone, invulnerable but cannot act',
      isBeneficial: false,
      stackable: false,
      maxStacks: 1,
      icon: '🗿'
    }],
    [StatusEffectType.CURSE, {
      name: 'Curse',
      description: 'All stats reduced',
      isBeneficial: false,
      stackable: true,
      maxStacks: 3,
      icon: '💀'
    }],
    [StatusEffectType.REFLECT, {
      name: 'Reflect',
      description: 'Reflects magic back to caster',
      isBeneficial: true,
      stackable: false,
      maxStacks: 1,
      icon: '✨'
    }]
  ]);

  private activeEffects: Map<string, StatusEffect[]>; // entityId -> effects

  constructor() {
    this.activeEffects = new Map();
  }

  /**
   * Apply status effect to entity
   */
  applyEffect(
    entityId: string, 
    type: StatusEffectType, 
    duration: number, 
    potency: number = 1
  ): boolean {
    const definition = StatusEffectSystem.effectDefinitions.get(type);
    if (!definition) {
      console.error(`Status effect ${type} not defined`);
      return false;
    }

    const effects = this.activeEffects.get(entityId) || [];
    const existingEffect = effects.find(e => e.type === type);

    if (existingEffect) {
      if (definition.stackable) {
        if (existingEffect.currentStacks < (definition.maxStacks || 1)) {
          existingEffect.currentStacks++;
          existingEffect.duration = Math.max(existingEffect.duration, duration);
        } else {
          // Refresh duration at max stacks
          existingEffect.duration = duration;
        }
      } else {
        // Refresh duration for non-stackable effects
        existingEffect.duration = Math.max(existingEffect.duration, duration);
      }
    } else {
      // Create new effect
      const newEffect: StatusEffect = {
        type,
        name: definition.name || type,
        description: definition.description || '',
        isBeneficial: definition.isBeneficial || false,
        duration,
        potency,
        stackable: definition.stackable || false,
        maxStacks: definition.maxStacks || 1,
        currentStacks: 1,
        icon: definition.icon,
        onApply: definition.onApply,
        onTick: definition.onTick,
        onRemove: definition.onRemove
      };

      effects.push(newEffect);
      this.activeEffects.set(entityId, effects);

      // Call onApply callback
      if (newEffect.onApply) {
        newEffect.onApply(entityId);
      }
    }

    return true;
  }

  /**
   * Remove status effect from entity
   */
  removeEffect(entityId: string, type: StatusEffectType): boolean {
    const effects = this.activeEffects.get(entityId);
    if (!effects) return false;

    const effectIndex = effects.findIndex(e => e.type === type);
    if (effectIndex === -1) return false;

    const effect = effects[effectIndex];

    // Call onRemove callback
    if (effect.onRemove) {
      effect.onRemove(entityId);
    }

    effects.splice(effectIndex, 1);

    if (effects.length === 0) {
      this.activeEffects.delete(entityId);
    }

    return true;
  }

  /**
   * Process status effects for one turn/tick
   */
  processTurn(entityId: string): void {
    const effects = this.activeEffects.get(entityId);
    if (!effects) return;

    const effectsToRemove: StatusEffectType[] = [];

    for (const effect of effects) {
      // Call onTick callback
      if (effect.onTick) {
        effect.onTick(entityId);
      }

      // Decrement duration
      effect.duration--;

      // Mark for removal if expired
      if (effect.duration <= 0) {
        effectsToRemove.push(effect.type);
      }
    }

    // Remove expired effects
    for (const type of effectsToRemove) {
      this.removeEffect(entityId, type);
    }
  }

  /**
   * Get all active effects on entity
   */
  getEffects(entityId: string): StatusEffect[] {
    return this.activeEffects.get(entityId) || [];
  }

  /**
   * Check if entity has specific effect
   */
  hasEffect(entityId: string, type: StatusEffectType): boolean {
    const effects = this.activeEffects.get(entityId);
    return effects ? effects.some(e => e.type === type) : false;
  }

  /**
   * Get specific effect on entity
   */
  getEffect(entityId: string, type: StatusEffectType): StatusEffect | undefined {
    const effects = this.activeEffects.get(entityId);
    return effects?.find(e => e.type === type);
  }

  /**
   * Clear all effects from entity
   */
  clearEffects(entityId: string, onlyNegative: boolean = false): void {
    const effects = this.activeEffects.get(entityId);
    if (!effects) return;

    if (onlyNegative) {
      const effectsToRemove = effects
        .filter(e => !e.isBeneficial)
        .map(e => e.type);

      for (const type of effectsToRemove) {
        this.removeEffect(entityId, type);
      }
    } else {
      // Remove all effects
      for (const effect of effects) {
        if (effect.onRemove) {
          effect.onRemove(entityId);
        }
      }
      this.activeEffects.delete(entityId);
    }
  }

  /**
   * Get effect immunity check
   */
  canApplyEffect(entityId: string, type: StatusEffectType): boolean {
    // Check for immunities (e.g., petrify immune to most effects)
    if (this.hasEffect(entityId, StatusEffectType.PETRIFY)) {
      return false;
    }

    // Check for reflect on magic effects
    if (this.hasEffect(entityId, StatusEffectType.REFLECT)) {
      const effectDef = StatusEffectSystem.effectDefinitions.get(type);
      // Simplified: assume magical effects can be reflected
      if (effectDef?.isBeneficial === false) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate effect resistance
   */
  calculateResistance(entityId: string, type: StatusEffectType): number {
    // Returns 0-1, where 0 = no resistance, 1 = full resistance
    // This is a simplified version - should be based on entity stats
    
    // Some effects provide resistance to others
    if (type === StatusEffectType.POISON && this.hasEffect(entityId, StatusEffectType.PROTECT)) {
      return 0.3;
    }

    return 0;
  }

  /**
   * Serialize status effects for saving
   */
  serialize(): string {
    const data = Array.from(this.activeEffects.entries());
    return JSON.stringify(data);
  }

  /**
   * Restore status effects from save
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.activeEffects = new Map(parsed);
  }
}
