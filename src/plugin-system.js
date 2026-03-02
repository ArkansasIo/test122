/**
 * Plugin/Mod System
 * Extensible plugin architecture for mods, custom content, and user extensions
 */
/* global window */

class PluginAPI {
  constructor() {
    this.gameEngine = null;
    this.events = new Map();
    this.hooks = new Map();
    this.commands = new Map();
  }

  registerEvent(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(handler);
  }

  unregisterEvent(eventName, handler) {
    if (this.events.has(eventName)) {
      const handlers = this.events.get(eventName);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emitEvent(eventName, data = {}) {
    if (this.events.has(eventName)) {
      for (let handler of this.events.get(eventName)) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      }
    }
  }

  registerHook(hookName, callback, priority = 10) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push({ callback, priority });
    this.hooks.get(hookName).sort((a, b) => b.priority - a.priority);
  }

  applyHooks(hookName, value, ...args) {
    let result = value;
    if (this.hooks.has(hookName)) {
      for (let { callback } of this.hooks.get(hookName)) {
        try {
          result = callback(result, ...args);
        } catch (error) {
          console.error(`Error in hook ${hookName}:`, error);
        }
      }
    }
    return result;
  }

  registerCommand(commandName, handler, description = '') {
    this.commands.set(commandName, { handler, description });
  }

  executeCommand(commandName, args = []) {
    if (this.commands.has(commandName)) {
      try {
        return this.commands.get(commandName).handler(...args);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        return null;
      }
    }
    return null;
  }

  getCommandList() {
    const list = [];
    for (let [name, { description }] of this.commands) {
      list.push({ name, description });
    }
    return list;
  }
}

class Plugin {
  constructor(manifest) {
    this.id = manifest.id || Math.random().toString(36).substr(2, 9);
    this.name = manifest.name || 'Unknown Plugin';
    this.version = manifest.version || '1.0.0';
    this.author = manifest.author || 'Unknown';
    this.description = manifest.description || '';
    this.entryPoint = manifest.entryPoint || null;
    this.dependencies = manifest.dependencies || [];
    this.permissions = manifest.permissions || [];
    this.settings = manifest.settings || {};
    this.enabled = false;
    this.loaded = false;
    this.error = null;
    this.instance = null;
    this.createdAt = Date.now();
  }

  validate() {
    if (!this.id || !this.name || !this.entryPoint) {
      return { valid: false, errors: ['Missing required manifest fields'] };
    }

    if (!this.validateVersion(this.version)) {
      return { valid: false, errors: ['Invalid version format'] };
    }

    return { valid: true, errors: [] };
  }

