#!/usr/bin/env node
/* eslint-disable global-require, no-console, @typescript-eslint/no-var-requires */

/**
 * Labyrinth of the Dragon - Unreal IDE Editor Launcher
 * Standalone executable for Unreal Engine 4-panel layout (http://localhost:5000/unreal)
 */

const os = require('os');

const APP_NAME = 'Labyrinth of the Dragon - Unreal IDE';
const PORT = 5000;
const URL = `http://localhost:${PORT}/unreal`;

console.log(`\n${APP_NAME}`);
console.log('Starting IDE server...\n');

// Set environment to indicate which layout to use
process.env.IDE_LAYOUT = 'unreal';

// Load and start server directly
try {
  require('./server.js');
  console.log(`✅ IDE ready at ${URL}`);
  console.log(`\nPress Ctrl+C to stop the server.\n`);

  // Try to open browser (Windows)
  if (os.platform() === 'win32') {
    setTimeout(() => {
      try {
        require('child_process').exec(`start ${URL}`);
      } catch (e) {
        // Silently fail
      }
    }, 2000);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down IDE...');
    process.exit(0);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
