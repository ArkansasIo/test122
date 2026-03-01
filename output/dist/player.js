"use strict";
/**
 * Player management system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
class PlayerManager {
    constructor(player) {
        this.player = player;
    }
    /**
     * Move player in specified direction
     */
    move(direction) {
        // const oldX = this.player.x;
        // const oldY = this.player.y;
        switch (direction) {
            case "up":
                this.player.y -= 1;
                break;
            case "down":
                this.player.y += 1;
                break;
            case "left":
                this.player.x -= 1;
                break;
            case "right":
                this.player.x += 1;
                break;
        }
        this.player.direction = direction;
        // TODO: Check collision and revert if necessary
        // For now, allow all movement
        return true;
    }
    /**
     * Gain experience points
     */
    gainExperience(amount) {
        this.player.experience += amount;
        const expNeeded = this.getExperienceForNextLevel();
        if (this.player.experience >= expNeeded) {
            return this.levelUp();
        }
        return false;
    }
    /**
     * Level up the player
     */
    levelUp() {
        if (this.player.level >= 99) {
            return false;
        }
        this.player.level += 1;
        // Stat increases
        const hpIncrease = Math.floor(Math.random() * 5) + 5;
        const mpIncrease = Math.floor(Math.random() * 3) + 2;
        const attackIncrease = Math.floor(Math.random() * 2) + 1;
        const defenseIncrease = Math.floor(Math.random() * 2) + 1;
        const speedIncrease = Math.floor(Math.random() * 2) + 1;
        const intelligenceIncrease = Math.floor(Math.random() * 2) + 1;
        this.player.maxHp += hpIncrease;
        this.player.maxMp += mpIncrease;
        this.player.attack += attackIncrease;
        this.player.defense += defenseIncrease;
        this.player.speed += speedIncrease;
        this.player.intelligence += intelligenceIncrease;
        // Restore HP and MP
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        console.log(`Level up! Now level ${this.player.level}`);
        return true;
    }
    /**
     * Calculate experience needed for next level
     */
    getExperienceForNextLevel() {
        return Math.floor(Math.pow(this.player.level, 3) * 1.5);
    }
    /**
     * Take damage
     */
    takeDamage(amount) {
        this.player.hp = Math.max(0, this.player.hp - amount);
    }
    /**
     * Heal HP
     */
    heal(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
    }
    /**
     * Use MP
     */
    useMp(amount) {
        if (this.player.mp < amount) {
            return false;
        }
        this.player.mp -= amount;
        return true;
    }
    /**
     * Restore MP
     */
    restoreMp(amount) {
        this.player.mp = Math.min(this.player.maxMp, this.player.mp + amount);
    }
    /**
     * Check if player is alive
     */
    isAlive() {
        return this.player.hp > 0;
    }
    /**
     * Learn new ability
     */
    learnAbility(ability) {
        if (this.player.abilities.some(a => a.id === ability.id)) {
            console.log(`Already knows ${ability.name}`);
            return false;
        }
        this.player.abilities.push(ability);
        console.log(`Learned new ability: ${ability.name}`);
        return true;
    }
    /**
     * Add item to inventory
     */
    addItem(item) {
        // Check if inventory is full (assuming max 99 items)
        if (this.player.items.length >= 99) {
            return false;
        }
        this.player.items.push(item);
        return true;
    }
    /**
     * Remove item from inventory
     */
    removeItem(itemId) {
        const index = this.player.items.findIndex(item => item.id === itemId);
        if (index === -1) {
            return false;
        }
        this.player.items.splice(index, 1);
        return true;
    }
    /**
     * Equip item
     */
    equip(item) {
        if (!item.equipType) {
            return false;
        }
        // Unequip current item in that slot
        const currentItem = this.player.equipment[item.equipType];
        if (currentItem) {
            this.unequip(item.equipType);
        }
        this.player.equipment[item.equipType] = item;
        this.applyStatModifiers(item, true);
        return true;
    }
    /**
     * Unequip item
     */
    unequip(slot) {
        const item = this.player.equipment[slot];
        if (!item) {
            return false;
        }
        this.applyStatModifiers(item, false);
        delete this.player.equipment[slot];
        return true;
    }
    /**
     * Apply or remove stat modifiers from equipment
     */
    applyStatModifiers(item, apply) {
        if (!item.statModifiers) {
            return;
        }
        const multiplier = apply ? 1 : -1;
        const mods = item.statModifiers;
        if (mods.attack)
            this.player.attack += mods.attack * multiplier;
        if (mods.defense)
            this.player.defense += mods.defense * multiplier;
        if (mods.speed)
            this.player.speed += mods.speed * multiplier;
        if (mods.intelligence)
            this.player.intelligence += mods.intelligence * multiplier;
        if (mods.maxHp) {
            this.player.maxHp += mods.maxHp * multiplier;
            this.player.hp = Math.min(this.player.hp, this.player.maxHp);
        }
        if (mods.maxMp) {
            this.player.maxMp += mods.maxMp * multiplier;
            this.player.mp = Math.min(this.player.mp, this.player.maxMp);
        }
    }
    /**
     * Get player data
     */
    getPlayer() {
        return this.player;
    }
    /**
     * Set player position
     */
    setPosition(x, y) {
        this.player.x = x;
        this.player.y = y;
    }
    /**
     * Get calculated attack power
     */
    getAttackPower() {
        let power = this.player.attack;
        if (this.player.equipment.weapon) {
            // Add weapon power
            power += this.player.equipment.weapon.value || 0;
        }
        return power;
    }
    /**
     * Get calculated defense power
     */
    getDefensePower() {
        let power = this.player.defense;
        if (this.player.equipment.armor) {
            // Add armor defense
            power += this.player.equipment.armor.value || 0;
        }
        return power;
    }
}
exports.PlayerManager = PlayerManager;
//# sourceMappingURL=player.js.map