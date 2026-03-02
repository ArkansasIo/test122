/**
 * AI Behavior Tree System
 * Hierarchical node-based AI decision making for NPCs and enemies
 */

class AINode {
  constructor(type, name, data = {}) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.type = type; // 'sequence', 'selector', 'parallel', 'action', 'condition'
    this.name = name;
    this.children = [];
    this.data = data;
    this.status = 'idle'; // idle, running, success, failure
    this.index = 0;
  }

  addChild(node) {
    this.children.push(node);
    return this;
  }

  removeChild(id) {
    this.children = this.children.filter(child => child.id !== id);
  }

  execute(_context) {
    throw new Error('execute() must be overridden');
  }

  reset() {
    this.status = 'idle';
    this.index = 0;
    for (let child of this.children) {
      child.reset();
    }
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      data: this.data,
      children: this.children.map(c => c.serialize())
    };
  }
}

class SequenceNode extends AINode {
  constructor(name = 'Sequence') {
    super('sequence', name);
  }

  execute(context) {
    for (let i = this.index; i < this.children.length; i++) {
      const child = this.children[i];
      child.execute(context);
      if (child.status !== 'success') {
        this.status = child.status;
        this.index = i;
        return;
      }
    }
    this.index = 0;
    this.status = 'success';
  }
}

class SelectorNode extends AINode {
  constructor(name = 'Selector') {
    super('selector', name);
  }

  execute(context) {
    for (let i = this.index; i < this.children.length; i++) {
      const child = this.children[i];
      child.execute(context);
      if (child.status !== 'failure') {
        this.status = child.status;
        this.index = i;
        return;
      }
    }
    this.index = 0;
    this.status = 'failure';
  }
}

class ActionNode extends AINode {
  constructor(name = 'Action', actionFn) {
    super('action', name);
    this.actionFn = actionFn;
  }

  execute(context) {
    try {
      const result = this.actionFn(context);
      this.status = result ? 'success' : 'failure';
    } catch (e) {
      console.error(`Action failed: ${e}`);
      this.status = 'failure';
    }
  }
}

class ConditionNode extends AINode {
  constructor(name = 'Condition', conditionFn) {
    super('condition', name);
    this.conditionFn = conditionFn;
  }

  execute(context) {
    try {
      const result = this.conditionFn(context);
      this.status = result ? 'success' : 'failure';
    } catch (e) {
      console.error(`Condition failed: ${e}`);
      this.status = 'failure';
    }
  }
}

class WaitNode extends AINode {
  constructor(name = 'Wait', duration = 1.0) {
    super('wait', name, { duration });
    this.elapsed = 0;
  }

  execute(context) {
    this.elapsed += context.deltaTime || 0.016;
    if (this.elapsed >= this.data.duration) {
      this.elapsed = 0;
      this.status = 'success';
    } else {
      this.status = 'running';
    }
  }
}

class RandomNode extends AINode {
  constructor(name = 'Random', probability = 0.5) {
    super('random', name, { probability });
  }

  execute(_context) {
    const rand = Math.random();
    this.status = rand < this.data.probability ? 'success' : 'failure';
  }
}

class BehaviorTree {
  constructor(name = 'Tree', root = null) {
    this.name = name;
    this.root = root || new SelectorNode('Root');
    this.context = {};
    this.isRunning = false;
    this.tickCount = 0;
  }

  tick(deltaTime = 0.016) {
    if (!this.root) return;
    
    this.context.deltaTime = deltaTime;
    this.context.tickCount = this.tickCount++;
    
    this.root.execute(this.context);
    this.isRunning = this.root.status === 'running';
  }

  reset() {
    this.root.reset();
    this.isRunning = false;
    this.tickCount = 0;
  }

  setContext(key, value) {
    this.context[key] = value;
  }

  getContext(key) {
    return this.context[key];
  }

  serialize() {
    return {
      name: this.name,
      root: this.root.serialize(),
      context: this.context,
      version: '1.0'
    };
  }
}

class AIAgent {
  constructor(name = 'Agent') {
    this.name = name;
    this.behaviortree = null;
    this.state = 'idle'; // idle, active, paused
    this.stats = {
      health: 100,
      maxHealth: 100,
      speed: 50,
      position: { x: 0, y: 0 }
    };
    this.memory = new Map();
    this.blackboard = {};
  }

  attachBehaviorTree(tree) {
    this.behaviortree = tree;
  }

  tick(deltaTime = 0.016) {
    if (!this.behaviortree || this.state === 'paused') return;
    
    this.behaviortree.setContext('agent', this);
    this.behaviortree.tick(deltaTime);
    this.state = this.behaviortree.isRunning ? 'active' : 'idle';
  }

  moveTowards(targetX, targetY, deltaTime = 0.016) {
    const dx = targetX - this.stats.position.x;
    const dy = targetY - this.stats.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const movement = this.stats.speed * deltaTime;
      const ratio = Math.min(1, movement / distance);
      this.stats.position.x += dx * ratio;
      this.stats.position.y += dy * ratio;
    }
  }

  takeDamage(amount) {
    this.stats.health = Math.max(0, this.stats.health - amount);
    return this.stats.health > 0;
  }

  heal(amount) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  remember(key, value) {
    this.memory.set(key, value);
  }

  recall(key) {
    return this.memory.get(key);
  }

  forget(key) {
    this.memory.delete(key);
  }

  isAlive() {
    return this.stats.health > 0;
  }

  serialize() {
    return {
      name: this.name,
      state: this.state,
      stats: this.stats,
      memory: Object.fromEntries(this.memory),
      blackboard: this.blackboard,
      treeState: this.behaviortree ? this.behaviortree.serialize() : null
    };
  }
}

class AIManager {
  constructor() {
    this.agents = [];
    this.trees = new Map();
    this.globalContext = {};
  }

  createAgent(name = 'Agent') {
    const agent = new AIAgent(name);
    this.agents.push(agent);
    return agent;
  }

  registerTreeTemplate(name, root) {
    this.trees.set(name, root);
  }

  attachTreeToAgent(agent, treeName) {
    if (this.trees.has(treeName)) {
      const tree = new BehaviorTree(treeName, this.trees.get(treeName));
      agent.attachBehaviorTree(tree);
    }
  }

  tick(deltaTime = 0.016) {
    for (let agent of this.agents) {
      agent.tick(deltaTime);
    }
  }

  getAliveAgents() {
    return this.agents.filter(a => a.isAlive());
  }

  getDeadAgents() {
    return this.agents.filter(a => !a.isAlive());
  }

  removeAgent(agent) {
    this.agents = this.agents.filter(a => a !== agent);
  }

  getAgentCount() {
    return this.agents.length;
  }

  serialize() {
    return {
      agents: this.agents.map(a => a.serialize()),
      globalContext: this.globalContext,
      version: '1.0'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AINode, SequenceNode, SelectorNode, ActionNode, ConditionNode, WaitNode, RandomNode,
    BehaviorTree, AIAgent, AIManager
  };
}