  validateVersion(version) {
    return /^\d+\.\d+\.\d+(-.*)?$/.test(version);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      author: this.author,
      description: this.description,
      enabled: this.enabled,
      loaded: this.loaded,
      error: this.error,
      createdAt: this.createdAt
    };
  }
}

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.loadedPlugins = new Map();
    this.pluginAPI = new PluginAPI();
    this.pluginDirectory = '';
    this.sandboxMode = true;
    this.localStorage = typeof window !== 'undefined' ? window.localStorage : null;
  }

  createPlugin(manifest) {
    const plugin = new Plugin(manifest);
    const validation = plugin.validate();

    if (!validation.valid) {
      console.error(`Plugin validation failed: ${validation.errors.join(', ')}`);
      plugin.error = validation.errors[0];
      return null;
    }

    this.plugins.set(plugin.id, plugin);
    return plugin;
  }

  registerPlugin(pluginManager, manifest, code = null) {
    const plugin = this.createPlugin(manifest);
    if (!plugin) return false;

    if (code) {
      plugin.code = code;
    }

    return true;
  }

  async loadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    if (plugin.loaded) {
      return true;
    }

    try {
      // Check dependencies
      for (let depId of plugin.dependencies) {
        const dep = this.plugins.get(depId);
        if (!dep || !dep.loaded) {
          throw new Error(`Dependency ${depId} not loaded`);
        }
      }

      // Create plugin instance
      if (plugin.code) {
        const sandbox = this.createSandbox(plugin);
        plugin.instance = this.executePluginCode(plugin.code, sandbox);
      } else if (plugin.entryPoint) {
        // Load from entry point (would be dynamic import in real scenario)
        console.log(`Loading plugin from ${plugin.entryPoint}`);
      }

      plugin.loaded = true;
      plugin.enabled = true;
      this.loadedPlugins.set(pluginId, plugin);

      // Call onLoad hook if exists
      if (plugin.instance && typeof plugin.instance.onLoad === 'function') {
        plugin.instance.onLoad(this.pluginAPI);
      }

      console.log(`Plugin ${plugin.name} (${plugin.version}) loaded successfully`);
      return true;
    } catch (error) {
      plugin.error = error.message;
      console.error(`Failed to load plugin ${pluginId}:`, error);
      return false;
    }
  }

  unloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    if (plugin.instance && typeof plugin.instance.onUnload === 'function') {
      try {
        plugin.instance.onUnload(this.pluginAPI);
      } catch (error) {
        console.error(`Error unloading plugin ${pluginId}:`, error);
      }
    }

    plugin.loaded = false;
    plugin.enabled = false;
    this.loadedPlugins.delete(pluginId);
    return true;
  }

  enablePlugin(pluginId) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;
      this.pluginAPI.emitEvent('plugin_enabled', { pluginId });
      return true;
    }
    return false;
  }

  disablePlugin(pluginId) {
    const plugin = this.loadedPlugins.get(pluginId);
    if (plugin) {
      plugin.enabled = false;
      this.pluginAPI.emitEvent('plugin_disabled', { pluginId });
      return true;
    }
    return false;
  }

  createSandbox(plugin) {
    // Create isolated scope for plugin execution
    const sandbox = {
      console: {
        log: (...args) => console.log(`[${plugin.name}]`, ...args),
        warn: (...args) => console.warn(`[${plugin.name}]`, ...args),
        error: (...args) => console.error(`[${plugin.name}]`, ...args)
      },
      Math: Math,
      JSON: JSON,
      Object: Object,
      Array: Array,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Date: Date,
      // Grant limited access to API
      API: this.pluginAPI,
      // Plugin metadata
      PLUGIN_ID: plugin.id,
      PLUGIN_NAME: plugin.name,
      PLUGIN_VERSION: plugin.version
    };

    return sandbox;
  }

  executePluginCode(code, sandbox) {
    try {
      // Create function with sandbox as context
      const func = new Function(...Object.keys(sandbox), code);
      const result = func(...Object.values(sandbox));
      return result || {};
    } catch (error) {
      throw new Error(`Plugin code execution failed: ${error.message}`);
    }
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  getLoadedPlugin(pluginId) {
    return this.loadedPlugins.get(pluginId);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  getLoadedPlugins() {
    return Array.from(this.loadedPlugins.values());
  }

  getEnabledPlugins() {
    return Array.from(this.loadedPlugins.values()).filter(p => p.enabled);
  }

  deletePlugin(pluginId) {
    this.unloadPlugin(pluginId);
    return this.plugins.delete(pluginId);
  }

  loadPluginManifest(jsonFile) {
    try {
      const manifest = typeof jsonFile === 'string' ? JSON.parse(jsonFile) : jsonFile;
      return this.createPlugin(manifest);
    } catch (error) {
      console.error('Failed to load plugin manifest:', error);
      return null;
    }
  }

  async loadPluginPackage(packageData) {
    // Load plugin from package format
    const { manifest, code } = packageData;
    const plugin = this.createPlugin(manifest);
    
    if (plugin) {
      plugin.code = code;
      await this.loadPlugin(plugin.id);
      return plugin;
    }

    return null;
  }

  exportPluginPackage(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return null;

    return {
      manifest: {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        author: plugin.author,
        description: plugin.description,
        dependencies: plugin.dependencies,
        permissions: plugin.permissions,
        settings: plugin.settings
      },
      code: plugin.code || '',
      packaged: new Date().toISOString()
    };
  }

  savePluginState() {
    if (!this.localStorage) return false;

    try {
      const pluginsData = this.getAllPlugins().map(p => ({
        id: p.id,
        enabled: p.enabled,
        settings: p.settings
      }));
      this.localStorage.setItem('plugins_state', JSON.stringify(pluginsData));
      return true;
    } catch (e) {
      console.error('Failed to save plugin state:', e);
      return false;
    }
  }

  loadPluginState() {
    if (!this.localStorage) return false;

    try {
      const data = this.localStorage.getItem('plugins_state');
      if (data) {
        const pluginsData = JSON.parse(data);
        for (let pluginData of pluginsData) {
          const plugin = this.plugins.get(pluginData.id);
          if (plugin) {
            plugin.settings = pluginData.settings;
            if (pluginData.enabled) {
              this.loadPlugin(pluginData.id);
            }
          }
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to load plugin state:', e);
    }
    return false;
  }

  getStats() {
    return {
      totalPlugins: this.plugins.size,
      loadedPlugins: this.loadedPlugins.size,
      enabledPlugins: this.getEnabledPlugins().length,
      plugins: this.getAllPlugins().map(p => p.serialize())
    };
  }

  callPluginHook(hookName, ...args) {
    return this.pluginAPI.applyHooks(hookName, ...args);
  }

  emitPluginEvent(eventName, data) {
    this.pluginAPI.emitEvent(eventName, data);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PluginAPI, Plugin, PluginManager };
}
