/**
 * Utility functions
 */
/**
 * Clamp a value between min and max
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Linear interpolation
 */
export declare function lerp(start: number, end: number, t: number): number;
/**
 * Random integer between min and max (inclusive)
 */
export declare function randomInt(min: number, max: number): number;
/**
 * Random float between min and max
 */
export declare function randomFloat(min: number, max: number): number;
/**
 * Random element from array
 */
export declare function randomElement<T>(array: T[]): T | undefined;
/**
 * Shuffle array in place
 */
export declare function shuffle<T>(array: T[]): T[];
/**
 * Format time in milliseconds to mm:ss
 */
export declare function formatTime(ms: number): string;
/**
 * Format date timestamp
 */
export declare function formatDate(timestamp: number): string;
/**
 * Calculate distance between two points
 */
export declare function distance(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Calculate Manhattan distance
 */
export declare function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Wait for specified milliseconds
 */
export declare function wait(ms: number): Promise<void>;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Check if point is in rectangle
 */
export declare function pointInRect(x: number, y: number, rectX: number, rectY: number, rectWidth: number, rectHeight: number): boolean;
/**
 * Convert hex color to RGB
 */
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
/**
 * Convert RGB to hex color
 */
export declare function rgbToHex(r: number, g: number, b: number): string;
/**
 * Calculate percentage
 */
export declare function percentage(value: number, max: number): number;
/**
 * Round to decimal places
 */
export declare function roundTo(value: number, decimals: number): number;
