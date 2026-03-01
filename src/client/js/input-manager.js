/**
 * Input System & Controls Mapping for Dragon Studio
 * Keyboard, mouse, gamepad support with customizable controls
 */

class InputManager {
  constructor() {
    this.keys = new Set();
    this.mousePos = { x: 0, y: 0 };
    this.mouseButtons = new Map();
    this.gamepadStates = [];
    this.bindings = new Map();
    this.actions = new Map();
    
    this.setupEventListeners();
    this.setupDefaultBindings();
    this.pollGamepads();
  }

  setupEventListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  setupDefaultBindings() {
    // WASD + Arrow keys for movement
    this.addBinding('moveLeft', ['a', 'arrowleft']);
    this.addBinding('moveRight', ['d', 'arrowright']);
    this.addBinding('moveUp', ['w', 'arrowup']);
    this.addBinding('moveDown', ['s', 'arrowdown']);

    // Action keys
    this.addBinding('jump', ['space']);
    this.addBinding('interact', ['e']);
    this.addBinding('attack', ['mouse0']);
    this.addBinding('defend', ['shift']);
    this.addBinding('pause', ['escape']);

    // UI keys
    this.addBinding('menu', ['escape']);
    this.addBinding('inventory', ['i']);
    this.addBinding('stats', ['c']);
  }

  addBinding(action, keys) {
    this.bindings.set(action, keys.map(k => k.toLowerCase()));
  }

  registerAction(action, callback) {
    this.actions.set(action, callback);
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    this.keys.add(key);
    this.checkBindings();
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys.delete(key);
  }

  onMouseMove(event) {
    this.mousePos = { x: event.clientX, y: event.clientY };
  }

  onMouseDown(event) {
    this.mouseButtons.set(`mouse${event.button}`, true);
    this.checkBindings();
  }

  onMouseUp(event) {
    this.mouseButtons.set(`mouse${event.button}`, false);
  }

  checkBindings() {
    for (const [action, keys] of this.bindings) {
      const isActive = keys.some(key => {
        if (key.startsWith('mouse')) {
          return this.mouseButtons.get(key) || false;
        }
        return this.keys.has(key);
      });

      if (isActive && this.actions.has(action)) {
        this.actions.get(action)();
      }
    }
  }

  pollGamepads() {
    if (typeof navigator === 'undefined') return;

    const gamepads = navigator.getGamepads?.() || [];
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadStates[i] = {
          axes: gamepads[i].axes,
          buttons: gamepads[i].buttons.map(b => b.pressed)
        };
      }
    }

    setInterval(() => this.pollGamepads(), 50);
  }

  isKeyPressed(key) {
    return this.keys.has(key.toLowerCase());
  }

  isActionActive(action) {
    const keys = this.bindings.get(action) || [];
    return keys.some(key => {
      if (key.startsWith('mouse')) {
        return this.mouseButtons.get(key) || false;
      }
      return this.keys.has(key);
    });
  }

  getMousePosition() {
    return { ...this.mousePos };
  }

  getGamepadAxis(padIndex, axis) {
    const gamepad = this.gamepadStates[padIndex];
    return gamepad ? gamepad.axes[axis] || 0 : 0;
  }

  isGamepadButtonPressed(padIndex, buttonIndex) {
    const gamepad = this.gamepadStates[padIndex];
    return gamepad ? gamepad.buttons[buttonIndex] || false : false;
  }
}

// Debug Console
class DebugConsole {
  constructor(containerId = 'debugConsole') {
    this.containerId = containerId;
    this.logs = [];
    this.maxLogs = 500;
    this.isVisible = false;
    this.isOpen = false;
    this.commands = new Map();
    this.history = [];
    this.historyIndex = 0;

    this.setupConsole();
    this.setupDefaultCommands();
    this.interceptConsoleLogs();
  }

