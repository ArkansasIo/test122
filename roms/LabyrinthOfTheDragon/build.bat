@echo off
REM Labyrinth of the Dragon - ROM Build Script
REM This script builds the Game Boy Color ROM from source

title Building Labyrinth of the Dragon ROM

echo ========================================
echo  Labyrinth of the Dragon - ROM Builder
echo ========================================
echo.

REM Check for GBDK
if not defined GBDK_HOME (
    echo [ERROR] GBDK_HOME not set!
    echo [INFO] Please install GBDK-2020 and set GBDK_HOME environment variable
    echo [INFO] Download from: https://github.com/gbdk-2020/gbdk-2020/releases
    pause
    exit /b 1
)

echo [INFO] GBDK Location: %GBDK_HOME%
echo [INFO] Building ROM...
echo.

REM Build using Makefile
make clean
make all

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] ROM built successfully!
echo [INFO] Output: LabyrinthOfTheDragon.gbc
echo.

if exist "LabyrinthOfTheDragon.gbc" (
    echo [INFO] ROM Size: 
    dir /b "LabyrinthOfTheDragon.gbc" | findstr /v "^$"
    for %%A in (LabyrinthOfTheDragon.gbc) do echo       %%~zA bytes
)

echo.
echo [INFO] You can now test the ROM in an emulator:
echo        - BGB (https://bgb.bircd.org/)
echo        - Emulicious (https://emulicious.net/)
echo        - mGBA (https://mgba.io/)
echo.
pause
