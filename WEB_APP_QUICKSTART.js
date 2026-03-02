#!/usr/bin/env node
/**
 * Labyrinth of the Dragon - Installation & Usage Summary
 * Complete Web App with API Backend and UI
 */

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🐉 LABYRINTH OF THE DRAGON - WEB APP COMPLETE 🐉               ║
║                                                                              ║
║                    Full Application with API & UI Ready!                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

📦 CREATE & RUN IS COMPLETE!
═══════════════════════════════════════════════════════════════════════════════

✅ CREATED FILES:
   1. web-app.js                    - Main application server
   2. web-app.exe                   - Standalone executable (~45MB)
   3. run-web-app.bat               - Windows launcher script
   4. WEB_APP.md                    - Complete documentation
   5. Your web app in /output       - Distribution-ready

🚀 QUICK START:
═══════════════════════════════════════════════════════════════════════════════

Windows (Easiest):
   1. Double-click run-web-app.bat
   OR
   2. Double-click web-app.exe
   
Node.js:
   npm run web

Custom Port:
   set LOD_PORT=8080 && web-app.exe
   OR
   LOD_PORT=8080 npm run web

🌐 ACCESS THE APP:
═══════════════════════════════════════════════════════════════════════════════

• Unreal Engine UI:    http://localhost:5000
• Modern Studio:       http://localhost:5000/studio
• Classic Interface:   http://localhost:5000/classic

💻 API ENDPOINTS:
═══════════════════════════════════════════════════════════════════════════════

Health & Info:
   GET  /api/health         - Server status
   GET  /api/system         - System information

Assets:
   GET  /api/tiles          - List tile assets
   GET  /api/maps           - List map files
   GET  /api/tilemaps       - List tilemap data
   GET  /api/roms           - List ROM files

Resources:
   GET  /api/strings        - Get game text
   POST /api/strings        - Update game text
   GET  /api/tables         - Get game tables
   POST /api/tables         - Update game tables

Download:
   GET  /api/download?rom=file.gbc  - Download ROM

🛠️ BUILD COMMANDS:
═══════════════════════════════════════════════════════════════════════════════

npm run build-web-exe      - Build web-app.exe
npm run build-exe          - Build compile.exe  
npm run build-game         - Compile Game Boy ROM
npm run clean              - Clean build artifacts
npm run web                - Run web server
npm run build-game         - Build all

📂 PROJECT STRUCTURE:
═══════════════════════════════════════════════════════════════════════════════

LabyrinthOfTheDragon/
├── web-app.exe           ← Run this! (Windows)
├── run-web-app.bat       ← Or this! (Windows launcher)
├── web-app.js            ← Node.js entry point
├── package.json          ← Build configuration
├── WEB_APP.md            ← Full documentation
├── unreal-studio.html    ← Modern 4-panel UI
├── studio.html           ← Sidebar UI
├── src/client/           ← Classic UI
├── dist/                 ← Compiled assets
├── output/               ← Distribution files
└── [other game files]

⚙️ FEATURES INCLUDED:
═══════════════════════════════════════════════════════════════════════════════

✓ API Backend Server
✓ Multiple UI Interfaces (Unreal, Studio, Classic)
✓ Asset Management (Tiles, Maps, ROMs)
✓ Resource Editing (Strings, Tables)
✓ CORS Support
✓ Health Check Endpoints
✓ Auto-browser Launch
✓ Custom Port Support
✓ Standalone Executable (~45MB)
✓ Development & Production Ready

🔧 TROUBLESHOOTING:
═══════════════════════════════════════════════════════════════════════════════

Port 5000 Already Used:
   taskkill /F /IM web-app.exe
   set LOD_PORT=3000 && web-app.exe

Cannot Build Executable:
   npm install
   npm run build-web-exe

Browser Won't Open:
   set LOD_AUTO_OPEN=false
   Open http://localhost:5000 manually

🎮 FEATURES YOU CAN NOW DO:
═══════════════════════════════════════════════════════════════════════════════

✓ Manage game assets through web UI
✓ Edit game strings and data tables
✓ Download compiled ROM files
✓ Monitor system and server health
✓ API integration with external tools
✓ Run on network (localhost only)
✓ Multiple interface options
✓ Scriptable API endpoints

📚 NEXT STEPS:
═══════════════════════════════════════════════════════════════════════════════

1. Run the app:
   .\web-app.exe

2. Open in browser:
   http://localhost:5000

3. Test API endpoints:
   http://localhost:5000/api/health
   http://localhost:5000/api/system

4. Edit resources:
   - Upload tile assets
   - Manage map files
   - Build ROM files

5. Share with team:
   - Copy web-app.exe to network
   - Run on shared machine
   - Access from other PCs

📝 DOCUMENTATION:
═══════════════════════════════════════════════════════════════════════════════

See WEB_APP.md for:
   • Complete API reference
   • Configuration options
   • Environment variables
   • Advanced usage
   • Development guide
   • Troubleshooting FAQ

═══════════════════════════════════════════════════════════════════════════════

                           Ready to Launch! 🚀
              Run: web-app.exe or npm run web

═══════════════════════════════════════════════════════════════════════════════
`);
