@echo off
REM Setup dependencies for C++ Desktop App

setlocal enabledelayedexpansion

title Labyrinth of the Dragon - Setup Dependencies

echo.
echo ================================================================
echo  Setting up C++ Dependencies
echo ================================================================
echo.

REM Create external directory
if not exist "external" mkdir external
cd external

REM Download cpp-httplib
echo [1/4] Downloading cpp-httplib...
if not exist "cpp-httplib" (
    git clone --depth 1 https://github.com/yhirose/cpp-httplib.git
    if errorlevel 1 (
        echo [WARNING] Failed to clone cpp-httplib. Please download manually.
    ) else (
        echo [SUCCESS] cpp-httplib downloaded
    )
) else (
    echo [SKIP] cpp-httplib already exists
)

REM Download nlohmann/json
echo [2/4] Downloading nlohmann/json...
if not exist "json" (
    git clone --depth 1 https://github.com/nlohmann/json.git
    if errorlevel 1 (
        echo [WARNING] Failed to clone nlohmann/json. Please download manually.
    ) else (
        echo [SUCCESS] nlohmann/json downloaded
    )
) else (
    echo [SKIP] nlohmann/json already exists
)

REM Download WIL (Windows Implementation Library)
echo [3/4] Downloading WIL...
if not exist "wil" (
    git clone --depth 1 https://github.com/microsoft/wil.git
    if errorlevel 1 (
        echo [WARNING] Failed to clone WIL. Please download manually.
    ) else (
        echo [SUCCESS] WIL downloaded
    )
) else (
    echo [SKIP] WIL already exists
)

REM Download WebView2 SDK
echo [4/4] Setting up WebView2...
echo [INFO] WebView2 SDK should be installed via NuGet or downloaded manually
echo [INFO] Visit: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
echo.

cd ..

echo.
echo ================================================================
echo  Dependency setup complete!
echo ================================================================
echo.
echo Next steps:
echo   1. Ensure WebView2 SDK is installed
echo   2. Run: build.bat
echo.
pause
