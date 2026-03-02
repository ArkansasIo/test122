# Labyrinth of the Dragon - Web App

A complete web application with API backend and modern UI for managing the Labyrinth of the Dragon Game Boy Color RPG.

## Quick Start

### Option 1: Run the Standalone Executable (Recommended)
```bash
# Windows
.\web-app.exe

# Or use the launcher script
.\run-web-app.bat
```

### Option 2: Run with Node.js
```bash
npm run web
```

### Option 3: Run on Custom Port
```bash
set LOD_PORT=3000
.\web-app.exe

# Or with Node
LOD_PORT=3000 node web-app.js
```

## Features

### User Interfaces
The application provides three different UI options:

1. **Unreal Engine Style** (Default) - `http://localhost:5000`
   - Modern 4-panel layout inspired by Unreal Engine
   - Advanced project management tools
   - Asset and resource browser
   - Build and compilation controls

2. **Modern Studio UI** - `http://localhost:5000/studio`
   - Sidebar-based navigation
   - Integrated code editor
   - Real-time preview
   - Asset management panel

3. **Classic Tab Interface** - `http://localhost:5000/classic`
   - Traditional tab-based layout
   - Simple and efficient workflow
   - Quick access to all tools

### API Endpoints

All endpoints support CORS and return JSON responses.

#### System Information
- `GET /api/health` - Health check endpoint
- `GET /api/system` - System information (OS, Node version, uptime)

#### Asset Management
- `GET /api/tiles` - List all tile assets
- `GET /api/tilemaps` - List all tilemap data
- `GET /api/maps` - List all map files
- `GET /api/roms` - List compiled ROM files

#### Resource Editing
- `GET /api/strings` - Get game strings/text
- `POST /api/strings` - Update game strings
- `GET /api/tables` - Get game data tables
- `POST /api/tables` - Update game data tables

#### File Operations
- `GET /api/download?rom=filename.gbc` - Download compiled ROM

## Build Scripts

### Build Web App Executable
```bash
npm run build-web-exe
```
Creates `web-app.exe` (~45MB, includes Node.js runtime)

### Build Compiler Executable
```bash
npm run build-exe
```
Creates `compile.exe` (C/C++ compilation tool)

### Build Game Boy ROM
```bash
npm run build-game
```
Compiles the Game Boy Color ROM

### Full Build
```bash
npm run build-web-exe && npm run build-game
```

## Configuration

### Environment Variables
```bash
# Custom port (default: 5000)
set LOD_PORT=3000

# Custom root directory (default: script directory)
set LOD_ROOT_DIR=D:\projects\game

# Disable auto-open browser
set LOD_AUTO_OPEN=false
```

### Ports
- Default: `5000`
- Auto-fallback: Tries 5000-5010 to find available port
- To use a specific port: `LOD_PORT=8080 web-app.exe`

## File Structure

```
LabyrinthOfTheDragon/
├── web-app.js              # Main web server application
├── web-app.exe             # Compiled executable (created by npm run build-web-exe)
├── run-web-app.bat         # Windows launcher script
├── server.js               # Legacy server (use web-app.js instead)
├── unreal-studio.html      # Unreal Engine style UI
├── studio.html             # Modern studio UI
├── src/client/
│   └── index.html          # Classic tab interface
├── dist/                   # Compiled TypeScript
├── src-ts/                 # TypeScript sources
├── assets/                 # Game assets (tiles, sprites)
├── res/maps/              # Map files
├── res/tilemaps/          # Tilemap definitions
└── roms/                   # Compiled ROM files
```

## Technical Details

### Stack
- **Backend**: Node.js HTTP server
- **Frontend**: HTML5, CSS3, JavaScript
- **Compiler**: @yao-pkg/pkg (Node.js packager)
- **Port**: TCP 5000 (default)

### Performance
- Lightweight HTTP server (~45MB exe with Node.js)
- Asynchronous file I/O
- CORS support for cross-origin requests
- Efficient asset streaming

### Browser Support
- Chrome/Chromium: Full support
- Firefox: Full support
- Edge: Full support
- Safari: Full support

## Troubleshooting

### Port Already in Use
```bash
# Try a different port
set LOD_PORT=3000
.\web-app.exe

# Or find and kill the process
taskkill /F /IM web-app.exe
taskkill /F /IM node.exe
```

### Cannot Build Executable
```bash
# Ensure npm packages are installed
npm install

# Clear cache and rebuild
npm run clean
npm run build-web-exe
```

### UI Not Loading
1. Check browser console for errors (F12)
2. Verify port is accessible: http://localhost:5000
3. Check firewall settings
4. Try: `set LOD_AUTO_OPEN=false` and manual browser open

### API Not Responding
1. Check `/api/health` endpoint
2. Verify root directory: Check `/api/system` output
3. Restart server: Kill process and rerun exe
4. Check file permissions in project directory

## Development

### Running in Development Mode
```bash
node web-app.js
```

### With Custom Root Directory
```bash
set LOD_ROOT_DIR=D:\projects\game-assets
node web-app.js
```

### Disabling Auto-Open Browser
```bash
set LOD_AUTO_OPEN=false
node web-app.js
```

## Performance Tips

1. **Use the compiled exe** for better startup time
2. **Close other applications** using port 5000
3. **Use SSD** for better file I/O performance
4. **Modern browser** for best UI performance
5. **Local network** avoids internet latency

## Security Notes

- This application is designed for local development
- Not recommended for production internet exposure
- No authentication/authorization implemented
- File system access is limited to project root
- CORS enabled for all origins (localhost development only)

## Advanced Usage

### Compile and Run as Service
```bash
.\web-app.exe

# In another terminal, test API endpoints
curl http://localhost:5000/api/health
```

### Scripted Builds
```batch
@echo off
REM Build and launch web app

cd /d %~dp0
npm run build-web-exe 2>error.log
if errorlevel 1 (
    echo Build failed. See error.log
    pause
    exit /b 1
)

.\web-app.exe
```

## License

Part of Labyrinth of the Dragon project.
See LICENSE file for details.

## Support

- Check documentation files in `/documents/`
- See API endpoints for debugging info
- Check `/api/health` and `/api/system` for diagnostics
