# Labyrinth of the Dragon - Build Script
# Compiles TypeScript, assets, and Game Boy ROM

param(
    [ValidateSet("all", "ts", "clean", "watch")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

function Write-Info {
    Write-Host "[INFO]" -ForegroundColor Cyan -NoNewline
    Write-Host " $args"
}

function Write-ErrorLog {
    Write-Host "[ERROR]" -ForegroundColor Red -NoNewline
    Write-Host " $args"
}

function Write-Success {
    Write-Host "[SUCCESS]" -ForegroundColor Green -NoNewline
    Write-Host " $args"
}

try {
    # Check dependencies
    Write-Info "Checking dependencies..."
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-ErrorLog "npm not found. Please install Node.js"
        exit 1
    }

    if (-not (Test-Path "package.json")) {
        Write-ErrorLog "package.json not found. Run from project root"
        exit 1
    }

    # Ensure dependencies are installed
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installing npm dependencies..."
        npm install
    }

    switch ($Target) {
        "all" {
            Write-Info "Building all targets..."
            
            Write-Info "Compiling TypeScript..."
            npm run build
            Write-Success "TypeScript compiled"
            
            Write-Info "Build complete!"
            Write-Success "Outputs in ./dist and ./obj"
        }
        
        "ts" {
            Write-Info "Compiling TypeScript only..."
            npm run build
            Write-Success "TypeScript compiled to ./dist"
        }
        
        "watch" {
            Write-Info "Starting watch mode..."
            npm run build:watch
        }
        
        "clean" {
            Write-Info "Cleaning build artifacts..."
            npm run clean
            Write-Success "Clean complete"
        }
        
        "web" {
            Write-Info "Starting web development server..."
            Write-Info "Web IDE will be available at http://localhost:5000"
            Write-Info "Press Ctrl+C to stop the server"
            Write-Host ""
            npm run web
        }
    }
    
    Write-Success "Compilation finished successfully!"
    exit 0
}
catch {
    Write-ErrorLog "Build failed: $_"
    exit 1
}
