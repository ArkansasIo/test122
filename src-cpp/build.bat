@echo off
REM Labyrinth of the Dragon - C++ Desktop App Build Script

setlocal enabledelayedexpansion

title Building Labyrinth of the Dragon Desktop App

echo.
echo ================================================================
echo  Building Labyrinth of the Dragon - C++ Desktop Application
echo ================================================================
echo.

REM Check for CMake
where cmake >nul 2>&1
if errorlevel 1 (
    echo [ERROR] CMake not found. Please install CMake from https://cmake.org/
    pause
    exit /b 1
)

REM Check for Visual Studio or MinGW
where cl >nul 2>&1
if errorlevel 1 (
    where g++ >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] No C++ compiler found
        echo Please install Visual Studio or MinGW
        pause
        exit /b 1
    ) else (
        set COMPILER=MinGW
    )
) else (
    set COMPILER=Visual Studio
)

echo [INFO] Using compiler: %COMPILER%
echo.

REM Create build directory
if not exist "build" mkdir build
cd build

REM Configure with CMake
echo [INFO] Configuring with CMake...
if "%COMPILER%"=="Visual Studio" (
    cmake .. -G "Visual Studio 17 2022" -A x64
) else (
    cmake .. -G "MinGW Makefiles"
)
if errorlevel 1 (
    echo [ERROR] CMake configuration failed
    cd ..
    pause
    exit /b 1
)

echo.
echo [INFO] Building project...
cmake --build . --config Release
if errorlevel 1 (
    echo [ERROR] Build failed
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ================================================================
echo  Build completed successfully!
echo ================================================================
echo.
echo Executable location: build\bin\Release\LabyrinthOfTheDragon_Desktop.exe
echo.
echo To run:
echo   cd build\bin\Release
echo   LabyrinthOfTheDragon_Desktop.exe
echo.
echo Or use: run-desktop-app.bat
echo.
pause
