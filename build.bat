@echo off
REM Labyrinth of the Dragon - Batch Build Script
REM Usage: build.bat [clean|build-ts|build-game|full|watch]

setlocal enabledelayedexpansion

if "%1"=="" (
    set TARGET=full
) else (
    set TARGET=%1
)

echo === Labyrinth of the Dragon Build Script ===
echo Target: %TARGET%

if "%TARGET%"=="clean" (
    echo.
    echo Cleaning build artifacts...
    call npm run clean
    goto done
)

if "%TARGET%"=="build-ts" (
    echo.
    echo Building TypeScript...
    call npm run build
    goto done
)

if "%TARGET%"=="build-game" (
    echo.
    echo Building Game Boy ROM...
    call npm run build-game
    goto done
)

if "%TARGET%"=="watch" (
    echo.
    echo Watching TypeScript files...
    call npm run build:watch
    goto done
)

if "%TARGET%"=="full" (
    echo.
    echo Performing full build...
    echo.
    echo 1. Cleaning...
    call npm run clean
    if errorlevel 1 goto error
    echo.
    echo 2. Building TypeScript...
    call npm run build
    if errorlevel 1 goto error
    echo.
    echo 3. Building Game Boy ROM...
    call npm run build-game
    if errorlevel 1 goto error
    echo.
    echo Build complete!
    goto done
)

echo Unknown target: %TARGET%
echo Usage: build.bat [clean|build-ts|build-game|full|watch]
exit /b 1

:error
echo Build failed!
exit /b 1

:done
exit /b 0
