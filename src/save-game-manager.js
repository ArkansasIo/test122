/**
 * Save Game Manager
 * Handles game state serialization, saving, loading, and slots
 */
/* global localStorage */

class SaveData {
  constructor(slotName = 'Save Slot') {
    this.slotName = slotName;
    this.timestamp = new Date().toISOString();
    this.playTime = 0; // seconds
    this.level = 1;
    this.checkpoint = 'start';
    this.playerData = {
      name: 'Player',
      health: 100,
      maxHealth: 100,
      experience: 0,
      level: 1,
      position: { x: 0, y: 0 },
      inventory: [],
      equipment: {}
    };
    this.worldData = {
      currentScene: 'intro',
      npcStates: {},
      terrainChanges: {},
      events: []
    };
    this.gameFlags = {}; // Story progression flags
    this.version = '1.0';
    this.metadata = {
      difficulty: 'normal',
      permadeath: false,
      customData: {}
    };
  }

  addFlag(flag, value = true) {
    this.gameFlags[flag] = value;
  }

  hasFlag(flag) {
    return this.gameFlags[flag] || false;
  }

  addCustomData(key, value) {
    this.metadata.customData[key] = value;
  }

  getCustomData(key) {
    return this.metadata.customData[key];
  }

  serialize() {
    return JSON.stringify(this, null, 2);
  }

  static deserialize(jsonStr) {
    const data = JSON.parse(jsonStr);
    const save = new SaveData(data.slotName);
    Object.assign(save, data);
    return save;
  }
}

class SaveSlot {
  constructor(number = 1) {
    this.number = number;
    this.saveData = null;
    this.isEmpty = true;
    this.lastModified = null;
  }

  save(saveData) {
    this.saveData = saveData;
    this.isEmpty = false;
    this.lastModified = new Date();
  }

  clear() {
    this.saveData = null;
    this.isEmpty = true;
    this.lastModified = null;
  }

  getSummary() {
    if (this.isEmpty) {
      return {
        isEmpty: true,
        text: '(Empty)'
      };
    }
    return {
      isEmpty: false,
      slotName: this.saveData.slotName,
      level: this.saveData.level,
      playTime: this.formatPlayTime(this.saveData.playTime),
      lastModified: this.lastModified.toLocaleString(),
      difficulty: this.saveData.metadata.difficulty
    };
  }

  formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }
}

class SaveGameManager {
  constructor(maxSlots = 10) {
    this.slots = [];
    this.currentSlot = 0;
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 300; // 5 minutes in seconds
    this.lastAutoSaveTime = 0;
    this.activeSession = null;
    this.backupEnabled = true;
    this.maxBackups = 3;
    this.backups = [];

    // Initialize slots
    for (let i = 0; i < maxSlots; i++) {
      this.slots.push(new SaveSlot(i + 1));
    }

    // Try to load from localStorage
    this.loadFromStorage();
  }

  getSaveData() {
    return this.slots[this.currentSlot].saveData;
  }

  createNewGame(config = {}) {
    const save = new SaveData(config.slotName || `Game - Slot ${this.currentSlot + 1}`);
    save.metadata.difficulty = config.difficulty || 'normal';
    save.playerData.name = config.playerName || 'Hero';
    
    this.slots[this.currentSlot].save(save);
    this.activeSession = save;
    this.lastAutoSaveTime = Date.now();
    return save;
  }

  save(slotNumber = this.currentSlot, createBackup = true) {
    if (slotNumber < 0 || slotNumber >= this.slots.length) {
      console.warn(`Invalid slot: ${slotNumber}`);
      return false;
    }

    if (createBackup && this.backupEnabled && this.slots[slotNumber].saveData) {
      this.createBackup(slotNumber);
    }

    const saveData = this.activeSession || this.slots[slotNumber].saveData;
    if (!saveData) {
      console.warn('No active save data');
      return false;
    }

    saveData.timestamp = new Date().toISOString();
    this.slots[slotNumber].save(saveData);
    this.currentSlot = slotNumber;

    // Save to localStorage
    this.saveToStorage();
    return true;
  }

