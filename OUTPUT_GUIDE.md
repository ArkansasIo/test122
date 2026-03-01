# Output Folder Structure Guide

## Overview

All build outputs are now organized in the `output/` folder with the following structure:

```
output/
├── bin/                 Compiled executables
│   ├── compile.exe      Build tool (main executable)
│   └── BUILD.bat        Batch wrapper for building
├── builds/              Game ROM files
│   ├── LabyrinthOfTheDragon.gbc
│   └── *.gbc (other builds)
├── dist/                Compiled TypeScript & JavaScript
│   ├── index.js
│   ├── index.d.ts
│   └── *.js files
├── obj/                 Object files & intermediates
│   ├── game.gbc
│   ├── *.asm (assembly listings)
│   └── *.lst (listing files)
├── docs/                Documentation
│   ├── FEATURE_TESTING_GUIDE.md
│   ├── API_INTEGRATION_GUIDE.md
│   ├── NEW_FEATURES_GUIDE.md
│   └── ...
├── source/              Archived source code
│   ├── ts/ (TypeScript sources)
│   ├── c/ (C sources)
│   └── js/ (JavaScript sources)
└── README.md            This folder's guide

```

## Folder Purposes

### `bin/` - Executables
Contains compiled executables and build tools:
- **compile.exe** - Main build tool (generated via `npm run build-exe`)
- **BUILD.bat** - Convenient batch wrapper to run builds

**Usage:**
```powershell
cd output
.\BUILD.bat all                    # Build everything
.\BUILD.bat clean                  # Clean build
.\bin\compile.exe game             # Build just the game
```

### `builds/` - Game ROMs
Contains compiled Game Boy ROM files:
- **LabyrinthOfTheDragon.gbc** - Main game ROM file
- Other `.gbc` or `.gb` files from different builds

**These are the actual playable games** that can be:
- Run in Game Boy emulators
- Shared with others
- Tested on real GB/GBC hardware

### `dist/` - Compiled JavaScript
Contains TypeScript compilation output:
- All compiled `.js` files
- Type definitions (`.d.ts`)
- Source maps (optional)

**Used by:** Node.js scripts, CLI tools, build process

### `obj/` - Object Files
Intermediate compilation artifacts:
- **Assembly listings** (`.asm`) - Generated from C source
- **Listing files** (`.lst`) - Compiler output with debug info
- **Object files** - Intermediate game builds

**These are technical files** for debugging the C compilation process.

### `docs/` - Documentation
Auto-copied documentation:
- Feature guides
- API references
- Testing guides
- Implementation notes

**Keep these with your builds** for reference.

### `source/` - Source Archive
Optional archive of source code organized by type:
- TypeScript sources
- C sources
- JavaScript sources

**For backup/reference purposes.**

## Quick Start Commands

### From Project Root

```powershell
# Build everything and organize output
npm run setup-output
npm run build-exe
.\compile.exe all

# Organize files into output folder
.\compile.exe all
```

### From Output Folder

```powershell
cd output
.\BUILD.bat all          # Build all targets
.\BUILD.bat clean        # Clean build
.\bin\compile.exe game   # Build game only
.\bin\compile.exe web    # Start web IDE
```

## Building Workflow

### Step 1: Initial Setup
```powershell
npm install
npm run setup-output
```

### Step 2: Build Executable
```powershell
npm run build-exe
```
This creates `compile.exe` and copies it to `output/bin/`.

### Step 3: Compile Project
```powershell
cd output
.\BUILD.bat all
```

This generates:
- Game ROM → `output/builds/*.gbc`
- Compiled JS → `output/dist/*.js`
- Object files → `output/obj/*.asm`

### Step 4: Test & Play
- Find your ROM in `output/builds/`
- Run in emulator
- Or test via web IDE: `npm run web`

## Output Files Explained

### After Building

| File | Location | Purpose |
|------|----------|---------|
| compile.exe | `bin/` | Main build tool |
| LabyrinthOfTheDragon.gbc | `builds/` | **Game ROM - play this!** |
| *.asm | `obj/` | Assembly code (reference) |
| *.lst | `obj/` | Compiler listings (debug) |
| index.js | `dist/` | Compiled CLI tool |
| *.md | `docs/` | Documentation |

## Development Workflow

### Daily Development
```powershell
# Start in dev mode (auto-rebuild)
npm run dev

# In another terminal, start web IDE
npm run web

# Access at http://localhost:5000
```

### When Ready to Build
```powershell
# Build everything
npm run build-exe
.\output\bin\compile.exe all

# Find your ROM in output/builds/
```

### Distribution
Copy these to distribute:
- `output/builds/*.gbc` - The games
- `output/docs/*.md` - Documentation
- `output/bin/compile.exe` - Let others build

## Automation

### Clean Everything
```powershell
npm run clean
# Removes: dist/, obj/, *.gbc, output/
```

### Rebuild
```powershell
npm run clean
npm run build-exe
.\compile.exe all
```

### Setup Multiple Times (Safe)
```powershell
npm run setup-output
# Just creates folders if they don't exist, doesn't overwrite
```

## Troubleshooting

### "compile.exe not found"
```powershell
# Rebuild it
npm run build-exe
```

### "No ROM generated"
```powershell
# Check if build succeeded
cd output
.\BUILD.bat all

# Look for .gbc files in output/builds/
dir builds /b
```

### "Files not organized"
```powershell
# The compile-cli.js auto-organizes, but manual copy:
npm run setup-output
```

## Tips & Tricks

1. **Add output/bin to PATH** - Then run `compile.exe` from anywhere
2. **Batch processing** - Use `BUILD.bat` in scripts
3. **Keep backups** - Copy successful ROMs to a backup folder
4. **Document builds** - Create timestamped copies of important ROMs
5. **Archive old builds** - Move old `.gbc` files to `builds/archived/`

## Advanced: Custom Output

To customize where files go, edit:
- `compile-cli.js` - Modify `organizeOutput()` function
- `setup-output.js` - Add new folders to `structure` object
- `package.json` - Adjust `clean` script if needed

## Support

For issues with the build system:
1. Check `output/README.md`
2. Review build output for errors
3. Run `npm run clean` then rebuild
4. Check project documentation in `output/docs/`
