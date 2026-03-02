/**
 * Analytics & Telemetry System
 * Tracks gameplay events, performance metrics, user behavior, and error diagnostics
 */

class AnalyticsEvent {
  constructor(eventName, category = '', properties = {}) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.eventName = eventName;
    this.category = category;
    this.properties = properties;
    this.timestamp = Date.now();
    this.sessionId = null;
    this.userId = null;
    this.metadata = {
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      platform: typeof navigator !== 'undefined' ? navigator.platform : ''
    };
  }

  serialize() {
    return {
      id: this.id,
      eventName: this.eventName,
      category: this.category,
      properties: this.properties,
      timestamp: this.timestamp,
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: this.metadata
    };
  }
}

class PerformanceMetric {
  constructor(name = '', value = 0, unit = 'ms', threshold = 0) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.value = value;
    this.unit = unit;
    this.threshold = threshold;
    this.timestamp = Date.now();
    this.exceeded = value > threshold;
    this.samples = [value];
  }

  addSample(value) {
    this.samples.push(value);
    this.value = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.exceeded = this.value > this.threshold;
  }

  getStatistics() {
    const sorted = [...this.samples].sort((a, b) => a - b);
    return {
      min: Math.min(...this.samples),
      max: Math.max(...this.samples),
      avg: this.value,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      sampleCount: this.samples.length
    };
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      statistics: this.getStatistics(),
      unit: this.unit,
      threshold: this.threshold,
      exceeded: this.exceeded,
      timestamp: this.timestamp
    };
  }
}

class SessionAnalytics {
  constructor(userId, sessionId) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.endTime = null;
    this.events = [];
    this.metrics = new Map();
    this.errors = [];
    this.achievements = [];
    this.gameState = {};
  }

  addEvent(event) {
    event.userId = this.userId;
    event.sessionId = this.sessionId;
    this.events.push(event);
  }

  trackMetric(name, value, unit = 'ms', threshold = 0) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, new PerformanceMetric(name, value, unit, threshold));
    } else {
      this.metrics.get(name).addSample(value);
    }
  }

  recordError(errorType, message, stackTrace = '') {
    this.errors.push({
      timestamp: Date.now(),
      type: errorType,
      message,
      stackTrace,
      severity: 'error'
    });
  }

  recordWarning(message) {
    this.errors.push({
      timestamp: Date.now(),
      type: 'warning',
      message,
      severity: 'warning'
    });
  }

  recordAchievement(name, value) {
    this.achievements.push({
      timestamp: Date.now(),
      name,
      value
    });
  }

  updateGameState(state) {
    this.gameState = { ...state, timestamp: Date.now() };
  }

  endSession() {
    this.endTime = Date.now();
    return this.getSummary();
  }

  getDuration() {
    return (this.endTime || Date.now()) - this.startTime;
  }

  getSummary() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      duration: this.getDuration(),
      eventCount: this.events.length,
      errorCount: this.errors.length,
      warningCount: this.errors.filter(e => e.severity === 'warning').length,
      achievements: this.achievements.length,
      metrics: Array.from(this.metrics.values()).map(m => m.serialize()),
      averageEventRate: this.events.length / (this.getDuration() / 1000),
      hasErrors: this.errors.length > 0
    };
  }

  serialize() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.getDuration(),
      events: this.events.map(e => e.serialize()),
      metrics: Array.from(this.metrics.entries()).map(([name, metric]) => [name, metric.serialize()]),
      errors: this.errors,
      achievements: this.achievements,
      gameState: this.gameState
    };
  }
}