  setupConsole() {
    if (typeof document === 'undefined') return;

    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
      <style>
        #debugConsole {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: rgba(0,0,0,0.9);
          color: #0ff;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          z-index: 9999;
          display: none;
          flex-direction: column;
          border-top: 1px solid #0ff;
        }
        .debug-header {
          padding: 5px;
          background: #001a00;
          border-bottom: 1px solid #0ff;
          display: flex;
          justify-content: space-between;
        }
        .debug-title { flex: 1; }
        .debug-close { cursor: pointer; color: #f00; }
        .debug-output {
          flex: 1;
          overflow-y: auto;
          padding: 5px;
        }
        .debug-input {
          display: flex;
          border-top: 1px solid #0ff;
        }
        .debug-prompt {
          padding: 5px;
          background: #001a00;
        }
        .debug-input input {
          flex: 1;
          background: #001a00;
          color: #0ff;
          border: none;
          padding: 5px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          outline: none;
        }
        .log-line {
          padding: 2px 0;
        }
        .log-info { color: #0ff; }
        .log-warn { color: #ff0; }
        .log-error { color: #f00; }
      </style>
      <div class="debug-header">
        <span class="debug-title">🐛 Dragon Studio Debug Console (Press ~ to toggle)</span>
        <span class="debug-close" onclick="document.getElementById('debugConsole').style.display='none'">✕</span>
      </div>
      <div class="debug-output" id="debugOutput"></div>
      <div class="debug-input">
        <span class="debug-prompt">&gt;</span>
        <input type="text" id="debugInput" placeholder="Enter command...">
      </div>
    `;

    const input = document.getElementById('debugInput');
    if (input) {
      input.addEventListener('keydown', (e) => this.handleInput(e));
    }

    // Toggle console with ~ key
    document.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~') {
        this.toggle();
      }
    });
  }

  setupDefaultCommands() {
    this.addCommand('help', () => {
      this.log('Available commands:', 'info');
      for (const cmd of this.commands.keys()) {
        this.log(`  ${cmd}`, 'info');
      }
    });

    this.addCommand('clear', () => {
      this.logs = [];
      this.updateOutput();
    });

    this.addCommand('time', () => {
      const time = new Date().toLocaleTimeString();
      this.log(`Current time: ${time}`, 'info');
    });

    this.addCommand('memory', () => {
      if (performance.memory) {
        const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
        const limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
        this.log(`Memory: ${used}MB / ${limit}MB`, 'info');
      }
    });

    this.addCommand('fps', () => {
      this.log('FPS counter started (check Game Engine for updates)', 'info');
    });
  }

  addCommand(name, callback) {
    this.commands.set(name, callback);
  }

  handleInput(event) {
    if (event.key === 'Enter') {
      const input = event.target;
      const command = input.value.trim();
      
      if (command) {
        this.log(`> ${command}`, 'info');
        this.history.push(command);
        this.historyIndex = this.history.length;
        
        if (this.commands.has(command)) {
          this.commands.get(command)();
        } else {
          this.log(`Unknown command: ${command}`, 'error');
        }
      }
      
      input.value = '';
    } else if (event.key === 'ArrowUp') {
      this.historyIndex = Math.max(0, this.historyIndex - 1);
      event.target.value = this.history[this.historyIndex] || '';
    } else if (event.key === 'ArrowDown') {
      this.historyIndex = Math.min(this.history.length, this.historyIndex + 1);
      event.target.value = this.history[this.historyIndex] || '';
    }
  }

  log(message, type = 'info') {
    this.logs.push({ message, type, timestamp: Date.now() });
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.isOpen) {
      this.updateOutput();
    }
  }

  updateOutput() {
    if (typeof document === 'undefined') return;
    const output = document.getElementById('debugOutput');
    if (!output) return;

    output.innerHTML = this.logs.map(log =>
      `<div class="log-line log-${log.type}">${log.message}</div>`
    ).join('');

    output.scrollTop = output.scrollHeight;
  }

  interceptConsoleLogs() {
    if (typeof console === 'undefined') return;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      this.log(args.map(a => String(a)).join(' '), 'info');
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      this.log(args.map(a => String(a)).join(' '), 'warn');
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      this.log(args.map(a => String(a)).join(' '), 'error');
      originalError.apply(console, args);
    };
  }

  toggle() {
    if (typeof document === 'undefined') return;
    const console = document.getElementById(this.containerId);
    if (console) {
      this.isOpen = !this.isOpen;
      console.style.display = this.isOpen ? 'flex' : 'none';
    }
  }

  clear() {
    this.logs = [];
    this.updateOutput();
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InputManager, DebugConsole };
}
