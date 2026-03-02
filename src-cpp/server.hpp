/**
 * HTTP Server Implementation
 * Provides REST API endpoints and static file serving
 */

#pragma once

#include <string>
#include <map>
#include <vector>
#include <functional>
#include <memory>
#include <filesystem>
#include <fstream>
#include <sstream>
#include "httplib.h"
#include <nlohmann/json.hpp>

namespace fs = std::filesystem;
using json = nlohmann::json;

class LODServer {
private:
    int port_;
    std::string rootDir_;
    std::unique_ptr<httplib::Server> server_;

    // MIME types
    std::map<std::string, std::string> mimeTypes_ = {
        {".html", "text/html"},
        {".css", "text/css"},
        {".js", "application/javascript"},
        {".json", "application/json"},
        {".png", "image/png"},
        {".jpg", "image/jpeg"},
        {".jpeg", "image/jpeg"},
        {".gif", "image/gif"},
        {".svg", "image/svg+xml"},
        {".ico", "image/x-icon"},
        {".gbc", "application/octet-stream"},
        {".bin", "application/octet-stream"},
        {".csv", "text/csv"},
        {".tilemap", "application/octet-stream"},
        {".woff", "font/woff"},
        {".woff2", "font/woff2"}
    };

    // Get MIME type for file
    std::string getMimeType(const std::string& path) {
        size_t dotPos = path.find_last_of('.');
        if (dotPos != std::string::npos) {
            std::string ext = path.substr(dotPos);
            auto it = mimeTypes_.find(ext);
            if (it != mimeTypes_.end()) {
                return it->second;
            }
        }
        return "application/octet-stream";
    }

    // Read file contents
    std::string readFile(const std::string& path) {
        std::ifstream file(path, std::ios::binary);
        if (!file.is_open()) {
            throw std::runtime_error("Cannot open file: " + path);
        }
        std::stringstream buffer;
        buffer << file.rdbuf();
        return buffer.str();
    }

    // Serve static file
    void serveFile(const httplib::Request& req, httplib::Response& res, const std::string& filePath) {
        try {
            if (!fs::exists(filePath)) {
                res.status = 404;
                res.set_content("<h1>404 - Not Found</h1>", "text/html");
                return;
            }

            std::string content = readFile(filePath);
            std::string mime = getMimeType(filePath);
            res.set_content(content, mime.c_str());
            res.status = 200;

        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content("Internal Server Error", "text/plain");
        }
    }

    // List files in directory with extension filter
    std::vector<std::string> listFiles(const std::string& dir, const std::string& ext = "") {
        std::vector<std::string> files;
        
        if (!fs::exists(dir)) {
            return files;
        }

        for (const auto& entry : fs::directory_iterator(dir)) {
            if (entry.is_regular_file()) {
                std::string filename = entry.path().filename().string();
                if (ext.empty() || filename.ends_with(ext)) {
                    files.push_back(filename);
                }
            }
        }
        
        return files;
    }

