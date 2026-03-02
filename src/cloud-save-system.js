/**
 * Cloud Save Integration
 * Manages game saves with cloud synchronization, versioning, and conflict resolution
 */
/* global window, navigator */

class SaveFile {
  constructor(name = '', gameState = {}, slot = 1) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.gameState = gameState;
    this.slot = slot;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.checksum = this.generateChecksum();
    this.version = '1.0';
    this.metadata = {
      playerLevel: 1,
      playtime: 0,
      location: '',
      character: '',
      difficulty: 'normal'
    };
    this.localOnly = false;
    this.cloudVersion = null;
    this.syncStatus = 'pending'; // pending, synced, conflict, failed
  }

  generateChecksum() {
    return Math.random().toString(36).substr(2, 9);
  }

  updateState(gameState) {
    this.gameState = gameState;
    this.updatedAt = Date.now();
    this.checksum = this.generateChecksum();
    this.syncStatus = 'pending';
  }

  updateMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      gameState: this.gameState,
      slot: this.slot,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      checksum: this.checksum,
      version: this.version,
      metadata: this.metadata,
      cloudVersion: this.cloudVersion
    };
  }

  static deserialize(data) {
    const save = new SaveFile(data.name, data.gameState, data.slot);
    save.id = data.id;
    save.createdAt = data.createdAt;
    save.updatedAt = data.updatedAt;
    save.checksum = data.checksum;
    save.version = data.version;
    save.metadata = data.metadata;
    save.cloudVersion = data.cloudVersion;
    return save;
  }
}

class SaveConflict {
  constructor(saveFile, localVersion, cloudVersion) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.saveFile = saveFile;
    this.localVersion = localVersion;
    this.cloudVersion = cloudVersion;
    this.timestamp = Date.now();
    this.resolved = false;
    this.resolution = null; // 'local', 'cloud', 'merge'
  }

  getConflictDetails() {
    return {
      localUpdated: this.localVersion.updatedAt,
      cloudUpdated: this.cloudVersion.updatedAt,
      localPlaytime: this.localVersion.metadata.playtime,
      cloudPlaytime: this.cloudVersion.metadata.playtime,
      localLevel: this.localVersion.metadata.playerLevel,
      cloudLevel: this.cloudVersion.metadata.playerLevel
    };
  }

  mergeVersions() {
    // Take the more progressed version
    if (this.cloudVersion.metadata.playerLevel > this.localVersion.metadata.playerLevel) {
      return this.cloudVersion;
    }
    if (this.localVersion.metadata.playerLevel > this.cloudVersion.metadata.playerLevel) {
      return this.localVersion;
    }
    // If equal, take the more recent
    return this.localVersion.updatedAt > this.cloudVersion.updatedAt 
      ? this.localVersion 
      : this.cloudVersion;
  }
}

