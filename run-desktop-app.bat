@echo off
REM Quick launcher for C++ Desktop App

title Labyrinth of the Dragon - Desktop

echo Starting Labyrinth of the Dragon Desktop App...
echo.

REM Check if executable exists
if not exist "src-cpp\build\bin\Release\LabyrinthOfTheDragon_Desktop.exe" (
    echo [ERROR] Executable not found!
    echo.
    echo Please build first:
    echo   cd src-cpp
    echo   build.bat
    echo.
    pause
    exit /b 1
)

REM Set root directory
set LOD_ROOT_DIR=%~dp0
set LOD_PORT=5000

REM Navigate to executable directory  
cd src-cpp\build\bin\Release

REM Run the app
echo [INFO] Starting server on port %LOD_PORT%...
echo [INFO] Root directory: %LOD_ROOT_DIR%
echo.
LabyrinthOfTheDragon_Desktop.exe

pause
