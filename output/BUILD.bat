@echo off
REM Labyrinth of the Dragon - Build Executable Wrapper
REM This wrapper runs the compile.exe from the output/bin folder

setlocal enabledelayedexpansion
set "scriptDir=%~dp0"
set "exePath=%scriptDir%bin\compile.exe"

if not exist "%exePath%" (
    echo Error: compile.exe not found at %exePath%
    echo Run from project root: npm run build-exe
    exit /b 1
)

"%exePath%" %*
exit /b %ERRORLEVEL%