    // Setup routes
    void setupRoutes() {
        // Root - serve Unreal-style UI
        server_->Get("/", [this](const httplib::Request& req, httplib::Response& res) {
            serveFile(req, res, (fs::path(rootDir_) / "unreal-studio.html").string());
        });

        server_->Get("/index.html", [this](const httplib::Request& req, httplib::Response& res) {
            serveFile(req, res, (fs::path(rootDir_) / "unreal-studio.html").string());
        });

        // UI Routes
        server_->Get("/classic", [this](const httplib::Request& req, httplib::Response& res) {
            serveFile(req, res, (fs::path(rootDir_) / "src" / "client" / "index.html").string());
        });

        server_->Get("/studio", [this](const httplib::Request& req, httplib::Response& res) {
            serveFile(req, res, (fs::path(rootDir_) / "studio.html").string());
        });

        server_->Get("/unreal", [this](const httplib::Request& req, httplib::Response& res) {
            serveFile(req, res, (fs::path(rootDir_) / "unreal-studio.html").string());
        });

        // API: Health check
        server_->Get("/api/health", [](const httplib::Request& req, httplib::Response& res) {
            json response = {
                {"status", "ok"},
                {"timestamp", std::time(nullptr)}
            };
            res.set_content(response.dump(), "application/json");
        });

        // API: System info
        server_->Get("/api/system", [this](const httplib::Request& req, httplib::Response& res) {
            json response = {
                {"platform", "Windows"},
                {"port", port_},
                {"root", rootDir_},
                {"version", "1.0.0-cpp"}
            };
            res.set_content(response.dump(), "application/json");
        });

        // API: Tiles
        server_->Get("/api/tiles", [this](const httplib::Request& req, httplib::Response& res) {
            auto files = listFiles((fs::path(rootDir_) / "assets" / "tiles").string(), ".png");
            json response = {
                {"success", true},
                {"files", files}
            };
            res.set_content(response.dump(), "application/json");
        });

        // API: Maps
        server_->Get("/api/maps", [this](const httplib::Request& req, httplib::Response& res) {
            auto files = listFiles((fs::path(rootDir_) / "res" / "maps").string());
            json response = {
                {"success", true},
                {"files", files}
            };
            res.set_content(response.dump(), "application/json");
        });

        // API: Tilemaps
        server_->Get("/api/tilemaps", [this](const httplib::Request& req, httplib::Response& res) {
            auto files = listFiles((fs::path(rootDir_) / "res" / "tilemaps").string(), ".tilemap");
            json response = {
                {"success", true},
                {"files", files}
            };
            res.set_content(response.dump(), "application/json");
        });

        // API: ROMs
        server_->Get("/api/roms", [this](const httplib::Request& req, httplib::Response& res) {
            auto dir = (fs::path(rootDir_) / "roms").string();
            std::vector<std::string> files;
            for (const auto& f : listFiles(dir)) {
                if (f.ends_with(".gbc") || f.ends_with(".gb")) {
                    files.push_back(f);
                }
            }
            json response = {
                {"success", true},
                {"files", files}
            };
            res.set_content(response.dump(), "application/json");
        });

        // API: Strings - GET
        server_->Get("/api/strings", [this](const httplib::Request& req, httplib::Response& res) {
            try {
                std::string content = readFile((fs::path(rootDir_) / "assets" / "strings.js").string());
                json response = {
                    {"success", true},
                    {"content", content}
                };
                res.set_content(response.dump(), "application/json");
            } catch (const std::exception& e) {
                json response = {
                    {"success", false},
                    {"error", e.what()}
                };
                res.set_content(response.dump(), "application/json");
                res.status = 400;
            }
        });

        // API: Strings - POST
        server_->Post("/api/strings", [this](const httplib::Request& req, httplib::Response& res) {
            try {
                auto j = json::parse(req.body);
                std::string content = j["content"];
                
                std::ofstream file((fs::path(rootDir_) / "assets" / "strings.js").string());
                file << content;
                file.close();

                json response = {{"success", true}};
                res.set_content(response.dump(), "application/json");
            } catch (const std::exception& e) {
                json response = {
                    {"success", false},
                    {"error", e.what()}
                };
                res.set_content(response.dump(), "application/json");
                res.status = 400;
            }
        });

        // Static file serving (fallback)
        server_->Get("/(.*)", [this](const httplib::Request& req, httplib::Response& res) {
            std::string path = req.path.substr(1); // Remove leading '/'
            
            // Try multiple locations
            std::vector<std::string> candidates = {
                (fs::path(rootDir_) / "src" / "client" / path).string(),
                (fs::path(rootDir_) / "dist" / path).string(),
                (fs::path(rootDir_) / path).string()
            };

            for (const auto& candidate : candidates) {
                if (fs::exists(candidate) && fs::is_regular_file(candidate)) {
                    serveFile(req, res, candidate);
                    return;
                }
            }

            // 404
            res.status = 404;
            res.set_content("<h1>404 - Not Found</h1><p>Path: " + req.path + "</p>", "text/html");
        });
    }

public:
    LODServer(int port, const std::string& rootDir) 
        : port_(port), rootDir_(rootDir) {
        server_ = std::make_unique<httplib::Server>();
        setupRoutes();
    }

    void start() {
        server_->listen("0.0.0.0", port_);
    }

    void stop() {
        server_->stop();
    }
};
