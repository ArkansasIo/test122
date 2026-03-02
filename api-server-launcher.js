#!/usr/bin/env node
/* eslint-disable global-require, no-console, @typescript-eslint/no-var-requires */

/**
 * Labyrinth of the Dragon - API Server
 * Standalone server application (runs on http://localhost:5000 without opening a browser)
 */

const APP_NAME = 'Labyrinth of the Dragon - API Server';
const PORT = 5000;

console.log(`\n${APP_NAME}`);
console.log('Starting API server...\n');

// Load and start server directly
try {
  require('./server.js');
  console.log(`✅ API Server ready at http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  - http://localhost:${PORT}/classic   (Classic Tabs Layout)`);
  console.log(`  - http://localhost:${PORT}/studio    (Modern Sidebar Layout)`);
  console.log(`  - http://localhost:${PORT}/unreal    (Unreal Engine Layout)\n`);
  console.log(`Press Ctrl+C to stop the server.\n`);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down API server...');
    process.exit(0);
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
