# compile.exe - Labyrinth of the Dragon Build Tool

## ✅ Successfully Compiled

**File:** `compile.exe`  
**Size:** ~42.5 MB (includes Node.js v18 runtime)  
**Created:** March 1, 2026  
**Status:** ✅ Fully functional and tested

---

## 🚀 Quick Start

```batch
# Full build (TypeScript + assets)
compile.exe all

# TypeScript compilation only
compile.exe ts

# Watch mode (auto-rebuild on changes)
compile.exe watch

# Clean build artifacts
compile.exe clean
```

---

## 📋 All Available Commands

| Command | Description |
|---------|-------------|
| `compile.exe all` | Build everything (default) |
| `compile.exe ts` | Compile TypeScript only |
| `compile.exe watch` | Watch mode - auto-rebuild on file changes |
| `compile.exe clean` | Remove all build artifacts |
| `compile.exe dev` | Run in development mode |
| `compile.exe start` | Build and start the application |
| `compile.exe format` | Auto-format code with Prettier |
| `compile.exe lint` | Check code quality with ESLint |

---

## ✅ Test Results

All tests passed successfully:

- ✅ **compile.exe ts** - TypeScript compilation working
- ✅ **compile.exe all** - Full build working
- ✅ **compile.exe clean** - Artifact cleanup working

---

## 📦 Distribution

This is a **standalone executable** that can be distributed without Node.js installed on the target machine.

### What's Included
- Node.js v18 runtime (embedded)
- Complete build tool CLI
- No external dependencies required

### Distribution Options

**Option 1: Include with project**
- Keep `compile.exe` in project root
- Users run: `compile.exe all`

**Option 2: System-wide installation**
1. Copy `compile.exe` to `C:\Program Files\LabyrinthOfTheDragon\`
2. Add folder to system PATH
3. Run from anywhere: `compile all`

**Option 3: Developer tools folder**
- Move to `C:\Tools\` or similar
- Add to PATH
- Available globally

---

## 🔧 Rebuilding the Exe

To rebuild `compile.exe` from source:

```batch
# Simple method
setup-exe.bat

# Or manually
npm run build-exe

# Or directly
npx -y @yao-pkg/pkg@5.11.5 compile-cli.js --output compile.exe --targets node18-win-x64
```

---

## 📝 Technical Details

- **Tool:** @yao-pkg/pkg v5.11.5 (maintained fork of pkg)
- **Node Version:** 18.19.1
- **Platform:** Windows x64
- **Architecture:** Standalone single-file executable
- **File Format:** Win32 PE executable

---

## 🎯 Features

- ✅ Zero dependencies - runs standalone
- ✅ Fast compilation - incremental TypeScript builds
- ✅ Colored output for better readability
- ✅ Proper error handling and reporting
- ✅ Supports all npm script targets
- ✅ Cross-compatible with other build methods

---

## 🔄 Alternative Build Methods

While `compile.exe` is the simplest option, you can also use:

1. **npm scripts:** `npm run build`, `npm run clean`
2. **Batch file:** `compile.bat all`
3. **PowerShell:** `.\compile.ps1 -Target all`
4. **VS Code:** Press `Ctrl+Shift+B`
5. **Direct Node:** `node compile-cli.js all`

All methods produce identical results.

---

## 📄 Output

Successful builds create:

- `dist/` - Compiled JavaScript and type definitions
- `dist/**/*.js` - Compiled JavaScript files
- `dist/**/*.d.ts` - TypeScript declaration files
- `dist/**/*.map` - Source maps for debugging

---

## 🐛 Troubleshooting

**"compile.exe is not recognized"**
- Ensure you're in the correct directory
- Or add the folder to your PATH

**Build fails with errors**
- Run `compile.exe clean` first
- Then try `compile.exe all` again

**"Access denied" or permission errors**
- Run Command Prompt as Administrator
- Or check antivirus isn't blocking the exe

**Exe doesn't start**
- Ensure Windows Defender isn't blocking it
- Check that the file wasn't corrupted during transfer

---

## 💡 Tips

1. **First-time build:** May take longer (npm installs dependencies)
2. **Incremental builds:** Subsequent builds are much faster
3. **Watch mode:** Best for active development
4. **Clean builds:** Run `clean` if you encounter strange errors

---

## 📞 Support

For more information, see:
- `COMPILE_GUIDE.md` - Detailed compilation guide
- `BUILD_OUTPUT.md` - Build system documentation
- `package.json` - All available npm scripts

---

**Build System Status:** ✅ OPERATIONAL  
**Last Tested:** March 1, 2026  
**Version:** 1.0.0
