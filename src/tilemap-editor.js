/**
 * Tilemap Editor
 * Edits 2D tilemaps with tile placement, brushes, and layers
 */

class Tileset {
  constructor(name, imageUrl, tileWidth, tileHeight, columns = 16) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.columns = columns;
    this.image = null;
    this.tiles = [];
    this.rows = 0;
    this.loaded = false;
  }

  async load() {
    return new Promise((resolve) => {
      this.image = new Image();
      this.image.onload = () => {
        this.rows = Math.ceil(this.image.height / this.tileHeight);
        this.generateTiles();
        this.loaded = true;
        resolve();
      };
      this.image.src = this.imageUrl;
    });
  }

  generateTiles() {
    this.tiles = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        this.tiles.push({
          id: this.tiles.length,
          sx: col * this.tileWidth,
          sy: row * this.tileHeight,
          name: `${row}_${col}`
        });
      }
    }
  }

  getTile(id) {
    return this.tiles[id];
  }

  getTileCount() {
    return this.tiles.length;
  }
}

class TilemapLayer {
  constructor(name, width, height, tileSize = 32) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = new Array(width * height).fill(-1);
    this.visible = true;
    this.opacity = 1.0;
    this.properties = {};
  }

  setTile(x, y, tileId) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y * this.width + x] = tileId;
    }
  }

  getTile(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y * this.width + x];
    }
    return -1;
  }

  fillRect(x, y, w, h, tileId) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        this.setTile(xx, yy, tileId);
      }
    }
  }

  clearLayer() {
    this.tiles.fill(-1);
  }

  render(ctx, tileset, cameraX = 0, cameraY = 0) {
    if (!this.visible) return;

    ctx.globalAlpha = this.opacity;
    const startX = Math.max(0, Math.floor(cameraX / this.tileSize));
    const startY = Math.max(0, Math.floor(cameraY / this.tileSize));
    const endX = Math.min(this.width, Math.ceil((cameraX + ctx.canvas.width) / this.tileSize));
    const endY = Math.min(this.height, Math.ceil((cameraY + ctx.canvas.height) / this.tileSize));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tileId = this.getTile(x, y);
        if (tileId >= 0 && tileset && tileset.loaded) {
          const tile = tileset.getTile(tileId);
          if (tile && tileset.image) {
            ctx.drawImage(
              tileset.image,
              tile.sx,
              tile.sy,
              tileset.tileWidth,
              tileset.tileHeight,
              x * this.tileSize - cameraX,
              y * this.tileSize - cameraY,
              this.tileSize,
              this.tileSize
            );
          }
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  serialize() {
    return {
      name: this.name,
      width: this.width,
      height: this.height,
      tileSize: this.tileSize,
      tiles: this.tiles,
      visible: this.visible,
      opacity: this.opacity,
      properties: this.properties
    };
  }

  static deserialize(data) {
    const layer = new TilemapLayer(data.name, data.width, data.height, data.tileSize);
    layer.tiles = data.tiles;
    layer.visible = data.visible;
    layer.opacity = data.opacity;
    layer.properties = data.properties;
    return layer;
  }
}

class Tilemap {
  constructor(width, height, tileSize = 32) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.layers = [];
    this.tilesets = [];
    this.currentLayerIndex = 0;
    this.currentTilesetIndex = 0;
    this.selectedTileId = 0;
    this.properties = {
      name: 'Untitled Map',
      author: '',
      version: '1.0',
      description: ''
    };
  }

  addTileset(tileset) {
    this.tilesets.push(tileset);
    return this.tilesets.length - 1;
  }

  addLayer(name = 'Layer') {
    const layer = new TilemapLayer(name, this.width, this.height, this.tileSize);
    this.layers.push(layer);
    return layer;
  }

  getCurrentLayer() {
    return this.layers[this.currentLayerIndex];
  }

  getCurrentTileset() {
    return this.tilesets[this.currentTilesetIndex];
  }

  setTile(x, y, tileId) {
    const layer = this.getCurrentLayer();
    if (layer) {
      layer.setTile(x, y, tileId);
    }
  }

  getTile(x, y) {
    const layer = this.getCurrentLayer();
    return layer ? layer.getTile(x, y) : -1;
  }

  paintBrush(x, y, brushSize = 1) {
    const halfBrush = Math.floor(brushSize / 2);
    this.getCurrentLayer().fillRect(
      x - halfBrush,
      y - halfBrush,
      brushSize,
      brushSize,
      this.selectedTileId
    );
  }

  eraseBrush(x, y, brushSize = 1) {
    const halfBrush = Math.floor(brushSize / 2);
    this.getCurrentLayer().fillRect(x - halfBrush, y - halfBrush, brushSize, brushSize, -1);
  }

  fillBucket(x, y, tileId) {
    const layer = this.getCurrentLayer();
    const originalTile = layer.getTile(x, y);
    if (originalTile === tileId) return;

    const queue = [{ x, y }];
    const visited = new Set();

    while (queue.length > 0) {
      const { x: cx, y: cy } = queue.shift();
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (cx >= 0 && cx < this.width && cy >= 0 && cy < this.height) {
        if (layer.getTile(cx, cy) === originalTile) {
          layer.setTile(cx, cy, tileId);
          queue.push({ x: cx + 1, y: cy });
          queue.push({ x: cx - 1, y: cy });
          queue.push({ x: cx, y: cy + 1 });
          queue.push({ x: cx, y: cy - 1 });
        }
      }
    }
  }

  getLayerCount() {
    return this.layers.length;
  }

  getTilesetCount() {
    return this.tilesets.length;
  }

  render(ctx, cameraX = 0, cameraY = 0) {
    for (let layer of this.layers) {
      const tileset = this.getCurrentTileset();
      layer.render(ctx, tileset, cameraX, cameraY);
    }
  }

  serialize() {
    return {
      width: this.width,
      height: this.height,
      tileSize: this.tileSize,
      layers: this.layers.map(l => l.serialize()),
      properties: this.properties,
      version: '1.0'
    };
  }

  static deserialize(data) {
    const tilemap = new Tilemap(data.width, data.height, data.tileSize);
    tilemap.layers = data.layers.map(l => TilemapLayer.deserialize(l));
    tilemap.properties = data.properties;
    return tilemap;
  }
}

