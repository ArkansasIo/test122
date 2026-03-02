#!/usr/bin/env node
/**
 * Labyrinth of the Dragon - Web App
 * Full-featured web server with API backend and UI
 * Package this file as an executable with: npm run build-web-exe
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');
const os = require('os');

const PORT = process.env.LOD_PORT || 5000;
const HOST = '0.0.0.0';

// Determine ROOT_DIR with fallbacks
let ROOT_DIR = process.env.LOD_ROOT_DIR;
if (!ROOT_DIR) {
  // Try current working directory first
  if (fs.existsSync(path.join(process.cwd(), 'unreal-studio.html'))) {
    ROOT_DIR = process.cwd();
  } 
  // Try __dirname (for development)
  else if (fs.existsSync(path.join(__dirname, 'unreal-studio.html'))) {
    ROOT_DIR = __dirname;
  }
  // Try parent of __dirname
  else if (fs.existsSync(path.join(__dirname, '..', 'unreal-studio.html'))) {
    ROOT_DIR = path.join(__dirname, '..');
  }
  // Default to current working directory
  else {
    ROOT_DIR = process.cwd();
  }
}

const AUTO_OPEN = process.env.LOD_AUTO_OPEN !== 'false';

// MIME types
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.gbc': 'application/octet-stream',
  '.bin': 'application/octet-stream',
  '.csv': 'text/csv',
  '.tilemap': 'application/octet-stream',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// Utility functions
function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1>');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function jsonResponse(res, data, status = 200) {
  res.writeHead(status, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function plainTextResponse(res, text, status = 200) {
  res.writeHead(status, { 'Content-Type': 'text/plain' });
  res.end(text);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB max
    
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk;
    });
    
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function safePath(base, userInput) {
  const resolved = path.resolve(base, path.basename(userInput));
  if (!resolved.startsWith(path.resolve(base))) return null;
  return resolved;
}

// API Handlers
async function handleAPI(req, res, pathname, query) {
  try {
    // System info
    if (pathname === '/api/system' && req.method === 'GET') {
      return jsonResponse(res, {
        os: os.type(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        nodeVersion: process.version,
        port: PORT,
        root: ROOT_DIR
      });
    }

    // Tiles API
    if (pathname === '/api/tiles' && req.method === 'GET') {
      const dir = path.join(ROOT_DIR, 'assets/tiles');
      try {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
        return jsonResponse(res, { success: true, files });
      } catch {
        return jsonResponse(res, { success: true, files: [] });
      }
    }

    // Tilemaps API
    if (pathname === '/api/tilemaps' && req.method === 'GET') {
      const dir = path.join(ROOT_DIR, 'res/tilemaps');
      try {
        const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.tilemap')) : [];
        return jsonResponse(res, { success: true, files });
      } catch {
        return jsonResponse(res, { success: true, files: [] });
      }
    }

    // Maps API
    if (pathname === '/api/maps' && req.method === 'GET') {
      const dir = path.join(ROOT_DIR, 'res/maps');
      try {
        const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
        return jsonResponse(res, { success: true, files });
      } catch {
        return jsonResponse(res, { success: true, files: [] });
      }
    }

    // ROM Files API
    if (pathname === '/api/roms' && req.method === 'GET') {
      const dir = path.join(ROOT_DIR, 'roms');
      try {
        const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.gbc') || f.endsWith('.gb')) : [];
        return jsonResponse(res, { success: true, files });
      } catch {
        return jsonResponse(res, { success: true, files: [] });
      }
    }

    // Download ROM
    if (pathname.startsWith('/api/download') && req.method === 'GET') {
      const romName = query.rom;
      if (!romName) return jsonResponse(res, { error: 'ROM name required' }, 400);
      
      const romPath = safePath(path.join(ROOT_DIR, 'roms'), romName);
      if (!romPath || !fs.existsSync(romPath)) {
        return jsonResponse(res, { error: 'ROM not found' }, 404);
      }
      
      return serveFile(res, romPath);
    }

    // Strings API
    if (pathname === '/api/strings' && req.method === 'GET') {
      const strFile = path.join(ROOT_DIR, 'assets/strings.js');
      try {
        const content = fs.readFileSync(strFile, 'utf8');
        return jsonResponse(res, { success: true, content });
      } catch (e) {
        return jsonResponse(res, { success: false, error: e.message }, 400);
      }
    }

    if (pathname === '/api/strings' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        const data = JSON.parse(body);
        fs.writeFileSync(path.join(ROOT_DIR, 'assets/strings.js'), data.content);
        return jsonResponse(res, { success: true });
      } catch (e) {
        return jsonResponse(res, { success: false, error: e.message }, 400);
      }
    }

    // Tables API
    if (pathname === '/api/tables' && req.method === 'GET') {
      try {
        const content = fs.readFileSync(path.join(ROOT_DIR, 'assets/tables.csv'), 'utf8');
        return jsonResponse(res, { success: true, content });
      } catch (e) {
        return jsonResponse(res, { success: false, error: e.message }, 400);
      }
    }

    if (pathname === '/api/tables' && req.method === 'POST') {
      try {
        const body = await readBody(req);
        const data = JSON.parse(body);
        fs.writeFileSync(path.join(ROOT_DIR, 'assets/tables.csv'), data.content);
        return jsonResponse(res, { success: true });
      } catch (e) {
        return jsonResponse(res, { success: false, error: e.message }, 400);
      }
    }

    // Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return jsonResponse(res, { 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    }

    // Default API 404
    return jsonResponse(res, { error: 'API endpoint not found' }, 404);

  } catch (e) {
    console.error('API Error:', e);
    return jsonResponse(res, { error: e.message }, 500);
  }
}

// Create and start server
function createServer() {
  return http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    const query = parsed.query;

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    try {
      // Root - serve main UI (Unreal-style 4-panel)
      if (pathname === '/' || pathname === '/index.html') {
        return serveFile(res, path.join(ROOT_DIR, 'unreal-studio.html'));
      }

      // UI Routes
      if (pathname === '/classic' || pathname === '/classic.html') {
        return serveFile(res, path.join(ROOT_DIR, 'src/client/index.html'));
      }

      if (pathname === '/studio' || pathname === '/studio.html') {
        return serveFile(res, path.join(ROOT_DIR, 'studio.html'));
      }

      if (pathname === '/unreal' || pathname === '/unreal.html') {
        return serveFile(res, path.join(ROOT_DIR, 'unreal-studio.html'));
      }

      // API routes
      if (pathname.startsWith('/api/')) {
        return handleAPI(req, res, pathname, query);
      }

      // Static files
      const candidates = [
        path.join(ROOT_DIR, 'src/client', pathname),
        path.join(ROOT_DIR, 'dist', pathname),
        path.join(ROOT_DIR, pathname),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return serveFile(res, candidate);
        }
      }

      // 404
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>404 Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 50px auto; padding: 20px; background: white; border-radius: 8px; }
            h1 { color: #d32f2f; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Page Not Found</h1>
            <p>The requested path does not exist: ${pathname}</p>
            <p><a href="/">Return to home</a></p>
          </div>
        </body>
        </html>
      `);

    } catch (e) {
      console.error('Server Error:', e);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });
}

// Launch browser
function openBrowser(url) {
  if (!AUTO_OPEN) return;
  
  const commands = {
    win32: `start ${url}`,
    darwin: `open ${url}`,
    linux: `xdg-open ${url}`
  };

  const cmd = commands[process.platform];
  if (cmd) {
    exec(cmd, (err) => {
      if (err) console.error('Note: Could not auto-open browser');
    });
  }
}

// Start server
function main() {
  // Verify key files exist
  const keyFiles = ['unreal-studio.html', 'studio.html'];
  const missingFiles = keyFiles.filter(f => !fs.existsSync(path.join(ROOT_DIR, f)));
  
  if (missingFiles.length > 0) {
    console.error('\n❌ ERROR: Missing required files!');
    console.error('Missing:', missingFiles.join(', '));
    console.error('ROOT_DIR:', ROOT_DIR);
    console.error('\nTo fix:');
    console.error('1. Ensure you run from the project directory, OR');
    console.error('2. Set: set LOD_ROOT_DIR=<path-to-project>');
    console.error('3. Example: set LOD_ROOT_DIR=D:\\LabyrinthOfTheDragon\\LabyrinthOfTheDragon');
    process.exit(1);
  }

  const server = createServer();
  
  server.listen(PORT, HOST, () => {
    const url = `http://localhost:${PORT}`;
    console.log('\n' + '='.repeat(60));
    console.log('🐉 Labyrinth of the Dragon - Web App');
    console.log('='.repeat(60));
    console.log(`✓ Server running at: ${url}`);
    console.log(`✓ Host: ${HOST}:${PORT}`);
    console.log(`✓ Root: ${ROOT_DIR}`);
    console.log(`✓ Node: ${process.version}`);
    console.log('='.repeat(60));
    console.log('\nAvailable UIs:');
    console.log(`  • Unreal Style:  ${url}/unreal`);
    console.log(`  • Modern Studio: ${url}/studio`);
    console.log(`  • Classic Tab:   ${url}/classic`);
    console.log('\nAPI Endpoints:');
    console.log(`  • System Info:   ${url}/api/system`);
    console.log(`  • Health Check:  ${url}/api/health`);
    console.log(`  • Tiles:         ${url}/api/tiles`);
    console.log(`  • Maps:          ${url}/api/maps`);
    console.log(`  • ROMs:          ${url}/api/roms`);
    console.log('='.repeat(60) + '\n');

    openBrowser(url);
  });

  server.on('error', (e) => {
    console.error('Server error:', e);
    if (e.code === 'EADDRINUSE') {
      console.error(`\nPort ${PORT} is already in use.`);
      console.error(`Try a different port: LOD_PORT=3000 node web-app.js`);
    }
    process.exit(1);
  });
}

main();
