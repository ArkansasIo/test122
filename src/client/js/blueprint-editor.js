/**
 * Blueprint Scripting System for Dragon Studio
 * Visual node-based scripting like Unreal Engine 5 Blueprints
 */

class BlueprintNode {
  constructor(id, type, title, x = 0, y = 0) {
    this.id = id;
    this.type = type; // 'function', 'variable', 'event', 'control_flow', 'math'
    this.title = title;
    this.x = x;
    this.y = y;
    this.inputs = [];
    this.outputs = [];
    this.properties = {};
    this.color = this.getNodeColor(type);
  }

  addInput(name, type = 'any', defaultValue = null) {
    this.inputs.push({ name, type, defaultValue, id: `${this.id}_in_${this.inputs.length}` });
  }

  addOutput(name, type = 'any') {
    this.outputs.push({ name, type, id: `${this.id}_out_${this.outputs.length}` });
  }

  getNodeColor(type) {
    const colors = {
      'event': '#E81E63',      // Pink
      'function': '#2196F3',   // Blue
      'variable': '#4CAF50',   // Green
      'control_flow': '#FF9800', // Orange
      'math': '#9C27B0',       // Purple
      'logic': '#00BCD4',      // Cyan
      'string': '#FFB300',     // Amber
      'cast': '#795548'        // Brown
    };
    return colors[type] || '#666666';
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      x: this.x,
      y: this.y,
      inputs: this.inputs,
      outputs: this.outputs,
      properties: this.properties,
      color: this.color
    };
  }
}

class BlueprintConnection {
  constructor(fromNodeId, fromPinId, toNodeId, toPinId) {
    this.fromNodeId = fromNodeId;
    this.fromPinId = fromPinId;
    this.toNodeId = toNodeId;
    this.toPinId = toPinId;
    this.id = `${fromNodeId}:${fromPinId}->${toNodeId}:${toPinId}`;
  }

  serialize() {
    return {
      id: this.id,
      fromNodeId: this.fromNodeId,
      fromPinId: this.fromPinId,
      toNodeId: this.toNodeId,
      toPinId: this.toPinId
    };
  }
}

class BlueprintEditor {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.nodes = new Map();
    this.connections = [];
    this.selectedNode = null;
    this.draggingNode = null;
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.nodeCounter = 0;
    this.connectionInProgress = null;
    this.grid = true;
    this.gridSize = 20;

