# Labyrinth of the Dragon - Build Output & Executable Distribution

## Executable Options Created

### **Option 1: Batch Wrapper (Recommended) ✅**
**File:** `compile.exe.bat`

Works immediately without any dependencies. Use like:
```batch
compile.exe.bat all
compile.exe.bat ts
compile.exe.bat watch
```

Or rename to `compile.exe` and use:
```batch
compile all
compile ts
```

### **Option 2: PowerShell Wrapper ✅**
**File:** `compile.exe.ps1`

Alternative for PowerShell users:
```powershell
.\compile.exe.ps1 all
.\compile.exe.ps1 watch
```

### **Option 3: Direct Node CLI ✅**
**File:** `compile-cli.js`

Use directly with Node:
```bash
node compile-cli.js all
node compile-cli.js ts
```

---

## Building a True .exe (Advanced)

The pkg tool has limitations with Node 24. When Node 20/18 support is added to pkg, use:

```bash
# After Node 20 becomes available in pkg
npm run build-exe
```

Or manually:
```bash
npx pkg compile-cli.js --output compile.exe --targets win32-x64 --node-version 20
```

---

## Quick Start

**Simplest approach:**
1. Copy `compile.exe.bat` to your PATH
2. Rename it to `compile.exe` or keep as `compile.exe.bat`
3. Use from anywhere: `compile all`

**Immediate usage:**
```batch
D:\New folder (4)\LabyrinthOfTheDragon\LabyrinthOfTheDragon> compile.exe.bat all
```

---

## Distribution

### For Users (Simple)
- Include `compile.exe.bat` + `compile-cli.js` + `package.json`
- Users run: `compile.exe.bat all`

### For Distribution (Cleaner)
1. Rename `compile.exe.bat` to `compile.exe`
2. Move to a `/bin` folder
3. Users can add to PATH

### For Single-File Distribution
Wait for pkg Node 24 support, then:
```bash
npm run build-exe  # Creates standalone compile.exe
```

---

## Files Created

| File | Type | Purpose |
|------|------|---------|
| `compile.exe.bat` | Batch | Windows executable wrapper ✅ |
| `compile.exe.ps1` | PowerShell | PowerShell wrapper ✅ |
| `compile-cli.js` | Node.js | Core CLI tool ✅ |
| `compile.js` | Node.js | Simple entry point ✅ |
| `compile.bat` | Batch | Alternative batch wrapper ✅ |
| `compile.ps1` | PowerShell | Alternative PS wrapper ✅ |

---

## Usage Examples

### From anywhere on Windows
```batch
compile.exe.bat all       # Full build
compile.exe.bat ts        # TypeScript only
compile.exe.bat watch     # Watch mode
compile.exe.bat clean     # Clean build
compile.exe.bat dev       # Development
```

### From project directory
```batch
D:\LabyrinthOfTheDragon> .\compile.exe.bat all
[INFO] Building all targets...
[INFO] Compiling TypeScript...
[SUCCESS] TypeScript compiled to ./dist
```

### Using Node directly
```bash
node compile-cli.js all
node compile-cli.js watch
```

### Using npm
```bash
npm run build          # TypeScript
npm run build:watch    # Watch mode
npm run clean          # Clean
```

---

## Status

✅ **Batch Wrapper Ready**
✅ **PowerShell Wrapper Ready**
✅ **Node CLI Tool Ready**
✅ **VS Code Tasks Ready**
✅ **npm Scripts Ready**

⏳ **True .exe Build** - Pending pkg Node 24 support

---

## Next Steps

1. **Immediate Use:** Run `.\compile.exe.bat all` to build
2. **Distribution:** Copy `compile.exe.bat` with your project
3. **Automation:** Add to PATH for system-wide usage
4. **Wait for pkg:** When Node 24 is supported, run `npm run build-exe`

---

## Troubleshooting

**"compile.exe not found"**
- Use `compile.exe.bat` instead 
- Or rename `compile.exe.bat` to `compile.exe`

**"Node not found"**
- Install Node.js from https://nodejs.org/
- Add Node to PATH

**"Permission denied"**
- Run as Administrator
- Or use PowerShell with proper execution policy

---

**Build System Status:** ✅ FULLY FUNCTIONAL

Choose any of the 3 working options above to start building immediately!
