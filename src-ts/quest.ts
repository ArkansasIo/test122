/**
 * Quest and Mission System for Labyrinth of the Dragon
 */

export enum QuestStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  FAILED = 3
}

export enum QuestType {
  MAIN = 'main',
  SIDE = 'side',
  DUNGEON = 'dungeon',
  COLLECT = 'collect',
  ESCORT = 'escort',
  DEFEAT = 'defeat'
}

export interface QuestObjective {
  id: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface QuestReward {
  gold?: number;
  experience?: number;
  items?: string[];
  reputation?: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  level: number;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisites?: string[];
  timeLimit?: number;
  startLocation?: string;
  completionLocation?: string;
}

export class QuestSystem {
  private quests: Map<string, Quest>;
  private activeQuests: Set<string>;
  private completedQuests: Set<string>;

  constructor() {
    this.quests = new Map();
    this.activeQuests = new Set();
    this.completedQuests = new Set();
  }

  /**
   * Register a new quest in the system
   */
  registerQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) {
      console.error(`Quest ${questId} not found`);
      return false;
    }

    // Check prerequisites
    if (quest.prerequisites) {
      for (const prereq of quest.prerequisites) {
        if (!this.completedQuests.has(prereq)) {
          console.warn(`Quest ${questId} requires ${prereq} to be completed first`);
          return false;
        }
      }
    }

    quest.status = QuestStatus.IN_PROGRESS;
    this.activeQuests.add(questId);
    return true;
  }

  /**
   * Update quest objective progress
   */
  updateObjective(questId: string, objectiveId: string, amount: number = 1): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== QuestStatus.IN_PROGRESS) return;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return;

    objective.currentCount = Math.min(
      objective.currentCount + amount,
      objective.targetCount
    );

    if (objective.currentCount >= objective.targetCount) {
      objective.completed = true;
    }

    // Check if all objectives are complete
    if (quest.objectives.every(obj => obj.completed)) {
      this.completeQuest(questId);
    }
  }

  /**
   * Complete a quest
   */
  completeQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.status = QuestStatus.COMPLETED;
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    console.log(`Quest completed: ${quest.name}`);
    this.grantRewards(quest.rewards);
  }

  /**
   * Fail a quest
   */
  failQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest) return;

    quest.status = QuestStatus.FAILED;
    this.activeQuests.delete(questId);
  }

  /**
   * Grant quest rewards to player
   */
  private grantRewards(rewards: QuestReward): void {
    // This should integrate with the player/inventory system
    console.log('Rewards granted:', rewards);
  }

  /**
   * Get all active quests
   */
  getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests)
      .map(id => this.quests.get(id))
      .filter(Boolean) as Quest[];
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Check if quest is available (prerequisites met)
   */
  isQuestAvailable(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    if (quest.status !== QuestStatus.NOT_STARTED) return false;

    if (quest.prerequisites) {
      return quest.prerequisites.every(prereq => 
        this.completedQuests.has(prereq)
      );
    }

    return true;
  }

  /**
   * Serialize quest data for saving
   */
  serialize(): string {
    const data = {
      activeQuests: Array.from(this.activeQuests),
      completedQuests: Array.from(this.completedQuests),
      questStates: Array.from(this.quests.entries()).map(([id, quest]) => ({
        id,
        status: quest.status,
        objectives: quest.objectives
      }))
    };
    return JSON.stringify(data);
  }

  /**
   * Restore quest data from save
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.activeQuests = new Set(parsed.activeQuests);
    this.completedQuests = new Set(parsed.completedQuests);

    for (const state of parsed.questStates) {
      const quest = this.quests.get(state.id);
      if (quest) {
        quest.status = state.status;
        quest.objectives = state.objectives;
      }
    }
  }
}
