/**
 * Textbox and dialogue system
 */
export declare class TextBoxManager {
    private textBox;
    private textSpeed;
    constructor();
    /**
     * Show text in textbox
     */
    showText(text: string, callback?: () => void): void;
    /**
     * Update textbox (call each frame)
     */
    update(_deltaTime: number): void;
    /**
     * Advance or close textbox
     */
    advance(): void;
    /**
     * Close textbox
     */
    close(): void;
    /**
     * Get current visible text
     */
    getVisibleText(): string;
    /**
     * Check if textbox is visible
     */
    isVisible(): boolean;
    /**
     * Check if text is complete
     */
    isComplete(): boolean;
    /**
     * Set text speed
     */
    setSpeed(speed: number): void;
}
/**
 * Dialogue manager for NPC conversations
 */
export declare class DialogueManager {
    private textBoxManager;
    private dialogueQueue;
    private currentIndex;
    private onComplete?;
    constructor(textBoxManager: TextBoxManager);
    /**
     * Start a dialogue sequence
     */
    startDialogue(messages: string[], onComplete?: () => void): void;
    /**
     * Show next message in queue
     */
    private showNext;
    /**
     * Advance dialogue
     */
    advance(): void;
    /**
     * Check if dialogue is active
     */
    isActive(): boolean;
}
