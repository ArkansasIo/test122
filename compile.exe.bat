@echo off
REM Labyrinth of the Dragon - Standalone Executable
REM This wrapper invokes the Node.js CLI tool
REM Usage: compile [target]

node "%~dp0compile-cli.js" %*
exit /b %ERRORLEVEL%
