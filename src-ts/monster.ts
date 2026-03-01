/**
 * Monster management system
 */

import { Monster, MonsterGroup } from "../types";

export class MonsterManager {
  private monsters: Map<number, Monster> = new Map();

  /**
   * Register a monster type
   */
  public registerMonster(monster: Monster): void {
    this.monsters.set(monster.id, monster);
  }

  /**
   * Create a monster instance
   */
  public createMonster(monsterId: number, level?: number): Monster | null {
    const template = this.monsters.get(monsterId);
    if (!template) {
      console.error(`Monster ${monsterId} not found`);
      return null;
    }

    // Create a copy with adjusted stats for level
    const actualLevel = level || template.level;
    const levelDiff = actualLevel - template.level;
    
    return {
      ...template,
      level: actualLevel,
      hp: template.hp + (levelDiff * 5),
      maxHp: template.maxHp + (levelDiff * 5),
      mp: template.mp + (levelDiff * 2),
      maxMp: template.maxMp + (levelDiff * 2),
      attack: template.attack + levelDiff,
      defense: template.defense + levelDiff,
      speed: template.speed + levelDiff,
      intelligence: template.intelligence + levelDiff,
      experience: Math.floor(template.experience * (1 + levelDiff * 0.1)),
      gold: Math.floor(template.gold * (1 + levelDiff * 0.1)),
    };
  }

  /**
   * Generate random monster group
   */
  public generateEncounter(groups: MonsterGroup[], playerLevel: number): Monster[] {
    // Select a group based on weights
    const totalWeight = groups.reduce((sum, group) => sum + group.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedGroup: MonsterGroup | null = null;
    for (const group of groups) {
      random -= group.weight;
      if (random <= 0) {
        selectedGroup = group;
        break;
      }
    }

    if (!selectedGroup) {
      selectedGroup = groups[0];
    }

    // Create monsters from the selected group
    const monsters: Monster[] = [];
    for (const monsterId of selectedGroup.monsters) {
      // Adjust level based on player level
      const levelVariance = Math.floor(Math.random() * 3) - 1; // -1 to +1
      const monsterLevel = Math.max(1, playerLevel + levelVariance);
      
      const monster = this.createMonster(monsterId, monsterLevel);
      if (monster) {
        monsters.push(monster);
      }
    }

    return monsters;
  }

  /**
   * Get monster by ID
   */
  public getMonster(monsterId: number): Monster | null {
    const monster = this.monsters.get(monsterId);
    return monster ? { ...monster } : null;
  }

  /**
   * Calculate monster drops
   */
  public calculateDrops(monster: Monster): number[] {
    const drops: number[] = [];

    for (const drop of monster.drops) {
      const roll = Math.random() * 100;
      if (roll <= drop.chance) {
        drops.push(drop.itemId);
      }
    }

    return drops;
  }

  /**
   * Get all registered monsters
   */
  public getAllMonsters(): Monster[] {
    return Array.from(this.monsters.values());
  }
}

/**
 * Load default monsters
 */
export function loadDefaultMonsters(manager: MonsterManager): void {
  // Slime
  manager.registerMonster({
    id: 1,
    name: "Slime",
    level: 1,
    hp: 10,
    maxHp: 10,
    mp: 0,
    maxMp: 0,
    attack: 3,
    defense: 1,
    speed: 2,
    intelligence: 1,
    experience: 5,
    gold: 3,
    sprite: 1,
    abilities: [],
    drops: [
      { itemId: 1, chance: 20 }, // Potion
    ],
    element: "neutral",
  });

  // Goblin
  manager.registerMonster({
    id: 2,
    name: "Goblin",
    level: 2,
    hp: 15,
    maxHp: 15,
    mp: 0,
    maxMp: 0,
    attack: 5,
    defense: 2,
    speed: 4,
    intelligence: 2,
    experience: 8,
    gold: 5,
    sprite: 2,
    abilities: [],
    drops: [
      { itemId: 1, chance: 15 }, // Potion
      { itemId: 10, chance: 10 }, // Rusty Sword
    ],
  });

  // Fire Bat
  manager.registerMonster({
    id: 3,
    name: "Fire Bat",
    level: 3,
    hp: 12,
    maxHp: 12,
    mp: 5,
    maxMp: 5,
    attack: 4,
    defense: 1,
    speed: 8,
    intelligence: 4,
    experience: 10,
    gold: 6,
    sprite: 3,
    abilities: [1], // Fireball
    drops: [
      { itemId: 2, chance: 25 }, // Ether
    ],
    element: "fire",
  });

  // Skeleton
  manager.registerMonster({
    id: 4,
    name: "Skeleton",
    level: 4,
    hp: 20,
    maxHp: 20,
    mp: 0,
    maxMp: 0,
    attack: 7,
    defense: 3,
    speed: 3,
    intelligence: 2,
    experience: 12,
    gold: 8,
    sprite: 4,
    abilities: [],
    drops: [
      { itemId: 11, chance: 15 }, // Bone Sword
    ],
  });

  // Orc
  manager.registerMonster({
    id: 5,
    name: "Orc",
    level: 5,
    hp: 30,
    maxHp: 30,
    mp: 0,
    maxMp: 0,
    attack: 10,
    defense: 5,
    speed: 3,
    intelligence: 2,
    experience: 15,
    gold: 12,
    sprite: 5,
    abilities: [],
    drops: [
      { itemId: 1, chance: 20 }, // Potion
      { itemId: 20, chance: 10 }, // Leather Armor
    ],
  });

  // Dark Wizard
  manager.registerMonster({
    id: 6,
    name: "Dark Wizard",
    level: 6,
    hp: 25,
    maxHp: 25,
    mp: 20,
    maxMp: 20,
    attack: 5,
    defense: 3,
    speed: 5,
    intelligence: 10,
    experience: 20,
    gold: 15,
    sprite: 6,
    abilities: [1, 2, 3], // Fireball, Ice Shard, Lightning
    drops: [
      { itemId: 2, chance: 30 }, // Ether
      { itemId: 30, chance: 5 }, // Magic Staff
    ],
    element: "dark",
  });

  // Dragon (Boss)
  manager.registerMonster({
    id: 100,
    name: "Dragon",
    level: 10,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 20,
    defense: 10,
    speed: 8,
    intelligence: 15,
    experience: 500,
    gold: 1000,
    sprite: 100,
    abilities: [10, 11, 12], // Fire Breath, Dragon Claw, Roar
    drops: [
      { itemId: 101, chance: 100 }, // Dragon Scale
      { itemId: 102, chance: 50 }, // Dragon Sword
    ],
    element: "fire",
  });
}
