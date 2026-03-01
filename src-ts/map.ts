/**
 * Map and floor management system
 */

import { Floor, Entity, Encounter, Direction } from "../types";

export class MapManager {
  private floors: Map<number, Floor> = new Map();
  private currentFloor: Floor | null = null;

  /**
   * Register a floor
   */
  public registerFloor(floor: Floor): void {
    this.floors.set(floor.id, floor);
  }

  /**
   * Load a floor
   */
  public loadFloor(floorId: number): boolean {
    const floor = this.floors.get(floorId);
    if (!floor) {
      console.error(`Floor ${floorId} not found`);
      return false;
    }

    this.currentFloor = floor;
    console.log(`Loaded floor: ${floor.name}`);
    return true;
  }

  /**
   * Get current floor
   */
  public getCurrentFloor(): Floor | null {
    return this.currentFloor;
  }

  /**
   * Get tile at position
   */
  public getTile(x: number, y: number): number | null {
    if (!this.currentFloor) {
      return null;
    }

    if (y < 0 || y >= this.currentFloor.height || x < 0 || x >= this.currentFloor.width) {
      return null;
    }

    return this.currentFloor.tiles[y][x];
  }

  /**
   * Check if tile is walkable
   */
  public isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (tile === null) {
      return false;
    }

    // Tile IDs 0-9 are walkable (floor tiles)
    // Tile IDs 10+ are walls/obstacles
    return tile < 10;
  }

  /**
   * Get entity at position
   */
  public getEntityAt(x: number, y: number): Entity | null {
    if (!this.currentFloor) {
      return null;
    }

    return this.currentFloor.entities.find(e => e.x === x && e.y === y) || null;
  }

  /**
   * Check for encounter at position
   */
  public checkEncounter(x: number, y: number): Encounter | null {
    if (!this.currentFloor) {
      return null;
    }

    for (const encounter of this.currentFloor.encounters) {
      if (x >= encounter.x && 
          x < encounter.x + encounter.width &&
          y >= encounter.y && 
          y < encounter.y + encounter.height) {
        
        // Check encounter rate
        const roll = Math.floor(Math.random() * 256);
        if (roll < encounter.encounterRate) {
          return encounter;
        }
      }
    }

    return null;
  }

  /**
   * Get floors count
   */
  public getFloorCount(): number {
    return this.floors.size;
  }

  /**
   * Remove entity
   */
  public removeEntity(entityId: number): boolean {
    if (!this.currentFloor) {
      return false;
    }

    const index = this.currentFloor.entities.findIndex(e => e.id === entityId);
    if (index === -1) {
      return false;
    }

    this.currentFloor.entities.splice(index, 1);
    return true;
  }

  /**
   * Add entity
   */
  public addEntity(entity: Entity): void {
    if (!this.currentFloor) {
      return;
    }

    this.currentFloor.entities.push(entity);
  }

  /**
   * Get all entities of type
   */
  public getEntitiesByType(type: Entity["type"]): Entity[] {
    if (!this.currentFloor) {
      return [];
    }

    return this.currentFloor.entities.filter(e => e.type === type);
  }
}

/**
 * Create a simple test floor
 */
export function createTestFloor(): Floor {
  const width = 20;
  const height = 18;
  const tiles: number[][] = [];

  // Create a simple room with walls
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      // Borders are walls (tile 10)
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push(10);
      } else {
        // Interior is floor (tile 0)
        row.push(0);
      }
    }
    tiles.push(row);
  }

  const entities: Entity[] = [
    {
      id: 1,
      type: "chest",
      x: 10,
      y: 9,
      sprite: 50,
      isInteractable: true,
      data: { itemId: 1 }, // Contains a potion
    },
    {
      id: 2,
      type: "stairs",
      x: 18,
      y: 16,
      sprite: 51,
      isInteractable: true,
      data: { targetFloor: 2 },
    },
  ];

  const encounters: Encounter[] = [
    {
      id: 1,
      x: 1,
      y: 1,
      width: 18,
      height: 16,
      monsterGroups: [
        {
          monsters: [1], // Slime
          weight: 50,
        },
        {
          monsters: [2], // Goblin
          weight: 30,
        },
        {
          monsters: [1, 1], // Two slimes
          weight: 20,
        },
      ],
      encounterRate: 10, // Low encounter rate for testing
    },
  ];

  return {
    id: 1,
    name: "Test Floor",
    width: width,
    height: height,
    tiles: tiles,
    entities: entities,
    encounters: encounters,
    palette: 0,
  };
}

/**
 * Helper function to calculate next position
 */
export function getNextPosition(x: number, y: number, direction: Direction): { x: number; y: number } {
  switch (direction) {
    case "up":
      return { x, y: y - 1 };
    case "down":
      return { x, y: y + 1 };
    case "left":
      return { x: x - 1, y };
    case "right":
      return { x: x + 1, y };
    default:
      return { x, y };
  }
}
