/**
 * Labyrinth of the Dragon - Desktop Application
 * C++ Desktop App with Embedded Web UI
 * 
 * Features:
 * - Native C++ HTTP Server
 * - Embedded WebView for UI
 * - Same API endpoints as Node.js version
 * - Cross-platform support (Windows primary)
 */

#include "server.hpp"
#include "webview.hpp"
#include <iostream>
#include <thread>
#include <string>
#include <filesystem>

namespace fs = std::filesystem;

// Configuration
struct AppConfig {
    int port = 5000;
    std::string host = "0.0.0.0";
    std::string rootDir;
    bool autoOpen = true;
};

// Get executable directory
std::string getExecutableDir() {
    #ifdef _WIN32
        char buffer[MAX_PATH];
        GetModuleFileNameA(NULL, buffer, MAX_PATH);
        std::string::size_type pos = std::string(buffer).find_last_of("\\/");
        return std::string(buffer).substr(0, pos);
    #else
        char buffer[1024];
        ssize_t len = readlink("/proc/self/exe", buffer, sizeof(buffer) - 1);
        if (len != -1) {
            buffer[len] = '\0';
            std::string path(buffer);
            return path.substr(0, path.find_last_of('/'));
        }
        return ".";
    #endif
}

// Find root directory with UI files
std::string findRootDir() {
    // Check environment variable first
    const char* envRoot = std::getenv("LOD_ROOT_DIR");
    if (envRoot && fs::exists(fs::path(envRoot) / "unreal-studio.html")) {
        return envRoot;
    }

    // Check current working directory
    if (fs::exists("unreal-studio.html")) {
        return fs::current_path().string();
    }

    // Check executable directory
    std::string exeDir = getExecutableDir();
    if (fs::exists(fs::path(exeDir) / "unreal-studio.html")) {
        return exeDir;
    }

    // Check parent of executable directory
    fs::path parent = fs::path(exeDir).parent_path();
    if (fs::exists(parent / "unreal-studio.html")) {
        return parent.string();
    }

    // Default to current directory
    return fs::current_path().string();
}

// Validate required files exist
bool validateFiles(const std::string& rootDir) {
    std::vector<std::string> required = {
        "unreal-studio.html",
        "studio.html"
    };

    for (const auto& file : required) {
        if (!fs::exists(fs::path(rootDir) / file)) {
            std::cerr << "❌ ERROR: Missing required file: " << file << std::endl;
            std::cerr << "ROOT_DIR: " << rootDir << std::endl;
            return false;
        }
    }
    return true;
}

// Print startup banner
void printBanner(const AppConfig& config) {
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "🐉 Labyrinth of the Dragon - Desktop App (C++)" << std::endl;
    std::cout << std::string(60, '=') << std::endl;
    std::cout << "✓ Server running at: http://localhost:" << config.port << std::endl;
    std::cout << "✓ Host: " << config.host << ":" << config.port << std::endl;
    std::cout << "✓ Root: " << config.rootDir << std::endl;
    std::cout << std::string(60, '=') << std::endl;
    std::cout << "\nAvailable UIs:" << std::endl;
    std::cout << "  • Unreal Style:  http://localhost:" << config.port << "/unreal" << std::endl;
    std::cout << "  • Modern Studio: http://localhost:" << config.port << "/studio" << std::endl;
    std::cout << "  • Classic Tab:   http://localhost:" << config.port << "/classic" << std::endl;
    std::cout << "\nAPI Endpoints:" << std::endl;
    std::cout << "  • System Info:   http://localhost:" << config.port << "/api/system" << std::endl;
    std::cout << "  • Health Check:  http://localhost:" << config.port << "/api/health" << std::endl;
    std::cout << "  • Tiles:         http://localhost:" << config.port << "/api/tiles" << std::endl;
    std::cout << "  • Maps:          http://localhost:" << config.port << "/api/maps" << std::endl;
    std::cout << std::string(60, '=') << std::endl << std::endl;
}

int main(int argc, char* argv[]) {
    try {
        // Configuration
        AppConfig config;
        
        // Get port from environment or command line
        const char* envPort = std::getenv("LOD_PORT");
        if (envPort) {
            config.port = std::stoi(envPort);
        }
        if (argc > 1) {
            config.port = std::stoi(argv[1]);
        }

        // Find root directory
        config.rootDir = findRootDir();
        
        // Validate files
        if (!validateFiles(config.rootDir)) {
            std::cerr << "\nTo fix:" << std::endl;
            std::cerr << "1. Ensure you run from the project directory, OR" << std::endl;
            std::cerr << "2. Set: set LOD_ROOT_DIR=<path-to-project>" << std::endl;
            return 1;
        }

        // Create and start server
        LODServer server(config.port, config.rootDir);
        
        // Start server in separate thread
        std::thread serverThread([&server]() {
            server.start();
        });

        // Print banner
        printBanner(config);

        // Create and show webview
        if (config.autoOpen) {
            std::string url = "http://localhost:" + std::to_string(config.port);
            LODWebView webview("Labyrinth of the Dragon", url, 1400, 900);
            webview.run();
        } else {
            // Keep running without webview
            std::cout << "Press Enter to stop server..." << std::endl;
            std::cin.get();
        }

        // Cleanup
        server.stop();
        serverThread.join();

        return 0;

    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        return 1;
    }
}
