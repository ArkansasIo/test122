"use strict";
/**
 * Ability system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbilityManager = void 0;
exports.loadDefaultAbilities = loadDefaultAbilities;
class AbilityManager {
    constructor() {
        this.abilities = new Map();
    }
    /**
     * Register an ability
     */
    registerAbility(ability) {
        this.abilities.set(ability.id, ability);
    }
    /**
     * Get ability by ID
     */
    getAbility(abilityId) {
        const ability = this.abilities.get(abilityId);
        return ability ? { ...ability } : null;
    }
    /**
     * Get all abilities
     */
    getAllAbilities() {
        return Array.from(this.abilities.values());
    }
}
exports.AbilityManager = AbilityManager;
/**
 * Load default abilities
 */
function loadDefaultAbilities(manager) {
    // Fire abilities
    manager.registerAbility({
        id: 1,
        name: "Fireball",
        description: "Launches a ball of fire",
        mpCost: 5,
        power: 20,
        accuracy: 90,
        element: "fire",
        targetType: "single",
    });
    manager.registerAbility({
        id: 2,
        name: "Flame Wall",
        description: "Creates a wall of flames",
        mpCost: 12,
        power: 35,
        accuracy: 85,
        element: "fire",
        targetType: "all",
    });
    // Water/Ice abilities
    manager.registerAbility({
        id: 3,
        name: "Ice Shard",
        description: "Shoots sharp ice crystals",
        mpCost: 6,
        power: 22,
        accuracy: 88,
        element: "water",
        targetType: "single",
    });
    manager.registerAbility({
        id: 4,
        name: "Blizzard",
        description: "Summons a freezing blizzard",
        mpCost: 15,
        power: 40,
        accuracy: 80,
        element: "water",
        targetType: "all",
    });
    // Wind abilities
    manager.registerAbility({
        id: 5,
        name: "Wind Blade",
        description: "Slashes with wind",
        mpCost: 4,
        power: 18,
        accuracy: 95,
        element: "wind",
        targetType: "single",
    });
    manager.registerAbility({
        id: 6,
        name: "Tornado",
        description: "Summons a powerful tornado",
        mpCost: 18,
        power: 45,
        accuracy: 75,
        element: "wind",
        targetType: "all",
    });
    // Earth abilities
    manager.registerAbility({
        id: 7,
        name: "Rock Throw",
        description: "Hurls a large rock",
        mpCost: 5,
        power: 25,
        accuracy: 85,
        element: "earth",
        targetType: "single",
    });
    manager.registerAbility({
        id: 8,
        name: "Earthquake",
        description: "Causes a violent earthquake",
        mpCost: 20,
        power: 50,
        accuracy: 70,
        element: "earth",
        targetType: "all",
    });
    // Light abilities
    manager.registerAbility({
        id: 9,
        name: "Heal",
        description: "Restores HP",
        mpCost: 8,
        power: 40,
        accuracy: 100,
        element: "light",
        targetType: "self",
    });
    manager.registerAbility({
        id: 10,
        name: "Holy Light",
        description: "Damages dark creatures",
        mpCost: 10,
        power: 50,
        accuracy: 95,
        element: "light",
        targetType: "single",
    });
    // Dark abilities
    manager.registerAbility({
        id: 11,
        name: "Dark Bolt",
        description: "Shoots dark energy",
        mpCost: 7,
        power: 28,
        accuracy: 87,
        element: "dark",
        targetType: "single",
    });
    manager.registerAbility({
        id: 12,
        name: "Shadow Strike",
        description: "Strikes from the shadows",
        mpCost: 14,
        power: 42,
        accuracy: 92,
        element: "dark",
        targetType: "single",
    });
    // Special abilities
    manager.registerAbility({
        id: 100,
        name: "Dragon Breath",
        description: "Devastating dragon fire",
        mpCost: 30,
        power: 80,
        accuracy: 95,
        element: "fire",
        targetType: "all",
    });
    manager.registerAbility({
        id: 101,
        name: "Dragon Claw",
        description: "Powerful physical strike",
        mpCost: 20,
        power: 70,
        accuracy: 90,
        element: "neutral",
        targetType: "single",
    });
    manager
        .registerAbility({
        id: 102,
        name: "Dragon Roar",
        description: "Intimidating roar",
        mpCost: 15,
        power: 30,
        accuracy: 100,
        element: "neutral",
        targetType: "all",
    });
}
//# sourceMappingURL=ability.js.map