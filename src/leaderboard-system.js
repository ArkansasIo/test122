/**
 * Leaderboard & Score System
 * Manages player scores, rankings, and persistent leaderboard storage
 */

class Score {
  constructor(playerId = '', playerName = '', points = 0, timestamp = Date.now()) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.playerId = playerId;
    this.playerName = playerName;
    this.points = points;
    this.timestamp = timestamp;
    this.achievements = [];
    this.sessionTime = 0;
    this.level = 1;
    this.difficulty = 'normal';
  }

  calculateRank(allScores) {
    const sorted = allScores.sort((a, b) => b.points - a.points);
    return sorted.findIndex(s => s.id === this.id) + 1;
  }

  addAchievement(name, value = 100) {
    this.achievements.push({
      name,
      value,
      timestamp: Date.now()
    });
  }

  serialize() {
    return {
      id: this.id,
      playerId: this.playerId,
      playerName: this.playerName,
      points: this.points,
      timestamp: this.timestamp,
      achievements: this.achievements,
      sessionTime: this.sessionTime,
      level: this.level,
      difficulty: this.difficulty
    };
  }

  static deserialize(data) {
    const score = new Score(data.playerId, data.playerName, data.points, data.timestamp);
    score.id = data.id;
    score.achievements = data.achievements || [];
    score.sessionTime = data.sessionTime || 0;
    score.level = data.level || 1;
    score.difficulty = data.difficulty || 'normal';
    return score;
  }
}

class Leaderboard {
  constructor(name = 'Global', maxEntries = 100) {
    this.name = name;
    this.entries = [];
    this.maxEntries = maxEntries;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    this.filters = {
      difficulty: null,
      level: null,
      timeRange: null
    };
  }

  addScore(score) {
    this.entries.push(score);
    this.entries.sort((a, b) => b.points - a.points);
    
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
    
    this.updatedAt = Date.now();
    return score.calculateRank(this.entries);
  }

  removeScore(scoreId) {
    this.entries = this.entries.filter(e => e.id !== scoreId);
    this.updatedAt = Date.now();
  }

  getTopScores(limit = 10) {
    return this.entries.slice(0, limit);
  }

  getPlayerScores(playerId) {
    return this.entries.filter(e => e.playerId === playerId);
  }

  getScoreByRank(rank) {
    return this.entries[rank - 1] || null;
  }

  getScoreById(scoreId) {
    return this.entries.find(e => e.id === scoreId);
  }