class AnalyticsManager {
  constructor(userId = 'anonymousUser') {
    this.userId = userId;
    this.sessionId = Math.random().toString(36).substr(2, 9);
    this.currentSession = null;
    this.sessionHistory = [];
    this.eventBuffer = [];
    this.bufferSize = 100;
    this.autoFlushInterval = 30000; // 30 seconds
    this.isOnline = typeof navigator !== 'undefined' && navigator.onLine;
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : null;
    this.eventCallbacks = {};

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnlineStatus(true));
      window.addEventListener('offline', () => this.setOnlineStatus(false));
      this.startAutoFlush();
    }
  }

  startSession(customSessionId = null) {
    this.sessionId = customSessionId || Math.random().toString(36).substr(2, 9);
    this.currentSession = new SessionAnalytics(this.userId, this.sessionId);
    console.log(`Analytics session started: ${this.sessionId}`);
    return this.currentSession;
  }

  endSession() {
    if (!this.currentSession) return null;

    const summary = this.currentSession.endSession();
    this.sessionHistory.push(this.currentSession);
    const session = this.currentSession;
    this.currentSession = null;

    console.log(`Analytics session ended. Events: ${summary.eventCount}, Duration: ${Math.round(summary.duration / 1000)}s`);
    return summary;
  }

  trackEvent(eventName, category = '', properties = {}) {
    if (!this.currentSession) return;

    const event = new AnalyticsEvent(eventName, category, properties);
    this.currentSession.addEvent(event);
    this.eventBuffer.push(event);

    if (this.eventCallbacks[eventName]) {
      this.eventCallbacks[eventName](event);
    }

    if (this.eventBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  trackMetric(name, value, unit = 'ms', threshold = 0) {
    if (this.currentSession) {
      this.currentSession.trackMetric(name, value, unit, threshold);
    }
  }

  trackError(error) {
    if (!this.currentSession) return;

    const errorType = error.name || 'Error';
    const message = error.message || String(error);
    const stackTrace = error.stack || '';

    this.currentSession.recordError(errorType, message, stackTrace);
    this.trackEvent('Error', 'Error', { 
      type: errorType, 
      message,
      severity: 'error'
    });
  }

  trackWarning(message) {
    if (this.currentSession) {
      this.currentSession.recordWarning(message);
      this.trackEvent('Warning', 'System', { message });
    }
  }

  trackAchievement(name, value = 100) {
    if (this.currentSession) {
      this.currentSession.recordAchievement(name, value);
      this.trackEvent('Achievement', 'Gameplay', { 
        achievementName: name, 
        points: value 
      });
    }
  }

  trackGameplayEvent(eventName, data = {}) {
    this.trackEvent(eventName, 'Gameplay', data);
  }

  updateGameState(state) {
    if (this.currentSession) {
      this.currentSession.updateGameState(state);
    }
  }

  registerEventCallback(eventName, callback) {
    this.eventCallbacks[eventName] = callback;
  }

  setOnlineStatus(online) {
    this.isOnline = online;
    if (online && this.eventBuffer.length > 0) {
      this.flush();
    }
  }

  flush() {
    if (this.eventBuffer.length === 0) return;

    console.log(`Flushing ${this.eventBuffer.length} analytics events`);

    if (this.isOnline) {
      // In real implementation, would send to server
      this.eventBuffer = [];
    } else {
      // Store for later
      this.saveToLocalStorage();
    }
  }

  startAutoFlush() {
    if (this.autoFlushInterval > 0) {
      setInterval(() => this.flush(), this.autoFlushInterval);
    }
  }

  saveToLocalStorage() {
    if (!this.localStorage) return;

    try {
      const existing = this.localStorage.getItem('analyticsBuffer') || '[]';
      const buffer = JSON.parse(existing);
      buffer.push(...this.eventBuffer.map(e => e.serialize()));
      this.localStorage.setItem('analyticsBuffer', JSON.stringify(buffer));
    } catch (e) {
      console.error('Failed to save analytics buffer:', e);
    }
  }

  getSessionSummary() {
    if (!this.currentSession) return null;
    return this.currentSession.getSummary();
  }

  getAllSessionStats() {
    const stats = {
      totalSessions: this.sessionHistory.length,
      totalEvents: this.sessionHistory.reduce((sum, s) => sum + s.events.length, 0),
      totalErrors: this.sessionHistory.reduce((sum, s) => sum + s.errors.length, 0),
      totalAchievements: this.sessionHistory.reduce((sum, s) => sum + s.achievements.length, 0),
      averageSessionDuration: this.sessionHistory.length > 0
        ? this.sessionHistory.reduce((sum, s) => sum + s.getDuration(), 0) / this.sessionHistory.length
        : 0,
      uniqueEventTypes: new Set(this.sessionHistory.flatMap(s => s.events.map(e => e.eventName))).size
    };
    return stats;
  }

  getTopEvents(limit = 10) {
    const eventCounts = {};
    for (let session of this.sessionHistory) {
      for (let event of session.events) {
        eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
      }
    }

    return Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  getErrorReport() {
    const errors = [];
    for (let session of this.sessionHistory) {
      errors.push(...session.errors);
    }

    return {
      totalErrors: errors.length,
      errorsByType: this.groupBy(errors, 'type'),
      errorsBySession: this.sessionHistory.map(s => ({
        sessionId: s.sessionId,
        errorCount: s.errors.length
      })),
      recentErrors: errors.slice(-20)
    };
  }

  exportData(format = 'json') {
    const data = {
      userId: this.userId,
      sessionCount: this.sessionHistory.length,
      totalEvents: this.sessionHistory.reduce((sum, s) => sum + s.events.length, 0),
      sessions: this.sessionHistory.map(s => s.serialize()),
      stats: this.getAllSessionStats(),
      topEvents: this.getTopEvents(),
      errorReport: this.getErrorReport()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    return null;
  }

  groupBy(arr, key) {
    return arr.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  }

  getStats() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      sessionHistory: this.sessionHistory.length,
      eventBufferSize: this.eventBuffer.length,
      isOnline: this.isOnline,
      sessionStats: this.getAllSessionStats(),
      currentSessionSummary: this.getSessionSummary()
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnalyticsEvent, PerformanceMetric, SessionAnalytics, AnalyticsManager };
}