  load(slotNumber) {
    if (slotNumber < 0 || slotNumber >= this.slots.length) {
      console.warn(`Invalid slot: ${slotNumber}`);
      return null;
    }

    const slot = this.slots[slotNumber];
    if (slot.isEmpty) {
      console.warn(`Slot ${slotNumber} is empty`);
      return null;
    }

    this.activeSession = slot.saveData;
    this.currentSlot = slotNumber;
    return slot.saveData;
  }

  autoSave() {
    if (!this.autoSaveEnabled || !this.activeSession) return;

    const now = Date.now();
    if (now - this.lastAutoSaveTime >= this.autoSaveInterval * 1000) {
      const autoSaveSlot = this.slots.length - 1;
      const saveData = this.activeSession;
      saveData.slotName = 'Auto Save';
      this.slots[autoSaveSlot].save(saveData);
      this.saveToStorage();
      this.lastAutoSaveTime = now;
      return true;
    }
    return false;
  }

  createBackup(slotNumber) {
    const slot = this.slots[slotNumber];
    if (slot.saveData) {
      const backup = {
        data: JSON.parse(JSON.stringify(slot.saveData)),
        timestamp: new Date().toISOString(),
        slot: slotNumber
      };
      this.backups.push(backup);

      // Limit backups
      if (this.backups.length > this.maxBackups) {
        this.backups.shift();
      }
    }
  }

  restoreBackup(backupIndex) {
    if (backupIndex < 0 || backupIndex >= this.backups.length) {
      return false;
    }
    const backup = this.backups[backupIndex];
    const slot = this.slots[backup.slot];
    slot.save(backup.data);
    this.activeSession = backup.data;
    this.saveToStorage();
    return true;
  }

  deleteSlot(slotNumber) {
    if (slotNumber < 0 || slotNumber >= this.slots.length) return false;
    this.slots[slotNumber].clear();
    this.saveToStorage();
    return true;
  }

  getSlotSummary(slotNumber) {
    if (slotNumber < 0 || slotNumber >= this.slots.length) return null;
    return this.slots[slotNumber].getSummary();
  }

  getAllSlots() {
    return this.slots;
  }

  saveToStorage() {
    try {
      const savesData = {
        slots: this.slots.map(slot => ({
          number: slot.number,
          isEmpty: slot.isEmpty,
          data: slot.saveData ? slot.saveData.serialize() : null,
          lastModified: slot.lastModified
        })),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('dragon-studio-saves', JSON.stringify(savesData));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  loadFromStorage() {
    try {
      const savesData = localStorage.getItem('dragon-studio-saves');
      if (!savesData) return;

      const data = JSON.parse(savesData);
      for (let i = 0; i < data.slots.length && i < this.slots.length; i++) {
        const slotData = data.slots[i];
        if (!slotData.isEmpty && slotData.data) {
          this.slots[i].saveData = SaveData.deserialize(slotData.data);
          this.slots[i].isEmpty = false;
          this.slots[i].lastModified = new Date(slotData.lastModified);
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  }

  exportToFile(slotNumber) {
    if (slotNumber < 0 || slotNumber >= this.slots.length) return null;
    const slot = this.slots[slotNumber];
    if (slot.isEmpty) return null;

    return {
      filename: `SaveGame_Slot${slotNumber + 1}_${Date.now()}.json`,
      content: slot.saveData.serialize()
    };
  }

  importFromFile(slotNumber, jsonContent) {
    if (slotNumber < 0 || slotNumber >= this.slots.length) return false;
    try {
      const saveData = SaveData.deserialize(jsonContent);
      this.slots[slotNumber].save(saveData);
      this.saveToStorage();
      return true;
    } catch (e) {
      console.error('Failed to import save file:', e);
      return false;
    }
  }

  getStatistics() {
    const filledSlots = this.slots.filter(s => !s.isEmpty).length;
    const totalPlayTime = this.slots.reduce((sum, s) => {
      return sum + (s.saveData ? s.saveData.playTime : 0);
    }, 0);

    return {
      totalSlots: this.slots.length,
      filledSlots,
      emptySlots: this.slots.length - filledSlots,
      totalPlayTime,
      backupCount: this.backups.length
    };
  }

  serialize() {
    return {
      slots: this.slots.map(s => ({
        number: s.number,
        isEmpty: s.isEmpty,
        data: s.saveData
      })),
      version: '1.0'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SaveData, SaveSlot, SaveGameManager };
}
