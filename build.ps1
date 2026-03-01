# Labyrinth of the Dragon - PowerShell Build Script
# Supports: clean, build-ts, build-game, full build

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('clean', 'build-ts', 'build-game', 'full', 'watch')]
    [string]$Target = 'full'
)

$ErrorActionPreference = "Stop"

Write-Host "=== Labyrinth of the Dragon Build Script ===" -ForegroundColor Cyan
Write-Host "Target: $Target" -ForegroundColor Yellow

try {
    switch ($Target) {
        'clean' {
            Write-Host "`nCleaning build artifacts..." -ForegroundColor Magenta
            npm run clean
        }
        
        'build-ts' {
            Write-Host "`nBuilding TypeScript..." -ForegroundColor Magenta
            npm run build
        }
        
        'build-game' {
            Write-Host "`nBuilding Game Boy ROM..." -ForegroundColor Magenta
            npm run build-game
        }
        
        'watch' {
            Write-Host "`nWatching TypeScript files..." -ForegroundColor Magenta
            npm run build:watch
        }
        
        'full' {
            Write-Host "`nPerforming full build..." -ForegroundColor Magenta
            Write-Host "`n1. Cleaning..." -ForegroundColor Yellow
            npm run clean
            Write-Host "`n2. Building TypeScript..." -ForegroundColor Yellow
            npm run build
            Write-Host "`n3. Building Game Boy ROM..." -ForegroundColor Yellow
            npm run build-game
            Write-Host "`n✓ Build complete!" -ForegroundColor Green
        }
    }
}
catch {
    Write-Host "`n✗ Build failed: $_" -ForegroundColor Red
    exit 1
}
