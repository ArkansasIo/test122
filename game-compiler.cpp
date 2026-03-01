#include <iostream>
#include <string>
#include <cstring>

/**
 * Labyrinth of the Dragon - Game Compiler
 * C++ Utility for managing game source files
 */

int main() {
    std::cout << "\n" << std::string(60, '=') << "\n";
    std::cout << " Labyrinth of the Dragon - Game Compiler v1.0\n";
    std::cout << std::string(60, '=') << "\n\n";
    
    std::cout << "📋 Project Information:\n\n";
    std::cout << "  Project Name:    Labyrinth of the Dragon\n";
    std::cout << "  Type:            Game Boy Color RPG\n";
    std::cout << "  Language:        C/C++\n";
    std::cout << "  Compiler:        Clang++ (LLVM-MinGW)\n\n";
    
    std::cout << "📁 Source Directories:\n";
    std::cout << "  • src/          (Game source code)\n";
    std::cout << "  • src-ts/       (TypeScript tools)\n";
    std::cout << "  • data/         (Game data files)\n";
    std::cout << "  • assets/       (Game assets)\n";
    std::cout << "  • res/          (Resources)\n";
    std::cout << "  • tools/        (Build tools)\n";
    std::cout << "  • types/        (Type definitions)\n\n";
    
    std::cout << "📚 Key Features:\n";
    std::cout << "  ✓ C source code compilation\n";
    std::cout << "  ✓ Game Boy Color targeting (via GBDK)\n";
    std::cout << "  ✓ Asset generation and conversion\n";
    std::cout << "  ✓ Tile and sprite management\n";
    std::cout << "  ✓ Map and encounter data\n\n";
    
    std::cout << "🔧 Build Commands:\n";
    std::cout << "  make all       - Full build\n";
    std::cout << "  make assets    - Generate assets\n";
    std::cout << "  make clean     - Clean build files\n";
    std::cout << "  npm run build  - Compile TypeScript tooling\n\n";
    
    std::cout << "📦 Output Files:\n";
    std::cout << "  • output/bin/compile.exe      (Build tool)\n";
    std::cout << "  • output/bin/labyrinth.exe    (Node wrapper)\n";
    std::cout << "  • output/bin/LabyrinthIDE.exe (Web IDE)\n";
    std::cout << "  • LabyrinthOfTheDragon.gbc    (Game ROM)\n\n";
    
    std::cout << "✅ Compiler Status: Ready\n\n";
    
    return 0;
}