class CloudSaveManager {
  constructor(userId = '', apiEndpoint = '') {
    this.userId = userId;
    this.apiEndpoint = apiEndpoint;
    this.localSaves = new Map();
    this.cloudSaves = new Map();
    this.saveSlots = 5; // Max save slots
    this.syncInterval = 60000; // 60 seconds
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSyncing = false;
    this.conflicts = [];
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : null;
    this.autoSync = true;
    this.lastSyncTime = 0;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      this.startAutoSync();
    }
  }

  handleOnline() {
    this.isOnline = true;
    console.log('Cloud save: Online detected, attempting sync');
    this.sync();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('Cloud save: Offline detected, saving to local only');
  }

  startAutoSync() {
    if (this.autoSync && this.syncInterval > 0) {
      setInterval(() => this.sync(), this.syncInterval);
    }
  }

  createSaveFile(name, gameState, slot = null) {
    // Find available slot
    if (slot === null) {
      for (let i = 1; i <= this.saveSlots; i++) {
        if (!this.localSaves.has(i)) {
          slot = i;
          break;
        }
      }
    }

    if (slot === null) {
      console.warn('No save slots available');
      return null;
    }

    const save = new SaveFile(name, gameState, slot);
    this.localSaves.set(slot, save);
    this.saveToLocalStorage();
    return save;
  }

  updateSaveFile(slot, gameState, metadata = {}) {
    if (!this.localSaves.has(slot)) {
      console.warn(`Save slot ${slot} not found`);
      return null;
    }

    const save = this.localSaves.get(slot);
    save.updateState(gameState);
    save.updateMetadata(metadata);
    this.saveToLocalStorage();
    return save;
  }

  deleteSaveFile(slot) {
    const result = this.localSaves.delete(slot);
    if (result) {
      this.saveToLocalStorage();
    }
    return result;
  }

  getSaveFile(slot) {
    return this.localSaves.get(slot);
  }

  getAllSaveFiles() {
    return Array.from(this.localSaves.values());
  }

  listSaveSlots() {
    const slots = [];
    for (let i = 1; i <= this.saveSlots; i++) {
      const save = this.localSaves.get(i);
      slots.push({
        slot: i,
        used: save !== undefined,
        save: save || null
      });
    }
    return slots;
  }

  async sync() {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    console.log('Starting cloud save sync...');

    try {
      // Fetch cloud saves
      const cloudSaves = await this.fetchCloudSaves();
      this.cloudSaves = new Map(Object.entries(cloudSaves || {}));

      // Check for conflicts
      this.detectConflicts();

      // Upload local saves
      await this.uploadLocalSaves();

      // Download cloud saves
      await this.downloadCloudSaves();

      this.lastSyncTime = Date.now();
      console.log('Cloud save sync completed successfully');
    } catch (error) {
      console.error('Cloud save sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  detectConflicts() {
    this.conflicts = [];

    for (let [slot, localSave] of this.localSaves) {
      if (this.cloudSaves.has(slot)) {
        const cloudSave = this.cloudSaves.get(slot);
        
        if (localSave.checksum !== cloudSave.checksum &&
            localSave.updatedAt !== cloudSave.updatedAt) {
          const conflict = new SaveConflict(localSave, localSave, cloudSave);
          this.conflicts.push(conflict);
        }
      }
    }

    console.log(`Detected ${this.conflicts.length} save conflicts`);
  }

  resolveConflict(conflictId, resolution = 'merge') {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return false;

    let resolvedSave;
    if (resolution === 'local') {
      resolvedSave = conflict.localVersion;
    } else if (resolution === 'cloud') {
      resolvedSave = conflict.cloudVersion;
    } else if (resolution === 'merge') {
      resolvedSave = conflict.mergeVersions();
    } else {
      return false;
    }

    this.localSaves.set(conflict.saveFile.slot, resolvedSave);
    conflict.resolved = true;
    conflict.resolution = resolution;
    return true;
  }

  async fetchCloudSaves() {
    if (!this.apiEndpoint) return {};

    try {
      const response = await fetch(`${this.apiEndpoint}/saves/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch cloud saves:', error);
    }
    return {};
  }

  async uploadLocalSaves() {
    if (!this.apiEndpoint) return;

    for (let [slot, save] of this.localSaves) {
      if (save.syncStatus === 'pending' || save.syncStatus === 'failed') {
        try {
          const response = await fetch(`${this.apiEndpoint}/saves/${this.userId}/${slot}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(save.serialize())
          });

          if (response.ok) {
            save.syncStatus = 'synced';
            save.cloudVersion = await response.json();
          } else {
            save.syncStatus = 'failed';
          }
        } catch (error) {
          console.warn(`Failed to upload save slot ${slot}:`, error);
          save.syncStatus = 'failed';
        }
      }
    }
  }

  async downloadCloudSaves() {
    if (!this.apiEndpoint) return;

    for (let [slot, cloudSave] of this.cloudSaves) {
      if (!this.localSaves.has(slot)) {
        this.localSaves.set(slot, SaveFile.deserialize(cloudSave));
      }
    }
  }

  getAuthToken() {
    if (this.localStorage) {
      return this.localStorage.getItem('cloudAuthToken') || '';
    }
    return '';
  }

  setAuthToken(token) {
    if (this.localStorage) {
      this.localStorage.setItem('cloudAuthToken', token);
    }
  }

  saveToLocalStorage() {
    if (!this.localStorage) return;

    try {
      const saves = {};
      for (let [slot, save] of this.localSaves) {
        saves[slot] = save.serialize();
      }
      this.localStorage.setItem(`${this.userId}_saves`, JSON.stringify(saves));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }

  loadFromLocalStorage() {
    if (!this.localStorage) return;

    try {
      const data = this.localStorage.getItem(`${this.userId}_saves`);
      if (data) {
        const saves = JSON.parse(data);
        for (let [slot, saveData] of Object.entries(saves)) {
          this.localSaves.set(parseInt(slot), SaveFile.deserialize(saveData));
        }
      }
    } catch (e) {
      console.error('Failed to load from local storage:', e);
    }
  }

  exportSaves(format = 'json') {
    const data = {
      userId: this.userId,
      exportDate: new Date().toISOString(),
      saves: this.getAllSaveFiles().map(s => s.serialize())
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'backup') {
      // Create a backup format with compression metadata
      return JSON.stringify({
        ...data,
        compressed: false,
        version: '1.0'
      }, null, 2);
    }

    return null;
  }

  importSaves(data, overwrite = false) {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (!parsed.saves || !Array.isArray(parsed.saves)) {
        console.error('Invalid save data format');
        return false;
      }

      if (overwrite) {
        this.localSaves.clear();
      }

      for (let saveData of parsed.saves) {
        const save = SaveFile.deserialize(saveData);
        if (!this.localSaves.has(save.slot) || overwrite) {
          this.localSaves.set(save.slot, save);
        }
      }

      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Failed to import saves:', error);
      return false;
    }
  }

  getStats() {
    return {
      userId: this.userId,
      saveCount: this.localSaves.size,
      totalSlots: this.saveSlots,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      conflictCount: this.conflicts.length,
      unresolvedConflicts: this.conflicts.filter(c => !c.resolved).length,
      saveSizes: Array.from(this.localSaves.values()).map(s => ({
        slot: s.slot,
        name: s.name,
        size: JSON.stringify(s.serialize()).length,
        updated: s.updatedAt
      }))
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SaveFile, SaveConflict, CloudSaveManager };
}
