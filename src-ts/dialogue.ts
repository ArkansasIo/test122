/**
 * NPC Dialogue and Conversation System
 */

export enum DialogueNodeType {
  TEXT = 'text',
  CHOICE = 'choice',
  CONDITIONAL = 'conditional',
  QUEST_START = 'quest_start',
  QUEST_COMPLETE = 'quest_complete',
  SHOP = 'shop',
  END = 'end'
}

export interface DialogueChoice {
  text: string;
  nextNodeId: string;
  condition?: () => boolean;
  action?: () => void;
}

export interface DialogueNode {
  id: string;
  type: DialogueNodeType;
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
  nextNodeId?: string;
  condition?: () => boolean;
  action?: () => void;
}

export interface NPCDialogue {
  npcId: string;
  npcName: string;
  greeting: string;
  farewell: string;
  nodes: DialogueNode[];
  startNodeId: string;
}

export class DialogueSystem {
  private dialogues: Map<string, NPCDialogue>;
  private currentDialogue: NPCDialogue | null;
  private currentNode: DialogueNode | null;
  private dialogueHistory: string[];

  constructor() {
    this.dialogues = new Map();
    this.currentDialogue = null;
    this.currentNode = null;
    this.dialogueHistory = [];
  }

  /**
   * Register NPC dialogue tree
   */
  registerDialogue(dialogue: NPCDialogue): void {
    this.dialogues.set(dialogue.npcId, dialogue);
  }

  /**
   * Start conversation with an NPC
   */
  startDialogue(npcId: string): boolean {
    const dialogue = this.dialogues.get(npcId);
    if (!dialogue) {
      console.error(`No dialogue found for NPC: ${npcId}`);
      return false;
    }

    this.currentDialogue = dialogue;
    this.currentNode = this.getNode(dialogue.startNodeId);
    this.dialogueHistory = [];

    if (!this.currentNode) {
      console.error(`Start node ${dialogue.startNodeId} not found`);
      return false;
    }

    return true;
  }

  /**
   * Get current dialogue node
   */
  getCurrentNode(): DialogueNode | null {
    return this.currentNode;
  }

  /**
   * Get current dialogue text with speaker
   */
  getCurrentDialogueText(): string {
    if (!this.currentNode || !this.currentDialogue) return '';
    
    return `${this.currentDialogue.npcName}: ${this.currentNode.text}`;
  }

  /**
   * Get available choices for current node
   */
  getAvailableChoices(): DialogueChoice[] {
    if (!this.currentNode || this.currentNode.type !== DialogueNodeType.CHOICE) {
      return [];
    }

    // Filter choices based on conditions
    return (this.currentNode.choices || []).filter(choice => {
      return !choice.condition || choice.condition();
    });
  }

  /**
   * Select a dialogue choice
   */
  selectChoice(choiceIndex: number): boolean {
    const choices = this.getAvailableChoices();
    if (choiceIndex < 0 || choiceIndex >= choices.length) {
      console.error('Invalid choice index');
      return false;
    }

    const choice = choices[choiceIndex];
    
    // Execute choice action if any
    if (choice.action) {
      choice.action();
    }

    // Move to next node
    return this.advanceToNode(choice.nextNodeId);
  }

  /**
   * Advance to next node in dialogue
   */
  advanceDialogue(): boolean {
    if (!this.currentNode) return false;

    // Auto-advance for non-choice nodes
    if (this.currentNode.type !== DialogueNodeType.CHOICE && this.currentNode.nextNodeId) {
      return this.advanceToNode(this.currentNode.nextNodeId);
    }

    // End dialogue if no next node
    if (this.currentNode.type === DialogueNodeType.END) {
      this.endDialogue();
      return false;
    }

    return true;
  }

  /**
   * Move to specific node
   */
  private advanceToNode(nodeId: string): boolean {
    const nextNode = this.getNode(nodeId);
    if (!nextNode) {
      console.error(`Node ${nodeId} not found`);
      this.endDialogue();
      return false;
    }

    // Check node condition
    if (nextNode.condition && !nextNode.condition()) {
      // Skip nodes that don't meet conditions
      if (nextNode.nextNodeId) {
        return this.advanceToNode(nextNode.nextNodeId);
      } else {
        this.endDialogue();
        return false;
      }
    }

    // Add current node to history
    if (this.currentNode) {
      this.dialogueHistory.push(this.currentNode.id);
    }

    // Execute node action
    if (nextNode.action) {
      nextNode.action();
    }

    this.currentNode = nextNode;

    // Auto-end dialogue if END node reached
    if (nextNode.type === DialogueNodeType.END) {
      this.endDialogue();
      return false;
    }

    return true;
  }

  /**
   * Get node by ID from current dialogue
   */
  private getNode(nodeId: string): DialogueNode | null {
    if (!this.currentDialogue) return null;
    return this.currentDialogue.nodes.find(node => node.id === nodeId) || null;
  }

  /**
   * End current dialogue
   */
  endDialogue(): void {
    if (this.currentDialogue) {
      console.log(`Dialogue ended with ${this.currentDialogue.npcName}`);
    }
    this.currentDialogue = null;
    this.currentNode = null;
  }

  /**
   * Check if in active dialogue
   */
  isInDialogue(): boolean {
    return this.currentDialogue !== null && this.currentNode !== null;
  }

  /**
   * Get dialogue history
   */
  getHistory(): string[] {
    return [...this.dialogueHistory];
  }

  /**
   * Skip to specific node (for debugging)
   */
  skipToNode(nodeId: string): boolean {
    if (!this.currentDialogue) return false;
    return this.advanceToNode(nodeId);
  }
}

/**
 * Helper function to create a simple linear dialogue
 */
export function createSimpleDialogue(
  npcId: string,
  npcName: string,
  messages: string[]
): NPCDialogue {
  const nodes: DialogueNode[] = messages.map((text, index) => ({
    id: `node_${index}`,
    type: index === messages.length - 1 ? DialogueNodeType.END : DialogueNodeType.TEXT,
    speaker: npcName,
    text,
    nextNodeId: index < messages.length - 1 ? `node_${index + 1}` : undefined
  }));

  return {
    npcId,
    npcName,
    greeting: messages[0],
    farewell: messages[messages.length - 1],
    nodes,
    startNodeId: 'node_0'
  };
}
