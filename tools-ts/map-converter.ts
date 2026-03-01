/**
 * Map data converter
 * Converts map data to C format for Game Boy
 */

import * as fs from "fs";
import * as path from "path";

export interface MapData {
  width: number;
  height: number;
  tiles: number[][];
  entities?: EntityData[];
  encounters?: EncounterData[];
}

export interface EntityData {
  id: number;
  type: string;
  x: number;
  y: number;
  data?: any;
}

export interface EncounterData {
  x: number;
  y: number;
  width: number;
  height: number;
  rate: number;
  groups: number[][];
}

/**
 * Load map from JSON
 */
export function loadMapFromJSON(filePath: string): MapData {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

/**
 * Convert map to C format
 */
export function mapToC(mapData: MapData, mapName: string, bankNumber?: number): string {
  let output = `// Generated map: ${mapName}\n`;
  output += `// Size: ${mapData.width}x${mapData.height}\n`;
  
  if (bankNumber !== undefined) {
    output += `#pragma bank ${bankNumber}\n`;
  }
  output += "\n";

  // Map dimensions
  output += `#define ${mapName.toUpperCase()}_WIDTH ${mapData.width}\n`;
  output += `#define ${mapName.toUpperCase()}_HEIGHT ${mapData.height}\n\n`;

  // Map tile data
  output += `const unsigned char ${mapName}_tiles[] = {\n`;
  for (let y = 0; y < mapData.height; y++) {
    output += "  ";
    for (let x = 0; x < mapData.width; x++) {
      const tile = mapData.tiles[y][x];
      output += `0x${tile.toString(16).padStart(2, "0")}`;
      if (x < mapData.width - 1 || y < mapData.height - 1) {
        output += ", ";
      }
    }
    output += "\n";
  }
  output += `};\n\n`;

  // Entity data
  if (mapData.entities && mapData.entities.length > 0) {
    output += `// Entity data\n`;
    output += `typedef struct {\n`;
    output += `  unsigned char id;\n`;
    output += `  unsigned char type;\n`;
    output += `  unsigned char x;\n`;
    output += `  unsigned char y;\n`;
    output += `} entity_t;\n\n`;

    output += `const entity_t ${mapName}_entities[] = {\n`;
    for (let i = 0; i < mapData.entities.length; i++) {
      const entity = mapData.entities[i];
      const typeId = getEntityTypeId(entity.type);
      output += `  { ${entity.id}, ${typeId}, ${entity.x}, ${entity.y} }`;
      if (i < mapData.entities.length - 1) output += ",";
      output += "\n";
    }
    output += `};\n`;
    output += `#define ${mapName.toUpperCase()}_ENTITY_COUNT ${mapData.entities.length}\n\n`;
  }

  // Encounter data
  if (mapData.encounters && mapData.encounters.length > 0) {
    output += `// Encounter data\n`;
    output += `typedef struct {\n`;
    output += `  unsigned char x;\n`;
    output += `  unsigned char y;\n`;
    output += `  unsigned char width;\n`;
    output += `  unsigned char height;\n`;
    output += `  unsigned char rate;\n`;
    output += `} encounter_zone_t;\n\n`;

    output += `const encounter_zone_t ${mapName}_encounters[] = {\n`;
    for (let i = 0; i < mapData.encounters.length; i++) {
      const enc = mapData.encounters[i];
      output += `  { ${enc.x}, ${enc.y}, ${enc.width}, ${enc.height}, ${enc.rate} }`;
      if (i < mapData.encounters.length - 1) output += ",";
      output += "\n";
    }
    output += `};\n`;
    output += `#define ${mapName.toUpperCase()}_ENCOUNTER_COUNT ${mapData.encounters.length}\n\n`;
  }

  return output;
}

/**
 * Get entity type ID from string
 */
function getEntityTypeId(type: string): number {
  const typeMap: Record<string, number> = {
    npc: 0,
    chest: 1,
    door: 2,
    stairs: 3,
    sign: 4,
    trap: 5,
    trigger: 6,
  };
  return typeMap[type.toLowerCase()] || 0;
}

/**
 * Convert tilemap format (Tiled JSON export)
 */
export function convertTiledJSON(tiledData: any): MapData {
  const layer = tiledData.layers[0]; // Assume first layer is tile layer

  const tiles: number[][] = [];
  for (let y = 0; y < tiledData.height; y++) {
    const row: number[] = [];
    for (let x = 0; x < tiledData.width; x++) {
      const index = y * tiledData.width + x;
      row.push(layer.data[index] - 1); // Tiled uses 1-indexed, we use 0-indexed
    }
    tiles.push(row);
  }

  // Extract entities from object layers
  const entities: EntityData[] = [];
  for (const layer of tiledData.layers) {
    if (layer.type === "objectgroup") {
      for (const obj of layer.objects) {
        entities.push({
          id: obj.id,
          type: obj.type || "npc",
          x: Math.floor(obj.x / tiledData.tilewidth),
          y: Math.floor(obj.y / tiledData.tileheight),
          data: obj.properties || {},
        });
      }
    }
  }

  return {
    width: tiledData.width,
    height: tiledData.height,
    tiles: tiles,
    entities: entities,
  };
}

/**
 * Process directory of map files
 */
export function processMapDirectory(
  inputDir: string,
  outputDir: string,
  bankNumber?: number
): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);

  for (const file of files) {
    if (path.extname(file).toLowerCase() === ".json") {
      const inputPath = path.join(inputDir, file);
      const baseName = path.basename(file, ".json");
      const outputPath = path.join(outputDir, `${baseName}.c`);

      console.log(`Processing map ${file}...`);

      try {
        const rawData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
        
        // Check if it's a Tiled export
        let mapData: MapData;
        if (rawData.type === "map") {
          mapData = convertTiledJSON(rawData);
        } else {
          mapData = rawData;
        }

        const cCode = mapToC(mapData, baseName, bankNumber);
        fs.writeFileSync(outputPath, cCode, "utf-8");
        console.log(`  Generated ${outputPath}`);
      } catch (error) {
        console.error(`  Error processing ${file}:`, error);
      }
    }
  }
}
