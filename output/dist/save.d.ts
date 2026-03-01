/**
 * Save and load system
 */
import { SaveData, GameState, Player } from "../types";
export declare class SaveManager {
    private saveDirectory;
    private maxSaveSlots;
    constructor(saveDirectory?: string);
    /**
     * Ensure save directory exists
     */
    private ensureSaveDirectory;
    /**
     * Save game to slot
     */
    saveGame(slot: number, gameState: GameState, player: Player): boolean;
    /**
     * Load game from slot
     */
    loadGame(slot: number): SaveData | null;
    /**
     * Delete save data
     */
    deleteSave(slot: number): boolean;
    /**
     * Check if save exists
     */
    saveExists(slot: number): boolean;
    /**
     * Get save file info
     */
    getSaveInfo(slot: number): {
        timestamp: number;
        playtime: number;
    } | null;
    /**
     * Get all save slots info
     */
    getAllSaveInfo(): Array<{
        slot: number;
        info: {
            timestamp: number;
            playtime: number;
        } | null;
    }>;
    /**
     * Get save file path
     */
    private getSaveFilePath;
    /**
     * Quick save (slot 0)
     */
    quickSave(gameState: GameState, player: Player): boolean;
    /**
     * Quick load
     */
    quickLoad(): SaveData | null;
}
