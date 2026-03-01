/**
 * Dialogue & Story System for Dragon Studio
 * Branching dialogue trees, story branches, and narrative management
 */

class DialogueNode {
  constructor(id, text, type = 'dialogue') {
    this.id = id;
    this.text = text;
    this.type = type; // 'dialogue', 'choice', 'condition', 'action', 'end'
    this.speaker = '';
    this.choices = [];
    this.nextNodeId = null;
    this.condition = null;
    this.action = null;
    this.emotion = 'neutral'; // 'neutral', 'happy', 'sad', 'angry', 'surprised'
  }

  addChoice(text, nextNodeId, condition = null) {
    this.choices.push({
      id: this.choices.length,
      text: text,
      nextNodeId: nextNodeId,
      condition: condition
    });
  }

  getAvailableChoices(context = {}) {
    return this.choices.filter(choice => {
      if (!choice.condition) return true;
      return choice.condition(context);
    });
  }
}

class DialogueTree {
  constructor(name, treeId = null) {
    this.name = name;
    this.treeId = treeId || this.generateId();
    this.nodes = new Map();
    this.nodeCounter = 0;
    this.startNodeId = null;
    this.variables = {}; // Story variables
    this.flags = new Set(); // Boolean flags for conditions
  }

  createNode(text, type = 'dialogue', speaker = '') {
    const node = new DialogueNode(this.nodeCounter++, text, type);
    node.speaker = speaker;
    this.nodes.set(node.id, node);

    if (!this.startNodeId) {
      this.startNodeId = node.id;
    }

    return node;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  setVariable(key, value) {
    this.variables[key] = value;
  }

  getVariable(key) {
    return this.variables[key];
  }

  setFlag(flagName) {
    this.flags.add(flagName);
  }

  isFlagSet(flagName) {
    return this.flags.has(flagName);
  }

  clearFlag(flagName) {
    this.flags.delete(flagName);
  }

  serialize() {
    const nodeData = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      text: node.text,
      type: node.type,
      speaker: node.speaker,
      emotion: node.emotion,
      choices: node.choices,
      nextNodeId: node.nextNodeId,
      action: node.action ? node.action.toString() : null
    }));

    return {
      name: this.name,
      treeId: this.treeId,
      startNodeId: this.startNodeId,
      nodes: nodeData,
      variables: this.variables,
      flags: Array.from(this.flags)
    };
  }

  deserialize(data) {
    this.name = data.name;
    this.treeId = data.treeId;
    this.startNodeId = data.startNodeId;
    this.variables = { ...data.variables };
    this.flags = new Set(data.flags);

    for (const nodeData of data.nodes) {
      const node = new DialogueNode(nodeData.id, nodeData.text, nodeData.type);
      node.speaker = nodeData.speaker;
      node.emotion = nodeData.emotion;
      node.choices = nodeData.choices;
      node.nextNodeId = nodeData.nextNodeId;
      this.nodes.set(node.id, node);
    }
  }

  generateId() {
    return 'tree_' + Math.random().toString(36).substr(2, 9);
  }
}

class DialogueManager {
  constructor() {
    this.trees = new Map();
    this.currentTree = null;
    this.currentNodeId = null;
    this.history = [];
    this.context = {}; // Runtime context for conditions
  }

  createDialogueTree(name) {
    const tree = new DialogueTree(name);
    this.trees.set(tree.treeId, tree);
    return tree;
  }

  startConversation(treeId, context = {}) {
    const tree = this.trees.get(treeId);
    if (!tree) return null;

    this.currentTree = tree;
    this.currentNodeId = tree.startNodeId;
    this.context = context;
    this.history = [];

    return this.getCurrentNode();
  }

  getCurrentNode() {
    if (!this.currentTree) return null;
    return this.currentTree.getNode(this.currentNodeId);
  }

  chooseOption(choiceId) {
    const currentNode = this.getCurrentNode();
    if (!currentNode || choiceId >= currentNode.choices.length) {
      return null;
    }

    const choice = currentNode.choices[choiceId];
    this.history.push({
      nodeId: this.currentNodeId,
      nodeText: currentNode.text,
      choiceId: choiceId,
      choiceText: choice.text,
      timestamp: Date.now()
    });

    // Execute action if any
    if (choice.action) {
      choice.action(this.currentTree, this.context);
    }

    this.currentNodeId = choice.nextNodeId;
    return this.getCurrentNode();
  }

  goToNode(nodeId) {
    this.currentNodeId = nodeId;
    return this.getCurrentNode();
  }

  endConversation() {
    const finalNode = this.getCurrentNode();
    this.currentTree = null;
    this.currentNodeId = null;
    return this.history;
  }

  getHistory() {
    return [...this.history];
  }

  exportTree(treeId) {
    const tree = this.trees.get(treeId);
    return tree ? tree.serialize() : null;
  }

  importTree(data) {
    const tree = new DialogueTree(data.name, data.treeId);
    tree.deserialize(data);
    this.trees.set(tree.treeId, tree);
    return tree;
  }
}

// Story Scene - container for dialogue trees and game state
class StoryScene {
  constructor(name, sceneId = null) {
    this.name = name;
    this.sceneId = sceneId || this.generateId();
    this.dialogueTrees = new Map();
    this.variables = {};
    this.triggers = [];
    this.transitions = [];
  }

  addDialogueTree(tree) {
    this.dialogueTrees.set(tree.treeId, tree);
  }

  getDialogueTree(treeId) {
    return this.dialogueTrees.get(treeId);
  }

  addTrigger(condition, action) {
    this.triggers.push({ condition, action });
  }

  checkTriggers(context) {
    for (const trigger of this.triggers) {
      if (trigger.condition(context)) {
        trigger.action(context);
      }
    }
  }

  addTransition(targetSceneId, condition) {
    this.transitions.push({ targetSceneId, condition });
  }

  checkTransitions(context) {
    for (const transition of this.transitions) {
      if (transition.condition(context)) {
        return transition.targetSceneId;
      }
    }
    return null;
  }

  serialize() {
    return {
      name: this.name,
      sceneId: this.sceneId,
      dialogueTrees: Array.from(this.dialogueTrees.values()).map(tree => tree.serialize()),
      variables: this.variables,
      transitions: this.transitions.map(t => ({
        targetSceneId: t.targetSceneId
      }))
    };
  }

  generateId() {
    return 'scene_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DialogueNode, DialogueTree, DialogueManager, StoryScene };
}
