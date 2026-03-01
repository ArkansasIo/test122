/**
 * Character & Stats System for Dragon Studio
 * Create heroes, enemies, and NPCs with complete stat systems
 */

class CharacterSystem {
  constructor() {
    this.characters = new Map();
    this.characterCounter = 0;
    this.baseStats = {
      health: 100,
      mana: 50,
      damage: 10,
      defense: 5,
      speed: 5,
      intelligence: 10,
      wisdom: 8,
      charisma: 8,
      luck: 5
    };
  }

  createCharacter(name, type = 'hero') {
    const character = {
      id: this.characterCounter++,
      name: name,
      type: type, // 'hero', 'npc', 'enemy'
      level: 1,
      experience: 0,
      stats: { ...this.baseStats },
      skills: [],
      equipment: {
        weapon: null,
        armor: null,
        shield: null,
        accessories: []
      },
      inventory: [],
      dialogue: [],
      animations: new Map(),
      sprite: null,
      ai: null
    };
    
    this.characters.set(character.id, character);
    return character;
  }

  getCharacter(id) {
    return this.characters.get(id);
  }

  updateCharacterStats(id, statUpdates) {
    const character = this.getCharacter(id);
    if (character) {
      Object.assign(character.stats, statUpdates);
    }
    return character;
  }

  addSkillToCharacter(id, skill) {
    const character = this.getCharacter(id);
    if (character) {
      character.skills.push(skill);
    }
  }

  levelUpCharacter(id) {
    const character = this.getCharacter(id);
    if (character) {
      character.level++;
      // Scale stats with level
      for (const stat in character.stats) {
        character.stats[stat] = Math.floor(character.stats[stat] * 1.1);
      }
    }
    return character;
  }

  equipItem(characterId, item, slot) {
    const character = this.getCharacter(characterId);
    if (character) {
      character.equipment[slot] = item;
    }
  }

  addToInventory(characterId, item, quantity = 1) {
    const character = this.getCharacter(characterId);
    if (character) {
      character.inventory.push({ item, quantity });
    }
  }

  serializeCharacter(id) {
    const character = this.getCharacter(id);
    return JSON.stringify(character, null, 2);
  }

  getAllCharacters() {
    return Array.from(this.characters.values());
  }
}

// Skill definition
class Skill {
  constructor(name, type, power, cost, cooldown = 0) {
    this.name = name;
    this.type = type; // 'attack', 'magic', 'heal', 'buff', 'debuff'
    this.power = power;
    this.cost = cost; // mana or stamina
    this.cooldown = cooldown;
    this.currentCooldown = 0;
  }

  isAvailable() {
    return this.currentCooldown <= 0;
  }

  use() {
    this.currentCooldown = this.cooldown;
  }

  tick() {
    if (this.currentCooldown > 0) {
      this.currentCooldown--;
    }
  }
}

// Item system
class Item {
  constructor(name, type, rarity = 'common', stats = {}) {
    this.name = name;
    this.type = type; // 'weapon', 'armor', 'consumable', 'key'
    this.rarity = rarity; // 'common', 'uncommon', 'rare', 'epic', 'legendary'
    this.stats = stats; // HP boost, DMG boost, etc.
    this.value = 0; // Gold cost
    this.description = '';
  }

  getRarityColor() {
    const colors = {
      'common': '#FFFFFF',
      'uncommon': '#1EFF00',
      'rare': '#0070DD',
      'epic': '#A335EE',
      'legendary': '#FF8000'
    };
    return colors[this.rarity] || '#FFFFFF';
  }
}

// Weapon class
class Weapon extends Item {
  constructor(name, damage, critChance = 0.1, cooldown = 1, rarity = 'common') {
    super(name, 'weapon', rarity);
    this.damage = damage;
    this.critChance = critChance;
    this.cooldown = cooldown;
    this.currentCooldown = 0;
  }

  canAttack() {
    return this.currentCooldown <= 0;
  }

  attack() {
    this.currentCooldown = this.cooldown;
    const isCrit = Math.random() < this.critChance;
    return {
      damage: isCrit ? this.damage * 1.5 : this.damage,
      isCritical: isCrit
    };
  }

  tick() {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= 0.016; // Assuming 60 FPS
    }
  }
}

// Armor class
class Armor extends Item {
  constructor(name, defense, healthBonus = 0, rarity = 'common') {
    super(name, 'armor', rarity, { defense, health: healthBonus });
    this.defense = defense;
    this.healthBonus = healthBonus;
  }

  getMitigation(damage) {
    return Math.max(0, damage - this.defense);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CharacterSystem, Skill, Item, Weapon, Armor };
}
