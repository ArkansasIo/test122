# ⚡ Quick Reference Card

**Print this page and keep it handy!**

---

## 🎮 Keyboard Shortcuts

### File Operations
| Shortcut | Action |
|----------|--------|
| **Ctrl+N** | New Project |
| **Ctrl+O** | Open Project |
| **Ctrl+S** | Save |
| **Ctrl+Shift+S** | Save All |

### Editing
| Shortcut | Action |
|----------|--------|
| **Ctrl+Z** | Undo |
| **Ctrl+Y** | Redo |
| **Ctrl+X** | Cut |
| **Ctrl+C** | Copy |
| **Ctrl+V** | Paste |
| **Ctrl+A** | Select All |
| **Del** | Delete |

### Search & Find
| Shortcut | Action |
|----------|--------|
| **Ctrl+F** | Find/Replace |
| **Ctrl+H** | Replace |
| **F3** | Find Next |
| **Shift+F3** | Find Previous |

### View & Display
| Shortcut | Action |
|----------|--------|
| **Ctrl++** | Zoom In |
| **Ctrl+-** | Zoom Out |
| **Ctrl+0** | Reset Zoom |
| **F11** | Fullscreen |

### Build & Compile
| Shortcut | Action |
|----------|--------|
| **Ctrl+B** | Build All |
| **Ctrl+Shift+A** | Build Assets |
| **Ctrl+Shift+R** | Build ROM |

### Panel Navigation
| Shortcut | Action |
|----------|--------|
| **Ctrl+1** | Emulator |
| **Ctrl+2** | Tiles Editor |
| **Ctrl+3** | Maps Editor |
| **Ctrl+4** | Strings Editor |
| **Ctrl+5** | Tables Editor |
| **Ctrl+6** | Source Code |
| **Ctrl+7** | Build Output |

---

## 🖱️ Right-Click Context Menus

### In Sidebar (Files/Assets)
```
Right-Click on file
├─ Open
├─ Rename...
├─ Duplicate
├─ Export As... (PNG, C Array, Binary)
├─ Properties
└─ Delete
```

### In Editor Tabs
```
Right-Click on tab
├─ Close Tab
├─ Close Others
├─ Reload
└─ Float Panel
```

### In Text Editors
```
Right-Click in text area
├─ Cut (Ctrl+X)
├─ Copy (Ctrl+C)
├─ Paste (Ctrl+V)
├─ Find (Ctrl+F)
├─ Select All (Ctrl+A)
├─ Comment Line
└─ Format
```

### On Canvas (Tile/Map Editors)
```
Right-Click on canvas
├─ Zoom In
├─ Zoom Out
├─ Show Grid
├─ Export as PNG
└─ Eyedropper Tool
```

---

## 📂 Drag & Drop Support

### What You Can Drag

| File Type | Drag To | Action |
|-----------|---------|--------|
| **PNG/BMP/GIF** | Tiles Panel | Import tile graphics |
| **.tilemap/.map** | Maps Panel | Import tilemap data |
| **.c/.h** | Source Panel | Import source code |
| **.chr** | Any Panel | Import NES tile data |
| **.gb/.gbc/.gba** | Emulator | Load ROM file |

### How to Drag & Drop
1. Open file explorer
2. Find file on disk
3. Drag file over IDE window
4. Drop zone highlights in green
5. Release to upload
6. Panel auto-switches to show result

---

## 💾 Project Management

### Create New Project
```
Ctrl+N
  ↓
Enter project name
  ↓
Select platform (GB, GBC, GBA, etc.)
  ↓
Click Create
  ✓ Project created and ready to edit
```

### Save Project
```
• Press Ctrl+S for quick save
• Auto-saves every 5 minutes (automatic)
• See notification in top-right corner
• Green checkmark = successfully saved
```

### Export Project
```
Ctrl+S → Right-click project → Export
  ↓
Downloads as .egp file
  ✓ File ready for backup or sharing
```

### Open Recent Project
```
Ctrl+O
  ↓
Click dropdown labeled "Recent"
  ↓
Select project from list
  ✓ Project loads instantly
```

---

## 🔄 Undo / Redo

| Action | Shortcut | Menu |
|--------|----------|------|
| Undo | **Ctrl+Z** | Edit → Undo |
| Redo | **Ctrl+Y** | Edit → Redo |

**Features**:
- ✓ Works in all editors (tiles, maps, strings, etc.)
- ✓ 100 undo levels per editor
- ✓ Shows "Undo: [description]" in menu
- ✓ Independent per editor (no cross-contamination)

---

## 🔍 Find & Replace

### Quick Find
```
Ctrl+F
  ↓
Type search term
  ↓
Press Enter or click "Find Next"
  ✓ First match highlighted in green
```

### Case-Sensitive Search
```
Open Find & Replace (Ctrl+F)
  ↓
Check "Case Sensitive" checkbox
  ↓
Type search term
  ✓ Only exact case matches found
```

