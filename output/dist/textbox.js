"use strict";
/**
 * Textbox and dialogue system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogueManager = exports.TextBoxManager = void 0;
class TextBoxManager {
    constructor() {
        this.textSpeed = 50; // ms per character
        this.textBox = {
            isVisible: false,
            text: "",
            currentChar: 0,
            speed: this.textSpeed,
            isComplete: false,
            hasMore: false,
        };
    }
    /**
     * Show text in textbox
     */
    showText(text, callback) {
        this.textBox = {
            isVisible: true,
            text: text,
            currentChar: 0,
            speed: this.textSpeed,
            isComplete: false,
            hasMore: false,
            callback: callback,
        };
    }
    /**
     * Update textbox (call each frame)
     */
    update(_deltaTime) {
        if (!this.textBox.isVisible || this.textBox.isComplete) {
            return;
        }
        // Advance text display
        if (this.textBox.currentChar < this.textBox.text.length) {
            this.textBox.currentChar++;
            if (this.textBox.currentChar >= this.textBox.text.length) {
                this.textBox.isComplete = true;
            }
        }
    }
    /**
     * Advance or close textbox
     */
    advance() {
        if (!this.textBox.isVisible) {
            return;
        }
        if (!this.textBox.isComplete) {
            // Skip to end
            this.textBox.currentChar = this.textBox.text.length;
            this.textBox.isComplete = true;
        }
        else if (this.textBox.hasMore) {
            // Load next page
            // This would be implemented based on game needs
        }
        else {
            // Close textbox
            this.close();
        }
    }
    /**
     * Close textbox
     */
    close() {
        if (this.textBox.callback) {
            this.textBox.callback();
        }
        this.textBox.isVisible = false;
        this.textBox.text = "";
        this.textBox.currentChar = 0;
        this.textBox.isComplete = false;
    }
    /**
     * Get current visible text
     */
    getVisibleText() {
        return this.textBox.text.substring(0, this.textBox.currentChar);
    }
    /**
     * Check if textbox is visible
     */
    isVisible() {
        return this.textBox.isVisible;
    }
    /**
     * Check if text is complete
     */
    isComplete() {
        return this.textBox.isComplete;
    }
    /**
     * Set text speed
     */
    setSpeed(speed) {
        this.textSpeed = speed;
        this.textBox.speed = speed;
    }
}
exports.TextBoxManager = TextBoxManager;
/**
 * Dialogue manager for NPC conversations
 */
class DialogueManager {
    constructor(textBoxManager) {
        this.dialogueQueue = [];
        this.currentIndex = 0;
        this.textBoxManager = textBoxManager;
    }
    /**
     * Start a dialogue sequence
     */
    startDialogue(messages, onComplete) {
        this.dialogueQueue = [...messages];
        this.currentIndex = 0;
        this.onComplete = onComplete;
        this.showNext();
    }
    /**
     * Show next message in queue
     */
    showNext() {
        if (this.currentIndex >= this.dialogueQueue.length) {
            if (this.onComplete) {
                this.onComplete();
            }
            this.dialogueQueue = [];
            return;
        }
        const message = this.dialogueQueue[this.currentIndex];
        this.currentIndex++;
        this.textBoxManager.showText(message, () => {
            // Called when message is closed
            this.showNext();
        });
    }
    /**
     * Advance dialogue
     */
    advance() {
        this.textBoxManager.advance();
    }
    /**
     * Check if dialogue is active
     */
    isActive() {
        return this.textBoxManager.isVisible() || this.dialogueQueue.length > 0;
    }
}
exports.DialogueManager = DialogueManager;
//# sourceMappingURL=textbox.js.map