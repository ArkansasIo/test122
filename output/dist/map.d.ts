/**
 * Map and floor management system
 */
import { Floor, Entity, Encounter, Direction } from "../types";
export declare class MapManager {
    private floors;
    private currentFloor;
    /**
     * Register a floor
     */
    registerFloor(floor: Floor): void;
    /**
     * Load a floor
     */
    loadFloor(floorId: number): boolean;
    /**
     * Get current floor
     */
    getCurrentFloor(): Floor | null;
    /**
     * Get tile at position
     */
    getTile(x: number, y: number): number | null;
    /**
     * Check if tile is walkable
     */
    isWalkable(x: number, y: number): boolean;
    /**
     * Get entity at position
     */
    getEntityAt(x: number, y: number): Entity | null;
    /**
     * Check for encounter at position
     */
    checkEncounter(x: number, y: number): Encounter | null;
    /**
     * Get floors count
     */
    getFloorCount(): number;
    /**
     * Remove entity
     */
    removeEntity(entityId: number): boolean;
    /**
     * Add entity
     */
    addEntity(entity: Entity): void;
    /**
     * Get all entities of type
     */
    getEntitiesByType(type: Entity["type"]): Entity[];
}
/**
 * Create a simple test floor
 */
export declare function createTestFloor(): Floor;
/**
 * Helper function to calculate next position
 */
export declare function getNextPosition(x: number, y: number, direction: Direction): {
    x: number;
    y: number;
};
