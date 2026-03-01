# Web Application Development Server

## 🌐 Web IDE & Emulator

The Labyrinth of the Dragon project includes a **complete web-based development environment** with:

- 🎮 **Game Boy Color Emulator** - Play and test your ROM in the browser
- 🖼️ **Tile Editor** - View and edit graphics
- 🗺️ **Map Editor** - Design game levels
- 📝 **String Editor** - Manage game text
- 📊 **Table Editor** - Edit game data
- 💻 **Source Viewer** - Browse code
- 🔨 **Build System** - Compile ROM from web interface

---

## 🚀 Quick Start

### **Start the Web Server**

**Option 1: Using compile.exe**
```batch
compile.exe web
```

**Option 2: Using npm**
```bash
npm run web
```

**Option 3: Using node directly**
```bash
node server.js
```

**Option 4: Using batch wrapper**
```batch
compile.bat web
```

The server will start at: **http://localhost:5000**

---

## 📂 Web Application Structure

```
src/client/               Web application root
├── index.html           Main HTML interface
├── css/                 Stylesheets
│   ├── main.css        Main layout
│   ├── menus.css       Menu styling
│   └── widgets.css     UI components
├── js/                  JavaScript modules
│   ├── app.js          Main application
│   ├── menus.js        Menu system
│   ├── tools.js        Development tools
│   ├── widgets.js      UI widgets
│   └── ...
└── emulator/            Game Boy emulator
    ├── GameBoyCore.js  Core emulator
    ├── GameBoyIO.js    Input/Output
    ├── glue.js         Browser integration
    └── ...
```

---

## 🎮 Features

### **1. Game Boy Emulator**
- Full Game Boy Color emulation
- Load ROM files or built ROM
- Play/Pause/Reset controls
- Speed control (1x, 2x, 4x)
- Save states
- Keyboard controls

**Controls:**
- Arrow Keys: D-Pad
- Z: A button
- X: B button
- Enter: Start
- Shift: Select

---

### **2. Tile Editor**
- View all tile graphics
- Browse PNG tiles
- Export/import tiles
- Visual tile picker

**Location:** Click "🖼 Tiles" tab

---

### **3. Map Editor**
- Design game levels
- Place tiles
- Set encounters
- Save/load maps

**Location:** Click "🗺 Maps" tab

---

### **4. String Editor**
- Edit game text
- Organize by bank
- Preview in-game font
- Export to C arrays

**Location:** Click "📝 Strings" tab

---

### **5. Table Editor**
- Edit game data tables
- Monster stats
- Item properties
- Player data

**Location:** Click "📊 Tables" tab

---

### **6. Source Code Viewer**
- Browse C source files
- Syntax highlighting
- Quick navigation

**Location:** Click "💻 Source" tab

---

### **7. Build System**
- Compile ROM from web interface
- Build assets (graphics, maps, strings)
- View build output
- Download compiled ROM

**Location:** Click "🔨 Build" tab or "Build ROM" button

---

## 🔧 Server Configuration

**Edit server.js to customize:**

```javascript
const PORT = 5000;        // Change port
const HOST = '0.0.0.0';   // Listen on all interfaces
```

---

## 🌐 API Endpoints

The server provides REST APIs for the web IDE:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tiles` | GET | List tile PNG files |
| `/api/tilemaps` | GET | List tilemap files |
| `/api/maps` | GET | List map files |
| `/api/strings` | GET | Load string tables |
| `/api/strings` | POST | Save string tables |
| `/api/tables` | GET | Load data tables |
| `/api/tables` | POST | Save data tables |
| `/api/source` | GET | List source files |
| `/api/source/:file` | GET | Read source file |
| `/api/build` | POST | Trigger ROM build |

---

## 📦 Production Deployment

### **Build for Production**

The web app is ready to deploy as-is. No build step required - it's served directly from `src/client/`.

### **Deployment Options**

**1. Local Development**
```bash
node server.js
# Access at http://localhost:5000
```

**2. Network Access**
```bash
# Edit server.js, set:
const HOST = '0.0.0.0';  // Already default

