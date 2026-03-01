@echo off
REM Labyrinth of the Dragon - Compile Wrapper
REM Usage: compile.bat [all|ts|clean|watch]

setlocal enabledelayedexpansion
set TARGET=%1
if "%TARGET%"=="" set TARGET=all

echo [INFO] Labyrinth of the Dragon Build System
echo [INFO] Target: %TARGET%
echo.

REM Check for npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm not found. Please install Node.js
    exit /b 1
)

REM Check for package.json
if not exist "package.json" (
    echo [ERROR] package.json not found. Run from project root
    exit /b 1
)

REM Ensure node_modules
if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
)

REM Build targets
if "%TARGET%"=="all" (
    echo [INFO] Building all targets...
    echo [INFO] Compiling TypeScript...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Build failed
        exit /b 1
    )
    echo [SUCCESS] TypeScript compiled
    echo [SUCCESS] Build complete!
    echo [SUCCESS] Outputs in ./dist and ./obj
) else if "%TARGET%"=="ts" (
    echo [INFO] Compiling TypeScript only...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] TypeScript compilation failed
        exit /b 1
    )
    echo [SUCCESS] TypeScript compiled to ./dist
) else if "%TARGET%"=="watch" (
    echo [INFO] Starting watch mode...
    call npm run build:watch
) else if "%TARGET%"=="clean" (
    echo [INFO] Cleaning build artifacts...
    call npm run clean
    if errorlevel 1 (
        echo [ERROR] Clean failed
        exit /b 1
    )
    echo [SUCCESS] Clean complete
) else if "%TARGET%"=="web" (
    echo [INFO] Starting web development server...
    echo [INFO] Web IDE will be available at http://localhost:5000
    echo [INFO] Press Ctrl+C to stop the server
    echo.
    call npm run web
) else (
    echo [ERROR] Unknown target: %TARGET%
    echo [INFO] Valid targets: all, ts, clean, watch, web
    exit /b 1
)

echo [SUCCESS] Compilation finished successfully!
exit /b 0
