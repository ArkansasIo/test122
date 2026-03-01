"use strict";
/**
 * Save and load system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveManager = void 0;
const fs = require("fs");
const path = require("path");
class SaveManager {
    constructor(saveDirectory = "./saves") {
        this.maxSaveSlots = 3;
        this.saveDirectory = saveDirectory;
        this.ensureSaveDirectory();
    }
    /**
     * Ensure save directory exists
     */
    ensureSaveDirectory() {
        if (!fs.existsSync(this.saveDirectory)) {
            fs.mkdirSync(this.saveDirectory, { recursive: true });
        }
    }
    /**
     * Save game to slot
     */
    saveGame(slot, gameState, player) {
        if (slot < 1 || slot > this.maxSaveSlots) {
            console.error(`Invalid save slot: ${slot}`);
            return false;
        }
        const saveData = {
            version: "1.0.0",
            timestamp: Date.now(),
            gameState: gameState,
            player: player,
            flags: Object.fromEntries(gameState.flags),
            variables: Object.fromEntries(gameState.variables),
        };
        const saveFile = this.getSaveFilePath(slot);
        try {
            fs.writeFileSync(saveFile, JSON.stringify(saveData, null, 2), "utf-8");
            console.log(`Game saved to slot ${slot}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to save game: ${error}`);
            return false;
        }
    }
    /**
     * Load game from slot
     */
    loadGame(slot) {
        if (slot < 1 || slot > this.maxSaveSlots) {
            console.error(`Invalid save slot: ${slot}`);
            return null;
        }
        const saveFile = this.getSaveFilePath(slot);
        if (!fs.existsSync(saveFile)) {
            console.log(`No save data in slot ${slot}`);
            return null;
        }
        try {
            const data = fs.readFileSync(saveFile, "utf-8");
            const saveData = JSON.parse(data);
            // Convert flag and variable objects back to Maps
            saveData.gameState.flags = new Map(Object.entries(saveData.flags));
            saveData.gameState.variables = new Map(Object.entries(saveData.variables));
            console.log(`Game loaded from slot ${slot}`);
            return saveData;
        }
        catch (error) {
            console.error(`Failed to load game: ${error}`);
            return null;
        }
    }
    /**
     * Delete save data
     */
    deleteSave(slot) {
        if (slot < 1 || slot > this.maxSaveSlots) {
            console.error(`Invalid save slot: ${slot}`);
            return false;
        }
        const saveFile = this.getSaveFilePath(slot);
        if (!fs.existsSync(saveFile)) {
            return false;
        }
        try {
            fs.unlinkSync(saveFile);
            console.log(`Deleted save in slot ${slot}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to delete save: ${error}`);
            return false;
        }
    }
    /**
     * Check if save exists
     */
    saveExists(slot) {
        if (slot < 1 || slot > this.maxSaveSlots) {
            return false;
        }
        return fs.existsSync(this.getSaveFilePath(slot));
    }
    /**
     * Get save file info
     */
    getSaveInfo(slot) {
        const saveData = this.loadGame(slot);
        if (!saveData) {
            return null;
        }
        return {
            timestamp: saveData.timestamp,
            playtime: saveData.gameState.playtime,
        };
    }
    /**
     * Get all save slots info
     */
    getAllSaveInfo() {
        const result = [];
        for (let slot = 1; slot <= this.maxSaveSlots; slot++) {
            result.push({
                slot: slot,
                info: this.getSaveInfo(slot),
            });
        }
        return result;
    }
    /**
     * Get save file path
     */
    getSaveFilePath(slot) {
        return path.join(this.saveDirectory, `save${slot}.json`);
    }
    /**
     * Quick save (slot 0)
     */
    quickSave(gameState, player) {
        const saveFile = path.join(this.saveDirectory, "quicksave.json");
        const saveData = {
            version: "1.0.0",
            timestamp: Date.now(),
            gameState: gameState,
            player: player,
            flags: Object.fromEntries(gameState.flags),
            variables: Object.fromEntries(gameState.variables),
        };
        try {
            fs.writeFileSync(saveFile, JSON.stringify(saveData, null, 2), "utf-8");
            console.log("Quick saved");
            return true;
        }
        catch (error) {
            console.error(`Failed to quick save: ${error}`);
            return false;
        }
    }
    /**
     * Quick load
     */
    quickLoad() {
        const saveFile = path.join(this.saveDirectory, "quicksave.json");
        if (!fs.existsSync(saveFile)) {
            console.log("No quick save data");
            return null;
        }
        try {
            const data = fs.readFileSync(saveFile, "utf-8");
            const saveData = JSON.parse(data);
            saveData.gameState.flags = new Map(Object.entries(saveData.flags));
            saveData.gameState.variables = new Map(Object.entries(saveData.variables));
            console.log("Quick loaded");
            return saveData;
        }
        catch (error) {
            console.error(`Failed to quick load: ${error}`);
            return null;
        }
    }
}
exports.SaveManager = SaveManager;
//# sourceMappingURL=save.js.map