  getStats() {
    if (this.entries.length === 0) {
      return {
        totalScores: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = this.entries.map(e => e.points);
    return {
      totalScores: this.entries.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalTime: Math.round(this.entries.reduce((a, b) => a + b.sessionTime, 0) / 1000)
    };
  }

  filterScores(criteria = {}) {
    let filtered = [...this.entries];

    if (criteria.difficulty) {
      filtered = filtered.filter(s => s.difficulty === criteria.difficulty);
    }

    if (criteria.minPoints) {
      filtered = filtered.filter(s => s.points >= criteria.minPoints);
    }

    if (criteria.maxPoints) {
      filtered = filtered.filter(s => s.points <= criteria.maxPoints);
    }

    if (criteria.playerName) {
      filtered = filtered.filter(s => 
        s.playerName.toLowerCase().includes(criteria.playerName.toLowerCase())
      );
    }

    return filtered;
  }

  serialize() {
    return {
      name: this.name,
      entries: this.entries.map(e => e.serialize()),
      maxEntries: this.maxEntries,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static deserialize(data) {
    const lb = new Leaderboard(data.name, data.maxEntries);
    lb.entries = data.entries.map(e => Score.deserialize(e));
    lb.createdAt = data.createdAt;
    lb.updatedAt = data.updatedAt;
    return lb;
  }
}

/* global window */
class LeaderboardManager {
  constructor() {
    this.leaderboards = new Map();
    this.currentPlayer = null;
    this.currentScore = null;
    this.achievementCallbacks = {};
    // eslint-disable-next-line no-undef
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : null;
  }

  createLeaderboard(name, maxEntries = 100) {
    const lb = new Leaderboard(name, maxEntries);
    this.leaderboards.set(name, lb);
    return lb;
  }

  getLeaderboard(name) {
    return this.leaderboards.get(name);
  }

  deleteLeaderboard(name) {
    return this.leaderboards.delete(name);
  }

  getAllLeaderboards() {
    return Array.from(this.leaderboards.values());
  }

  startSession(playerId, playerName) {
    this.currentPlayer = { playerId, playerName };
    this.currentScore = new Score(playerId, playerName);
    return this.currentScore;
  }

  endSession() {
    if (!this.currentScore) return null;
    
    this.currentScore.sessionTime = Date.now() - this.currentScore.timestamp;
    
    // Add to all leaderboards
    for (let [, lb] of this.leaderboards) {
      const rank = lb.addScore(this.currentScore);
      console.log(`Score submitted to "${lb.name}": Rank #${rank}`);
    }

    const finalScore = this.currentScore;
    this.currentScore = null;
    return finalScore;
  }

  addPoints(amount) {
    if (this.currentScore) {
      this.currentScore.points += amount;
      return this.currentScore.points;
    }
    return 0;
  }

  subtractPoints(amount) {
    if (this.currentScore) {
      this.currentScore.points = Math.max(0, this.currentScore.points - amount);
      return this.currentScore.points;
    }
    return 0;
  }

  setPoints(amount) {
    if (this.currentScore) {
      this.currentScore.points = Math.max(0, amount);
      return this.currentScore.points;
    }
    return 0;
  }

  getCurrentPoints() {
    return this.currentScore ? this.currentScore.points : 0;
  }

  registerAchievementCallback(achievementName, callback) {
    this.achievementCallbacks[achievementName] = callback;
  }

  unlockAchievement(achievementName, pointReward = 100) {
    if (!this.currentScore) return false;

    if (this.currentScore.achievements.some(a => a.name === achievementName)) {
      return false; // Already unlocked
    }

    this.currentScore.addAchievement(achievementName, pointReward);
    this.addPoints(pointReward);

    if (this.achievementCallbacks[achievementName]) {
      this.achievementCallbacks[achievementName]();
    }

    return true;
  }

  getAchievements() {
    return this.currentScore ? this.currentScore.achievements : [];
  }

  getAllTimeStats() {
    const stats = {};
    for (let [name, lb] of this.leaderboards) {
      stats[name] = lb.getStats();
    }
    return stats;
  }

  getLeaderboardRankings(leaderboardName, limit = 10) {
    const lb = this.getLeaderboard(leaderboardName);
    if (!lb) return [];

    return lb.getTopScores(limit).map((score, index) => ({
      rank: index + 1,
      playerName: score.playerName,
      points: score.points,
      achievements: score.achievements.length,
      level: score.level,
      difficulty: score.difficulty
    }));
  }

  searchLeaderboard(leaderboardName, playerName) {
    const lb = this.getLeaderboard(leaderboardName);
    if (!lb) return [];

    return lb.filterScores({ playerName }).map(score => ({
      rank: score.calculateRank(lb.entries),
      playerId: score.playerId,
      playerName: score.playerName,
      points: score.points,
      achievements: score.achievements.length
    }));
  }

  save(key = 'leaderboards') {
    if (!this.localStorage) return false;

    const data = {
      leaderboards: Array.from(this.leaderboards.entries()).map(([name, lb]) => [name, lb.serialize()])
    };

    try {
      this.localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save leaderboards:', e);
      return false;
    }
  }

  load(key = 'leaderboards') {
    if (!this.localStorage) return false;

    try {
      const data = JSON.parse(this.localStorage.getItem(key));
      if (data && data.leaderboards) {
        for (let [name, lbData] of data.leaderboards) {
          this.leaderboards.set(name, Leaderboard.deserialize(lbData));
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to load leaderboards:', e);
    }
    return false;
  }

  exportLeaderboards(format = 'json') {
    const data = Array.from(this.leaderboards.entries()).map(([name, lb]) => ({
      name,
      ...lb.serialize()
    }));

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      let csv = 'Leaderboard,Rank,Player,Points,Achievements,Level,Difficulty\n';
      for (let lb of data) {
        for (let entry of lb.entries) {
          csv += `${lb.name},${entry.calculateRank(lb.entries)},${entry.playerName},${entry.points},${entry.achievements.length},${entry.level},${entry.difficulty}\n`;
        }
      }
      return csv;
    }

    return null;
  }

  getStats() {
    return {
      leaderboardCount: this.leaderboards.size,
      totalScores: Array.from(this.leaderboards.values()).reduce((sum, lb) => sum + lb.entries.length, 0),
      currentPlayerPoints: this.getCurrentPoints(),
      achievements: this.getAchievements().length,
      allTimeStatsPerLeaderboard: this.getAllTimeStats()
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Score, Leaderboard, LeaderboardManager };
}
