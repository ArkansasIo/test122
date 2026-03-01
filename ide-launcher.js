#!/usr/bin/env node

/**
 * Labyrinth of the Dragon - IDE Editor Launcher
 * Standalone executable that launches the complete IDE with compiler
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const APP_NAME = 'Labyrinth of the Dragon IDE';
const PORT = 5000;
const URL = `http://localhost:${PORT}`;

console.log('\n' + '='.repeat(60));
console.log(` ${APP_NAME}`);
console.log('='.repeat(60));
console.log(`\n🚀 Starting IDE Editor...`);
console.log(`📍 Access at: ${URL}`);
console.log(`🔧 Port: ${PORT}`);
console.log(`\n⏳ Initializing...`);

// Find the server script location
const appDir = process.pkg 
  ? path.dirname(process.execPath)
  : __dirname;

// Start bundled server in-process (works in packaged EXE)
let server;
try {
  process.env.LOD_ROOT_DIR = appDir;
  const { startServer } = require('./server');
  server = startServer(PORT, '0.0.0.0');
} catch (err) {
  console.error(`\n❌ Failed to start server: ${err.message}`);
  console.log('\n⏹️  Press Enter to exit...');
  process.stdin.once('data', () => process.exit(1));
  process.stdin.resume();
  return;
}

server.on('error', (err) => {
  console.error(`\n❌ Server runtime error: ${err.message}`);
});

// Wait a moment for server to start, then open browser
setTimeout(() => {
  console.log(`\n✨ IDE is starting...`);
  
  const platform = os.platform();
  let command;

  if (platform === 'win32') {
    command = `start ${URL}`;
  } else if (platform === 'darwin') {
    command = `open ${URL}`;
  } else {
    command = `xdg-open ${URL}`;
  }

  try {
    spawn(command, { shell: true, detached: true });
    console.log(`✅ Browser opened to: ${URL}\n`);
  } catch (err) {
    console.log(`\n⚠️  Could not auto-open browser`);
    console.log(`📍 Open manually: ${URL}\n`);
  }
  
  console.log(`🌐 Web IDE is running!`);
  console.log(`⏹️  Press Ctrl+C to stop\n`);
}, 2000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down IDE...');
  if (server && server.close) {
    server.close(() => process.exit(0));
    return;
  }
  process.exit(0);
});