    this.setupEventListeners();
    this.createDefaultNodes();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.onMouseWheel(e));
    this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));
  }

  createDefaultNodes() {
    // Event: Begin Play
    const beginPlay = new BlueprintNode(this.nodeCounter++, 'event', 'Event Begin Play', 50, 50);
    beginPlay.addOutput('Out', 'exec');
    this.nodes.set(beginPlay.id, beginPlay);

    // Event: Update
    const update = new BlueprintNode(this.nodeCounter++, 'event', 'Event Update', 50, 150);
    update.addOutput('Out', 'exec');
    this.nodes.set(update.id, update);
  }

  addNode(type, title, x, y) {
    const node = new BlueprintNode(this.nodeCounter++, type, title, x, y);
    
    // Add common pins based on type
    if (type === 'event') {
      node.addOutput('Out', 'exec');
    } else if (type === 'function') {
      node.addInput('Call', 'exec');
      node.addOutput('Out', 'exec');
    } else if (type === 'control_flow') {
      node.addInput('In', 'exec');
      node.addOutput('True', 'exec');
      node.addOutput('False', 'exec');
    } else if (type === 'math') {
      node.addInput('A', 'number');
      node.addInput('B', 'number');
      node.addOutput('Result', 'number');
    }

    this.nodes.set(node.id, node);
    return node;
  }

  connect(fromNodeId, fromPinId, toNodeId, toPinId) {
    // Validate connection
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);

    if (!fromNode || !toNode) return false;

    const conn = new BlueprintConnection(fromNodeId, fromPinId, toNodeId, toPinId);
    this.connections.push(conn);
    return true;
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.zoomLevel;
    const y = (e.clientY - rect.top - this.panY) / this.zoomLevel;

    if (this.draggingNode) {
      this.draggingNode.x = x;
      this.draggingNode.y = y;
    }

    this.draw();
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.zoomLevel;
    const y = (e.clientY - rect.top - this.panY) / this.zoomLevel;

    // Check if clicked on a node
    for (const node of this.nodes.values()) {
      if (this.isPointInNode(x, y, node)) {
        this.draggingNode = node;
        this.selectedNode = node;
        e.preventDefault();
        return;
      }
    }

    // Pan canvas
    this.lastPanX = e.clientX;
    this.lastPanY = e.clientY;
  }

  onMouseUp(e) {
    this.draggingNode = null;
  }

  onMouseWheel(e) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const oldZoom = this.zoomLevel;
    this.zoomLevel = Math.max(0.1, this.zoomLevel - (e.deltaY > 0 ? zoomSpeed : -zoomSpeed));
  }

  onDoubleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.zoomLevel;
    const y = (e.clientY - rect.top - this.panY) / this.zoomLevel;
    this.addNode('function', 'New Function', x, y);
  }

  isPointInNode(x, y, node) {
    const width = 150;
    const height = 80;
    return x >= node.x && x <= node.x + width && y >= node.y && y <= node.y + height;
  }

  draw() {
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    if (this.grid) {
      this.drawGrid();
    }

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoomLevel, this.zoomLevel);

    // Draw connections first (behind nodes)
    for (const conn of this.connections) {
      this.drawConnection(conn);
    }

    // Draw nodes
    for (const node of this.nodes.values()) {
      this.drawNode(node);
    }

    this.ctx.restore();
  }

  drawGrid() {
    const gridSize = this.gridSize * this.zoomLevel;
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawNode(node) {
    const width = 150;
    const height = 80;
    const pinRadius = 6;

    // Node background
    this.ctx.fillStyle = node.color;
    this.ctx.fillRect(node.x, node.y, width, height);

    // Node title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(node.title, node.x + width / 2, node.y + 15);

    // Draw input pins (left side)
    this.ctx.fillStyle = '#FFD700';
    const inputSpacing = height / (node.inputs.length + 1);
    node.inputs.forEach((pin, i) => {
      const pinY = node.y + inputSpacing * (i + 1);
      this.ctx.beginPath();
      this.ctx.arc(node.x, pinY, pinRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Pin label
      this.ctx.fillStyle = '#cccccc';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(pin.name, node.x + 12, pinY + 3);
    });

    // Draw output pins (right side)
    this.ctx.fillStyle = '#FF6B9D';
    const outputSpacing = height / (node.outputs.length + 1);
    node.outputs.forEach((pin, i) => {
      const pinY = node.y + outputSpacing * (i + 1);
      this.ctx.beginPath();
      this.ctx.arc(node.x + width, pinY, pinRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Pin label
      this.ctx.fillStyle = '#cccccc';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(pin.name, node.x + width - 12, pinY + 3);
    });
  }

  drawConnection(conn) {
    const fromNode = this.nodes.get(conn.fromNodeId);
    const toNode = this.nodes.get(conn.toNodeId);

    if (!fromNode || !toNode) return;

    const x1 = fromNode.x + 150;
    const y1 = fromNode.y + 40;
    const x2 = toNode.x;
    const y2 = toNode.y + 40;

    this.ctx.strokeStyle = '#FF6B9D';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);

    // Bezier curve
    const cp = (x2 - x1) / 2;
    this.ctx.bezierCurveTo(x1 + cp, y1, x2 - cp, y2, x2, y2);
    this.ctx.stroke();
  }

  exportToCode(language = 'cpp') {
    let code = '';

    if (language === 'cpp') {
      code = this.exportToCpp();
    } else if (language === 'javascript') {
      code = this.exportToJS();
    }

    return code;
  }

  exportToCpp() {
    let code = '#include <iostream>\nusing namespace std;\n\n';
    code += 'class BlueprintGame {\npublic:\n';
    code += '  void BeginPlay() {\n';

    for (const node of this.nodes.values()) {
      if (node.type === 'event' && node.title === 'Event Begin Play') {
        code += this.nodeToCode(node);
      }
    }

    code += '  }\n};\n';
    return code;
  }

  exportToJS() {
    let code = 'class BlueprintGame {\n';
    code += '  beginPlay() {\n';

    for (const node of this.nodes.values()) {
      if (node.type === 'event' && node.title === 'Event Begin Play') {
        code += this.nodeToJS(node);
      }
    }

    code += '  }\n}\n';
    return code;
  }

  nodeToCode(node) {
    let code = '';
    
    if (node.type === 'math') {
      code += '    // Math operation\n';
    } else if (node.type === 'logic') {
      code += '    // Logic operation\n';
    }

    return code;
  }

  nodeToJS(node) {
    let code = '';
    
    if (node.type === 'math') {
      code += '    // Math operation\n';
    }

    return code;
  }

  serialize() {
    return {
      nodes: Array.from(this.nodes.values()).map(n => n.serialize()),
      connections: this.connections.map(c => c.serialize())
    };
  }

  deserialize(data) {
    this.nodes.clear();
    this.connections = [];

    for (const nodeData of data.nodes) {
      const node = new BlueprintNode(nodeData.id, nodeData.type, nodeData.title, nodeData.x, nodeData.y);
      node.inputs = nodeData.inputs;
      node.outputs = nodeData.outputs;
      node.properties = nodeData.properties;
      this.nodes.set(node.id, node);
    }

    for (const connData of data.connections) {
      const conn = new BlueprintConnection(connData.fromNodeId, connData.fromPinId, connData.toNodeId, connData.toPinId);
      this.connections.push(conn);
    }

    this.draw();
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlueprintEditor, BlueprintNode, BlueprintConnection };
}
