"use strict";
/**
 * Utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.lerp = lerp;
exports.randomInt = randomInt;
exports.randomFloat = randomFloat;
exports.randomElement = randomElement;
exports.shuffle = shuffle;
exports.formatTime = formatTime;
exports.formatDate = formatDate;
exports.distance = distance;
exports.manhattanDistance = manhattanDistance;
exports.deepClone = deepClone;
exports.wait = wait;
exports.debounce = debounce;
exports.throttle = throttle;
exports.pointInRect = pointInRect;
exports.hexToRgb = hexToRgb;
exports.rgbToHex = rgbToHex;
exports.percentage = percentage;
exports.roundTo = roundTo;
/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * Linear interpolation
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}
/**
 * Random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Random float between min and max
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Random element from array
 */
function randomElement(array) {
    if (array.length === 0) {
        return undefined;
    }
    return array[Math.floor(Math.random() * array.length)];
}
/**
 * Shuffle array in place
 */
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
/**
 * Format time in milliseconds to mm:ss
 */
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
/**
 * Format date timestamp
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}
/**
 * Calculate distance between two points
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
/**
 * Calculate Manhattan distance
 */
function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Wait for specified milliseconds
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle = false;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * Check if point is in rectangle
 */
function pointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return x >= rectX && x < rectX + rectWidth && y >= rectY && y < rectY + rectHeight;
}
/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}
/**
 * Convert RGB to hex color
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
/**
 * Calculate percentage
 */
function percentage(value, max) {
    if (max === 0)
        return 0;
    return (value / max) * 100;
}
/**
 * Round to decimal places
 */
function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
//# sourceMappingURL=utils.js.map