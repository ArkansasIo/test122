#!/usr/bin/env pwsh
# Labyrinth of the Dragon - ROM Build Script (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Labyrinth of the Dragon - ROM Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for GBDK
if (-not $env:GBDK_HOME) {
    Write-Host "[ERROR] GBDK_HOME not set!" -ForegroundColor Red
    Write-Host "[INFO] Please install GBDK-2020 and set GBDK_HOME environment variable" -ForegroundColor Yellow
    Write-Host "[INFO] Download from: https://github.com/gbdk-2020/gbdk-2020/releases" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] GBDK Location: $env:GBDK_HOME" -ForegroundColor Green
Write-Host "[INFO] Building ROM..." -ForegroundColor Cyan
Write-Host ""

# Build using Makefile
try {
    & make clean
    & make all
    
    if ($LASTEXITCODE -ne 0) {
        throw "Make command failed"
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] ROM built successfully!" -ForegroundColor Green
    Write-Host "[INFO] Output: LabyrinthOfTheDragon.gbc" -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "LabyrinthOfTheDragon.gbc") {
        $fileSize = (Get-Item "LabyrinthOfTheDragon.gbc").Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        Write-Host "[INFO] ROM Size: $fileSizeKB KB ($fileSize bytes)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "[INFO] You can now test the ROM in an emulator:" -ForegroundColor Yellow
    Write-Host "       - BGB (https://bgb.bircd.org/)" -ForegroundColor Yellow
    Write-Host "       - Emulicious (https://emulicious.net/)" -ForegroundColor Yellow
    Write-Host "       - mGBA (https://mgba.io/)" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Build failed: $_" -ForegroundColor Red
    exit 1
}
