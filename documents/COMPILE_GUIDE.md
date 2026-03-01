# Compilation Guide - Labyrinth of the Dragon

This project includes multiple compilation and build options. Choose the method that works best for your workflow.

---

## Quick Start

### **Option 1: Batch File (Simplest)**
```batch
compile.bat all      # Build everything
compile.bat ts       # TypeScript only
compile.bat watch    # Watch mode
compile.bat clean    # Clean artifacts
```

### **Option 2: PowerShell Script**
```powershell
.\compile.ps1 -Target all     # Build everything
.\compile.ps1 -Target ts      # TypeScript only
.\compile.ps1 -Target watch   # Watch mode
.\compile.ps1 -Target clean   # Clean artifacts
```

### **Option 3: Node.js CLI**
```bash
node compile-cli.js all       # Build everything
node compile-cli.js ts        # TypeScript only
node compile-cli.js watch     # Watch mode
node compile-cli.js clean     # Clean artifacts
node compile-cli.js dev       # Development mode
node compile-cli.js start     # Build and start
node compile-cli.js format    # Format code
node compile-cli.js lint      # Lint code
```

### **Option 4: npm Commands (Direct)**
```bash
npm run build                 # Compile TypeScript
npm run build:watch          # Watch mode
npm run clean                # Clean artifacts
npm run dev                  # Development mode
npm run start                # Build and run
npm run format               # Format code
npm run lint                 # Lint code
```

### **Option 5: VS Code Tasks**
Press `Ctrl+Shift+B` or go to **Terminal → Run Task**:
- Build: TypeScript (default)
- Build: All
- Build: Watch
- Clean
- Start Dev Server
- Format Code
- Lint Code

---

## Building as .exe (Windows)

Convert the Node.js CLI to a standalone .exe:

### Step 1: Install pkg globally (one-time setup)
```bash
npm install -g pkg
```

### Step 2: Build the executable
```bash
npm run build-exe
```

This creates `compile.exe` in the project root.

### Step 3: Use the .exe
```batch
compile.exe all       # Build everything
compile.exe ts        # TypeScript only
compile.exe watch     # Watch mode
compile.exe clean     # Clean artifacts
```

### Alternative: Manual exe creation
```bash
pkg compile-cli.js --output compile.exe --targets win32-x64
```

---

## TypeScript Configuration

The `tsconfig.json` has been optimized with:
- **Incremental compilation** - Only recompiles changed files
- **Build info caching** - Speeds up subsequent builds
- **Strict type checking** - Catches more errors
- **No unused locals/parameters** - Cleaner code
- **No implicit returns** - Explicit function returns

---

## Build System Differences

| Method | Speed | Ease | Automation |
|--------|-------|------|-----------|
| Batch | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| PowerShell | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Node CLI | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| npm | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| VS Code Tasks | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| .exe | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## Troubleshooting

### "npm not found"
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### "node_modules missing"
All scripts automatically install dependencies if needed.

### ".exe compilation fails"
Ensure `pkg` is installed globally:
```bash
npm install -g pkg
```

### Watch mode not triggering
- TypeScript watch mode polls for changes
- Some editors (WSL) may have file system delays
- Try saving the file again

### Permission denied (PowerShell)
Run PowerShell as Administrator, or set execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Available Build Targets

- **all** - Compiles everything (default)
- **ts** - TypeScript only
- **watch** - Continuous compilation on file changes
- **clean** - Remove build artifacts
- **dev** - Run in development mode
- **start** - Build and start
- **format** - Auto-format code (Prettier)
- **lint** - Check code quality (ESLint)

---

## Adding to PATH (Windows)

To use `compile.exe` or `compile.bat` from anywhere:

1. Copy `compile.bat` or `compile.exe` to a folder in your PATH
2. Or add this project's root to your PATH environment variable

Then use from any directory:
```batch
compile all
compile watch
```

---

## Performance Tips

1. Use **watch mode** during development:
   ```bash
   npm run build:watch
   ```

2. Use **incremental builds** - only changed files recompile

3. Regular **clean builds** when issues arise:
   ```bash
   npm run clean && npm run build
   ```

4. Use the **fast scripts** for quick builds:
   - Batch file (fastest native option)
   - Direct npm commands
   - VS Code tasks

---

## Integration with CI/CD

For GitHub Actions, GitLab CI, or other CI systems:

```yaml
# Example GitHub Actions
- name: Build TypeScript
  run: npm run build

- name: Lint Code
  run: npm run lint
```

---

For more information, see `package.json` for all available scripts.