### Regular Expression (Regex) Search
```
Open Find & Replace (Ctrl+F)
  ↓
Check "Use Regex" checkbox
  ↓
Type regex pattern (e.g., "[0-9]+")
  ✓ Matches pattern instead of literal text
```

### Replace All
```
Open Find & Replace (Ctrl+F)
  ↓
Type search term in first field
  ↓
Type replacement in second field
  ↓
Click "Replace All"
  ✓ All instances replaced instantly
```

---

## 🔔 Notifications

### Types of Notifications

| Type | Icon | Color | Meaning |
|------|------|-------|---------|
| **Info** | ℹ️ | Blue | Status message |
| **Success** | ✅ | Green | Action completed |
| **Warning** | ⚠️ | Yellow | Caution needed |
| **Error** | ❌ | Red | Something failed |

### Notification Behavior
- Appears in **top-right corner**
- Auto-dismisses after 3-5 seconds
- Click to dismiss early
- Multiple notifications stack

---

## 📋 Clipboard Operations

### Copy Text
```
1. Select text in editor
2. Press Ctrl+C
3. Notification shows "Copied"
→ Ready to paste elsewhere
```

### Cut Text
```
1. Select text in editor
2. Press Ctrl+X
3. Text disappears from editor
4. Now paste in another location
```

### Paste Text
```
1. Click where you want to paste
2. Press Ctrl+V
3. Text appears
```

### Paste from System Clipboard
```
1. Copy text in external program (Word, Notepad, etc.)
2. Switch back to IDE
3. Click in IDE and press Ctrl+V
→ System text pastes into IDE
```

---

## 🎯 Menu Structure

### File Menu
- New Project (Ctrl+N)
- Open Project (Ctrl+O)
- Save (Ctrl+S)
- Save All (Ctrl+Shift+S)
- Import → ROM/Tiles/Maps/Strings/Tables
- Export → ROM/Tiles/Maps/Assets
- Recent Projects →
- Exit

### Edit Menu
- Undo (Ctrl+Z)
- Redo (Ctrl+Y)
- Cut (Ctrl+X)
- Copy (Ctrl+C)
- Paste (Ctrl+V)
- Delete
- Select All (Ctrl+A)
- Find (Ctrl+F)
- Replace (Ctrl+H)

### View Menu
- Zoom In (Ctrl++)
- Zoom Out (Ctrl+-)
- Reset Zoom (Ctrl+0)
- Fullscreen (F11)
- Toggle Sidebar
- Toggle Status Bar

### Build Menu
- Build Assets (Ctrl+Shift+A)
- Build ROM (Ctrl+Shift+R)
- Build All (Ctrl+B)
- Clean Build
- Rebuild
- Target → GB / GBC / GBA / NDS / N64 / Switch / PS / Xbox / PC / Mobile

### Help Menu
- About
- Keyboard Shortcuts
- Documentation
- Feedback

---

## 🛠️ Tools & Features

### Available Tools

**Hardware Viewers**:
- Memory Viewer - See CPU memory contents
- Register Inspector - View CPU registers
- VRAM Viewer - See graphics memory
- OAM Viewer - See sprite objects
- Tile Data Viewer - View tile graphics
- BG Map Viewer - See background maps

**Audio Tools**:
- CH1 Editor - Square + Sweep channel
- CH2 Editor - Square channel
- CH3 Editor - Wave channel
- CH4 Editor - Noise channel
- Music Composer - Create melodies
- SFX Editor - Create sound effects

**Converters**:
- Tile Converter - PNG ↔ 2BPP binary
- CHR Converter - NES tile format
- Color Palette Tool - Manage colors
- Sprite Animator - Create sprite animations

**ROM Tools**:
- ROM Header Editor - Modify game info
- Bank Manager - Manage ROM banks
- ROM Size Calculator - Plan capacity
- Checksum Validator - Verify ROM integrity

**Engine Tools**:
- Scene Manager - Manage game scenes
- Entity Editor - Create game objects
- Collision Editor - Set up collisions
- Dialog Tree Editor - Create conversations

---

## 🔧 Common Tasks

### Import a PNG Sprite Sheet
```
Method 1: Drag & Drop
1. Drag .png file from desktop
2. Drop onto Tiles panel
3. File imports automatically

Method 2: Menu
1. Click File → Import → Tiles
2. Select .png file
3. Click Open
```

### Create a Tilemap
```
1. Click Maps tab
2. Select or create new tilemap
3. Click and drag tiles onto canvas
4. Use right-click → Fill Tool for large areas
5. Save project (Ctrl+S)
```

### Search for Text Across Project
```
1. Press Ctrl+F to open Find & Replace
2. Type search term (e.g., "dragon")
3. Select scope: "All Files"
4. Click "Find All"
5. Click result to jump to location
```

### Undo Last 3 Changes
```
1. Press Ctrl+Z
2. Press Ctrl+Z again
3. Press Ctrl+Z once more
→ 3 most recent changes undone
→ Press Ctrl+Y to redo if needed
```

