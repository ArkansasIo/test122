# ✅ Connection Refused Error - FIXED

## Problem Identified
The web app was returning **Connection Refused** or **404 errors** when accessed. The server was binding to port 5000 but unable to find and serve the HTML UI files.

## Root Cause
When the application was packaged as an executable using `pkg`, the `__dirname` and working directory detection was unreliable. The server couldn't locate the HTML files (`unreal-studio.html`, `studio.html`) needed to serve the UI.

## Solution Implemented

### 1. **Smart Path Detection** (Lines 16-32 in web-app.js)
Added intelligent ROOT_DIR detection with multiple fallbacks:
```javascript
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
```

### 2. **File Validation on Startup** (Lines 359-368 in web-app.js)
Added checks to verify required files exist before starting server:
```javascript
const keyFiles = ['unreal-studio.html', 'studio.html'];
const missingFiles = keyFiles.filter(f => !fs.existsSync(path.join(ROOT_DIR, f)));

if (missingFiles.length > 0) {
  console.error('❌ ERROR: Missing required files!');
  console.error('Missing:', missingFiles.join(', '));
  console.error('ROOT_DIR:', ROOT_DIR);
  // Helpful troubleshooting instructions...
  process.exit(1);
}
```

### 3. **Updated Package.json**
Added new build script:
```json
"build-web-exe": "npx -y @yao-pkg/pkg@5.11.5 web-app.js --output web-app.exe --targets node18-win-x64"
```

## How to Use Now

### Windows Users
```batch
REM Run from project directory
cd D:\LabyrinthOfTheDragon\LabyrinthOfTheDragon
.\web-app.exe
```

### With Environment Variable
```batch
set LOD_ROOT_DIR=D:\LabyrinthOfTheDragon\LabyrinthOfTheDragon
.\web-app.exe
```

### Through npm
```bash
npm run web
```

## Testing Results

✅ **All Tests Passed:**
- HTTP 200 OK response from root
- HTML content served correctly
- API endpoints responding
- Multiple concurrent connections working
- Browser auto-open functioning

### Test Commands
```bash
# Check server status
netstat -ano | findstr ":5000"

# Test root page
curl.exe http://localhost:5000

# Test API
curl.exe http://localhost:5000/api/health
curl.exe http://localhost:5000/api/system
```

## Files Modified
1. **web-app.js** - Added smart path detection and validation
2. **package.json** - Added build-web-exe script
3. **WEB_APP.md** - Updated documentation
4. **run-web-app.bat** - Launcher script

## Verification

The application now:
- ✅ Detects the correct ROOT_DIR automatically
- ✅ Validates files exist before starting
- ✅ Provides helpful error messages if files are missing
- ✅ Works from any directory when env var is set
- ✅ Serves all UI interfaces correctly
- ✅ API endpoints responding properly
- ✅ Handles concurrent connections

## How the Fix Works

1. **On Startup**: App checks if LOD_ROOT_DIR environment variable is set
2. **If Not Set**: Searches for required HTML files in:
   - Current working directory (most common)
   - Script directory (__dirname)
   - Parent of script directory
3. **Validates**: Confirms both unreal-studio.html and studio.html exist
4. **If Valid**: Starts server and serves files
5. **If Missing**: Shows helpful error with instructions

## Environment Variables

```bash
# Set custom project directory
set LOD_ROOT_DIR=path\to\project

# Disable auto-browser open
set LOD_AUTO_OPEN=false

# Use custom port
set LOD_PORT=8080
```

## What's Now Working

✅ Web app executable (web-app.exe)
✅ Node.js version (node web-app.js)
✅ npm scripts (npm run web)
✅ All UI interfaces
✅ API endpoints
✅ Asset management
✅ File serving
✅ Browser auto-open

## Access Points

| Interface | URL |
|-----------|-----|
| **Default (Unreal)** | http://localhost:5000 |
| **Modern Studio** | http://localhost:5000/studio |
| **Classic Tabs** | http://localhost:5000/classic |

## Status

🟢 **RESOLVED** - The connection refused error is fixed.

The web application is now fully functional with reliable path detection, proper error handling, and comprehensive validation.
