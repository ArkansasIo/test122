/**
 * Core game engine module
 * Main game loop and initialization
 */
import { GameState, Screen } from "../types";
export declare class GameEngine {
    private gameState;
    private isInitialized;
    private frameCount;
    private lastTime;
    constructor();
    /**
     * Initialize the game engine
     */
    initialize(): void;
    /**
     * Start the game loop
     */
    start(): void;
    /**
     * Stop the game loop
     */
    stop(): void;
    /**
     * Main game loop
     */
    private gameLoop;
    /**
     * Update game state
     */
    private update;
    /**
     * Render current frame
     */
    private render;
    /**
     * Create initial game state
     */
    private createInitialGameState;
    /**
     * Create default player
     */
    private createDefaultPlayer;
    private updateTitleScreen;
    private updateMainMenu;
    private updateHeroSelect;
    private updateGame;
    private updateBattle;
    private updateCredits;
    private initializeGraphics;
    private initializeSound;
    private initializeInput;
    /**
     * Get current game state
     */
    getGameState(): GameState;
    /**
     * Set current screen
     */
    setScreen(screen: Screen): void;
}