### Enable Auto-Save
```
1. File is auto-saved automatically ✓
2. Saves happen every 5 minutes
3. Check top-right for "Project saved" notification
4. You don't need to do anything!
```

---

## ⚡ Pro Tips

### Speed Tips
- Use **keyboard shortcuts** for everything (no mouse!)
- Press **Ctrl+2-5** to quickly switch between editors
- Right-click for **context menus** (faster than top menu)
- Press **Ctrl+F** then type to search instantly

### Workflow Tips
- **Auto-save is on** - focus on editing, not saving
- **Undo frequently** - experiment without fear
- **Use search** to find strings/code quickly
- **Drag files** instead of using menus

### Performance Tips
- Close unused panels to free memory
- Build Assets separately before Build ROM
- Clear old history if feeling slow (rare)
- Use Recent Projects for quick access

### Help Tips
- **Ctrl+?** to see keyboard shortcuts reference
- **Right-click** to see available actions
- **Hover over buttons** for tooltips
- **Check top-right** for status notifications

---

## 🆘 Troubleshooting

### Shortcut Not Working
```
✓ Make sure you're not in text input mode
✓ Try different key combination
✓ Check if shortcut is reassigned
✓ Refresh browser (F5)
```

### Can't Find Menu Item
```
✓ Use keyboard shortcut instead (faster)
✓ Right-click to see context menu
✓ Check Help → Keyboard Shortcuts
✓ Try different menu (Edit vs View vs Build)
```

### Changes Not Showing
```
✓ Wait for auto-save notification (3-5s)
✓ Manually save with Ctrl+S
✓ Switch to different panel, then back
✓ Refresh browser
```

### Notification Spam
```
✓ Normal - notifications auto-dismiss
✓ Click any notification to close it
✓ Multiple actions generate multiple notifications
```

### Forgot Recent Project
```
✓ Press Ctrl+O to open projects list
✓ Scroll through recent projects
✓ Or manually navigate to saved files
```

---

## 📱 Browser Support

**Best Experience**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**Features**:
- Drag & drop works best in Chrome/Edge
- System clipboard sync requires permissions
- Mobile: Limited support (desktop recommended)

---

## 🔗 Important Links

- **Web IDE**: http://localhost:5000
- **Complete Guides**: Check documentation folder
- **API Reference**: API_INTEGRATION_GUIDE.md
- **Testing Guide**: FEATURE_TESTING_GUIDE.md
- **Features Overview**: NEW_FEATURES_GUIDE.md

---

## 🆕 New Features at a Glance

| Feature | How to Use | Benefit |
|---------|-----------|---------|
| **Auto-Save** | Works automatically | Never lose work |
| **Undo/Redo** | Ctrl+Z / Ctrl+Y | Experiment safely |
| **Search** | Ctrl+F | Find things fast |
| **Shortcuts** | Ctrl+anything | Speed up workflow |
| **Drag & Drop** | Drag file to panel | Quick imports |
| **Context Menus** | Right-click | Intuitive actions |
| **Notifications** | Top-right corner | Know what's happening |
| **Clipboard** | Ctrl+C/V | Copy between apps |

---

## 💡 Quick Tasks Cheat Sheet

```
New Project      → Ctrl+N
Save Project     → Ctrl+S
Undo             → Ctrl+Z
Find Text        → Ctrl+F
Replace Text     → Ctrl+H
Zoom In          → Ctrl++
Build All        → Ctrl+B
Switch to Tiles  → Ctrl+2
Fullscreen       → F11
```

---

## 📞 Getting Help

1. **Read the Guides** (110+ pages of documentation)
   - NEW_FEATURES_GUIDE.md
   - FEATURE_TESTING_GUIDE.md
   - API_INTEGRATION_GUIDE.md

2. **Check Browser Console** (Press F12)
   - Shows detailed error messages
   - Red = Error (help needed)
   - Yellow = Warning (be careful)
   - Blue = Info (status message)

3. **Verify Online**
   - Open http://localhost:5000
   - Check if web server is running
   - Try refreshing page (Ctrl+R)

4. **Try Fixes**
   - Close and reopen window
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Check documentation

---

## ✅ Checklist: First Time Setup

- [ ] Open http://localhost:5000
- [ ] Create new project (Ctrl+N)
- [ ] Name it "Practice"
- [ ] Select "Game Boy Color"
- [ ] Click Create
- [ ] Click Strings tab (Ctrl+4)
- [ ] Type in a string
- [ ] Press Ctrl+S to save
- [ ] Press Ctrl+Z to undo
- [ ] Press Ctrl+Y to redo
- [ ] Press Ctrl+F to search
- [ ] Right-click in editor
- [ ] Hover over panels
- [ ] ✅ You're ready!

---

## 🎊 You're All Set!

Print this card, keep it handy, and start building! 

Remember: **Everything is automatically saved every 5 minutes.**

---

**Questions?** Check the full documentation in the project folder.  
**Need help?** Press F12 to open DevTools and check the console.  
**Ready to start?** Open http://localhost:5000 now!

**Happy Game Development! 🎮**
