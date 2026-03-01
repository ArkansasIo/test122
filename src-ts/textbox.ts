/**
 * Textbox and dialogue system
 */

import { TextBox } from "../types";

export class TextBoxManager {
  private textBox: TextBox;
  private textSpeed: number = 50; // ms per character

  constructor() {
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
  public showText(text: string, callback?: () => void): void {
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
  public update(_deltaTime: number): void {
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
  public advance(): void {
    if (!this.textBox.isVisible) {
      return;
    }

    if (!this.textBox.isComplete) {
      // Skip to end
      this.textBox.currentChar = this.textBox.text.length;
      this.textBox.isComplete = true;
    } else if (this.textBox.hasMore) {
      // Load next page
      // This would be implemented based on game needs
    } else {
      // Close textbox
      this.close();
    }
  }

  /**
   * Close textbox
   */
  public close(): void {
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
  public getVisibleText(): string {
    return this.textBox.text.substring(0, this.textBox.currentChar);
  }

  /**
   * Check if textbox is visible
   */
  public isVisible(): boolean {
    return this.textBox.isVisible;
  }

  /**
   * Check if text is complete
   */
  public isComplete(): boolean {
    return this.textBox.isComplete;
  }

  /**
   * Set text speed
   */
  public setSpeed(speed: number): void {
    this.textSpeed = speed;
    this.textBox.speed = speed;
  }
}

/**
 * Dialogue manager for NPC conversations
 */
export class DialogueManager {
  private textBoxManager: TextBoxManager;
  private dialogueQueue: string[] = [];
  private currentIndex: number = 0;
  private onComplete?: () => void;

  constructor(textBoxManager: TextBoxManager) {
    this.textBoxManager = textBoxManager;
  }

  /**
   * Start a dialogue sequence
   */
  public startDialogue(messages: string[], onComplete?: () => void): void {
    this.dialogueQueue = [...messages];
    this.currentIndex = 0;
    this.onComplete = onComplete;
    this.showNext();
  }

  /**
   * Show next message in queue
   */
  private showNext(): void {
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
  public advance(): void {
    this.textBoxManager.advance();
  }

  /**
   * Check if dialogue is active
   */
  public isActive(): boolean {
    return this.textBoxManager.isVisible() || this.dialogueQueue.length > 0;
  }
}
