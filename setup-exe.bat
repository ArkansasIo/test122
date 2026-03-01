@echo off
REM Setup script to build compile.exe
REM Uses @yao-pkg/pkg (maintained fork with Node 18+ support)

title Labyrinth of the Dragon - EXE Build Setup

echo [INFO] Building compile.exe...
echo [INFO] This may take a few minutes...
echo.

call npm run build-exe

if errorlevel 1 (
    echo [ERROR] Failed to build exe
    echo [INFO] Try running manually:
    echo   npx -y @yao-pkg/pkg@5.11.5 compile-cli.js --output compile.exe --targets node18-win-x64
    pause
    exit /b 1
)

echo.
echo [SUCCESS] compile.exe created successfully!
echo.
echo [INFO] File size: ~42MB (includes Node.js runtime)
echo [INFO] You can now use:
echo   compile.exe all       - Build everything
echo   compile.exe ts        - TypeScript only
echo   compile.exe watch     - Watch mode
echo   compile.exe clean     - Clean artifacts
echo.
pause
