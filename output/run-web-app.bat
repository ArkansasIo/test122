@echo off
REM Labyrinth of the Dragon - Web App Launcher
REM Full application with API backend and modern UI

setlocal enabledelayedexpansion

title Labyrinth of the Dragon - Web App

echo.
echo ===================================================
echo  Dragon Studio - Web Application
echo ===================================================
echo.

REM Check if web-app.exe exists
if not exist "web-app.exe" (
    echo [ERROR] web-app.exe not found
    echo.
    echo Building web-app.exe...
    call npm run build-web-exe
    if errorlevel 1 (
        echo [ERROR] Failed to build web-app.exe
        echo.
        echo Please ensure Node.js and npm are installed.
        pause
        exit /b 1
    )
)

REM Get available port
set PORT=5000
for /L %%i in (5000,1,5010) do (
    netstat -ano | findstr ":%%i " >nul
    if errorlevel 1 (
        set PORT=%%i
        goto port_found
    )
)

:port_found
echo [INFO] Starting web server on port %PORT%...
echo [INFO] URL: http://localhost:%PORT%
echo.
echo Available Interfaces:
echo   • Unreal Style (Default): http://localhost:%PORT%/unreal
echo   • Modern Studio:          http://localhost:%PORT%/studio
echo   • Classic Tab Interface:  http://localhost:%PORT%/classic
echo.
echo API Endpoints:
echo   • Health Check:   http://localhost:%PORT%/api/health
echo   • System Info:    http://localhost:%PORT%/api/system
echo   • Tiles List:     http://localhost:%PORT%/api/tiles
echo   • Maps List:      http://localhost:%PORT%/api/maps
echo   • ROMs List:      http://localhost:%PORT%/api/roms
echo.
echo ===================================================
echo.

REM Launch web app
if %PORT% equ 5000 (
    call .\web-app.exe
) else (
    set LOD_PORT=%PORT%
    call .\web-app.exe
)

if errorlevel 1 (
    echo [ERROR] Failed to start web app
    pause
    exit /b 1
)

pause
