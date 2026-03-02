/**
 * Networking & Multiplayer System
 * Handles real-time multiplayer, WebSocket connections, and synchronization
 */

class NetworkPlayer {
  constructor(id, name, color = '#FF0000') {
    this.id = id;
    this.name = name;
    this.color = color;
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.animation = 'idle';
    this.health = 100;
    this.isLocalPlayer = false;
    this.lastUpdate = Date.now();
    this.inputBuffer = [];
  }

  update(deltaTime = 0.016) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      position: this.position,
      velocity: this.velocity,
      animation: this.animation,
      health: this.health,
      timestamp: Date.now()
    };
  }
}

class GameMessage {
  constructor(type, data, sender = null) {
    this.type = type; // 'player-move', 'player-action', 'chat', 'sync', 'game-state'
    this.data = data;
    this.sender = sender;
    this.timestamp = Date.now();
    this.id = Math.random().toString(36).substr(2, 9);
  }

  serialize() {
    return {
      type: this.type,
      data: this.data,
      sender: this.sender,
      timestamp: this.timestamp,
      id: this.id
    };
  }
}

class NetworkSession {
  constructor(sessionId, maxPlayers = 4) {
    this.sessionId = sessionId;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.owner = null;
    this.state = 'waiting'; // waiting, active, paused, ended
    this.createdAt = Date.now();
    this.metadata = {
      gameName: '',
      difficulty: 'normal',
      map: '',
      rules: {}
    };
    this.messageHistory = [];
    this.maxMessageHistory = 100;
  }

  addPlayer(player) {
    if (this.players.size >= this.maxPlayers) return false;
    this.players.set(player.id, player);
    return true;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  addMessage(message) {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxMessageHistory) {
      this.messageHistory.shift();
    }
  }

  getPlayerCount() {
    return this.players.size;
  }

  isFull() {
    return this.players.size >= this.maxPlayers;
  }

  serialize() {
    return {
      sessionId: this.sessionId,
      maxPlayers: this.maxPlayers,
      players: this.getAllPlayers().map(p => p.serialize()),
      state: this.state,
      metadata: this.metadata,
      messageCount: this.messageHistory.length,
      createdAt: this.createdAt
    };
  }
}

class NetworkManager {
  constructor(url = 'ws://localhost:8000') {
    this.url = url;
    this.socket = null;
    this.connected = false;
    this.localPlayer = null;
    this.remotePlayers = new Map();
    this.currentSession = null;
    this.messageQueue = [];
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // eslint-disable-next-line no-undef
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('Connected to network server');
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('Disconnected from network server');
          this.connected = false;
          this.attemptReconnect();
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.connected = false;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnect attempt ${this.reconnectAttempts}...`);
        this.connect().catch(e => console.error('Reconnect failed:', e));
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  registerMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  handleMessage(message) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    if (message.type === 'player-move') {
      this.onPlayerMove(message);
    } else if (message.type === 'sync-players') {
      this.onSyncPlayers(message);
    } else if (message.type === 'game-state') {
      this.onGameState(message);
    }
  }

  sendMessage(message) {
    if (!this.connected) {
      this.messageQueue.push(message);
      return;
    }

    try {
      this.socket.send(JSON.stringify(message.serialize()));
    } catch (e) {
      console.error('Failed to send message:', e);
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  movePlayer(x, y, vx = 0, vy = 0) {
    if (this.localPlayer) {
      const message = new GameMessage('player-move', {
        playerId: this.localPlayer.id,
        position: { x, y },
        velocity: { vx, vy }
      });
      this.sendMessage(message);
    }
  }

  performAction(action, data) {
    if (this.localPlayer) {
      const message = new GameMessage('player-action', {
        playerId: this.localPlayer.id,
        action: action,
        data: data
      });
      this.sendMessage(message);
    }
  }

  sendChat(text) {
    if (this.localPlayer) {
      const message = new GameMessage('chat', {
        playerId: this.localPlayer.id,
        playerName: this.localPlayer.name,
        text: text
      });
      this.sendMessage(message);
    }
  }

  createSession(gameName, maxPlayers = 4, difficulty = 'normal') {
    const sessionId = Math.random().toString(36).substr(2, 9);
    this.currentSession = new NetworkSession(sessionId, maxPlayers);
    this.currentSession.metadata.gameName = gameName;
    this.currentSession.metadata.difficulty = difficulty;
    this.currentSession.owner = this.localPlayer;
    return this.currentSession;
  }

  joinSession(sessionId) {
    const message = new GameMessage('join-session', {
      sessionId: sessionId,
      player: this.localPlayer.serialize()
    });
    this.sendMessage(message);
  }

  leaveSession() {
    if (this.currentSession) {
      const message = new GameMessage('leave-session', {
        sessionId: this.currentSession.sessionId,
        playerId: this.localPlayer.id
      });
      this.sendMessage(message);
      this.currentSession = null;
    }
  }

  onPlayerMove(message) {
    const player = this.remotePlayers.get(message.data.playerId);
    if (player) {
      player.position = message.data.position;
      player.velocity = message.data.velocity;
      player.lastUpdate = message.timestamp;
    }
  }

  onSyncPlayers(message) {
    for (let playerData of message.data.players) {
      const player = this.remotePlayers.get(playerData.id);
      if (player) {
        player.position = playerData.position;
        player.velocity = playerData.velocity;
        player.animation = playerData.animation;
        player.health = playerData.health;
      }
    }
  }

  onGameState(message) {
    console.log('Game state received:', message.data);
  }

  getRemotePlayer(playerId) {
    return this.remotePlayers.get(playerId);
  }

  getAllRemotePlayers() {
    return Array.from(this.remotePlayers.values());
  }

  isConnected() {
    return this.connected;
  }

  ping() {
    const message = new GameMessage('ping', { timestamp: Date.now() });
    this.sendMessage(message);
  }

  serialize() {
    return {
      connected: this.connected,
      localPlayer: this.localPlayer ? this.localPlayer.serialize() : null,
      remotePlayers: this.getAllRemotePlayers().map(p => p.serialize()),
      currentSession: this.currentSession ? this.currentSession.serialize() : null,
      messageQueueLength: this.messageQueue.length
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NetworkPlayer, GameMessage, NetworkSession, NetworkManager };
}