# Access from other devices on network
http://192.168.1.x:5000
```

**3. Production Server**
```bash
# Install PM2 or similar process manager
npm install -g pm2
pm2 start server.js --name "labyrinth-web"
pm2 save
```

**4. Docker Deployment**
Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t labyrinth-web .
docker run -p 5000:5000 labyrinth-web
```

**5. Cloud Deployment**
- Deploy to Heroku, AWS, Azure, or Google Cloud
- Use Node.js runtime
- Set start command: `node server.js`
- Expose port 5000

---

## 🔒 Security Notes

**Development Server - Not production-hardened!**

For production use:
1. Add authentication/authorization
2. Implement rate limiting
3. Add HTTPS support
4. Validate all inputs
5. Use environment variables for config
6. Add CORS if needed

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000

# Kill process by PID
taskkill /PID <PID> /F
```

### Server Won't Start
- Check Node.js is installed: `node --version`
- Check npm dependencies: `npm install`
- Check port 5000 is available
- Check firewall settings

### ROM Won't Load
- Ensure ROM file exists: `LabyrinthOfTheDragon.gbc`
- Build ROM first: `compile.exe all` or use Build tab
- Check browser console for errors (F12)

### Can't Access from Another Device
- Check HOST is set to `0.0.0.0` in server.js
- Check firewall allows connections on port 5000
- Get your IP: `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
- Access via: `http://<your-ip>:5000`

---

## 📱 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Edge | ✅ Full support |
| Safari | ⚠️ Partial (audio issues) |
| Mobile | ⚠️ Basic support |

**Recommended:** Chrome or Firefox for best experience.

---

## 🎯 Usage Examples

### **Example 1: Edit and Test**
1. Start server: `compile.exe web`
2. Open browser: http://localhost:5000
3. Click "🗺 Maps" tab
4. Edit a map
5. Click "Build ROM" button
6. Click "🎮 Emulator" tab
7. Click "Load Built ROM"
8. Click "Play" and test!

### **Example 2: Add New Graphics**
1. Add PNG files to `assets/tiles/`
2. Open web IDE: http://localhost:5000
3. Click "🖼 Tiles" tab
4. View new tiles
5. Build ROM to include them
6. Test in emulator

### **Example 3: Edit Game Text**
1. Open web IDE
2. Click "📝 Strings" tab
3. Edit dialog text
4. Save changes
5. Build ROM
6. Play and see changes!

---

## 🔄 Live Development Workflow

```
┌─────────────────┐
│  Edit Source    │
│  (VS Code)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ compile.exe web │ ← Server auto-reloads
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Web Browser    │
│  localhost:5000 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Test in        │
│  Emulator       │
└─────────────────┘
```

---

## 📊 Server Statistics

Access server stats endpoint (future enhancement):
```
GET /api/stats
```

Returns:
- Uptime
- Requests served
- Active connections
- Build history

---

## 🚀 Advanced Features

### Custom Build Scripts
Edit `server.js` to add custom build targets:
```javascript
const BUILD_COMMANDS = {
  assets: 'make assets',
  rom: 'make',
  all: 'make assets && make',
  custom: 'your-custom-command'
};
```

### WebSocket Support (Future)
For real-time features:
- Live code updates
- Collaborative editing
- Build notifications

---

## 📖 Related Documentation

- [UI_LOCATION_GUIDE.md](UI_LOCATION_GUIDE.md) - Game UI source locations
- [COMPILE_GUIDE.md](COMPILE_GUIDE.md) - Build system documentation
- [COMPILE_EXE_README.md](COMPILE_EXE_README.md) - Executable documentation

---

## ✨ Quick Reference

**Start Server:**
```bash
compile.exe web
npm run web
node server.js
```

**Access:**
- Web IDE: http://localhost:5000
- API: http://localhost:5000/api/*

**Stop Server:**
- Press `Ctrl+C` in terminal
- Or close terminal window

---

**The web application is now running! Open your browser and start developing! 🎉**