class TilemapEditor {
  constructor() {
    this.tilemaps = [];
    this.currentTilemapIndex = 0;
    this.tools = ['paint', 'erase', 'fill', 'select', 'eyedropper'];
    this.currentTool = 'paint';
    this.brushSize = 1;
    this.isMouseDown = false;
    this.gridVisible = true;
  }

  createTilemap(name, width, height, tileSize = 32) {
    const tilemap = new Tilemap(width, height, tileSize);
    tilemap.properties.name = name;
    this.tilemaps.push(tilemap);
    return tilemap;
  }

  getCurrentTilemap() {
    return this.tilemaps[this.currentTilemapIndex];
  }

  setBrushSize(size) {
    this.brushSize = Math.max(1, Math.floor(size));
  }

  setTool(tool) {
    if (this.tools.includes(tool)) {
      this.currentTool = tool;
    }
  }

  paintAt(x, y) {
    const tilemap = this.getCurrentTilemap();
    const gridX = Math.floor(x / tilemap.tileSize);
    const gridY = Math.floor(y / tilemap.tileSize);

    if (this.currentTool === 'paint') {
      tilemap.paintBrush(gridX, gridY, this.brushSize);
    } else if (this.currentTool === 'erase') {
      tilemap.eraseBrush(gridX, gridY, this.brushSize);
    } else if (this.currentTool === 'fill') {
      tilemap.fillBucket(gridX, gridY, tilemap.selectedTileId);
    } else if (this.currentTool === 'eyedropper') {
      const tileId = tilemap.getTile(gridX, gridY);
      if (tileId >= 0) {
        tilemap.selectedTileId = tileId;
      }
    }
  }

  getTilemapCount() {
    return this.tilemaps.length;
  }

  getAllTilemaps() {
    return this.tilemaps;
  }

  serialize() {
    return {
      tilemaps: this.tilemaps.map(t => t.serialize()),
      currentIndex: this.currentTilemapIndex,
      version: '1.0'
    };
  }

  static deserialize(data) {
    const editor = new TilemapEditor();
    editor.tilemaps = data.tilemaps.map(t => Tilemap.deserialize(t));
    editor.currentTilemapIndex = data.currentIndex;
    return editor;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Tileset, TilemapLayer, Tilemap, TilemapEditor };
}
