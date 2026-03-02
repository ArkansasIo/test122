cmake_minimum_required(VERSION 3.15)
project(LabyrinthOfTheDragon_Desktop VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Project structure (CMAKE_SOURCE_DIR is already src-cpp)
set(SRC_DIR ${CMAKE_SOURCE_DIR})
set(INCLUDE_DIR ${CMAKE_SOURCE_DIR})

# Source files
set(SOURCES
    ${SRC_DIR}/main.cpp
)

# Headers
set(HEADERS
    ${SRC_DIR}/server.hpp
    ${SRC_DIR}/webview.hpp
)

# Create executable
add_executable(${PROJECT_NAME} ${SOURCES} ${HEADERS})

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE ${INCLUDE_DIR})

# Platform-specific settings
if(WIN32)
    target_compile_definitions(${PROJECT_NAME} PRIVATE _WIN32 UNICODE _UNICODE)
    
    # Link Windows libraries
    target_link_libraries(${PROJECT_NAME} PRIVATE
        ws2_32
        winhttp
        ole32
        oleaut32
        uuid
    )
    
    # Set subsystem to console for now (can be Windows for release)
    set_target_properties(${PROJECT_NAME} PROPERTIES
        WIN32_EXECUTABLE FALSE
    )
endif()

# External dependencies (header-only libraries)
# These should be downloaded or git submoduled

# cpp-httplib (https://github.com/yhirose/cpp-httplib)
find_path(HTTPLIB_INCLUDE_DIR httplib.h
    PATHS 
        ${CMAKE_SOURCE_DIR}/external/cpp-httplib
)

if(HTTPLIB_INCLUDE_DIR)
    target_include_directories(${PROJECT_NAME} PRIVATE ${HTTPLIB_INCLUDE_DIR})
    message(STATUS "Found cpp-httplib at: ${HTTPLIB_INCLUDE_DIR}")
else()
    message(WARNING "cpp-httplib not found. Download from: https://github.com/yhirose/cpp-httplib")
endif()

# nlohmann/json (https://github.com/nlohmann/json)
find_path(JSON_INCLUDE_DIR nlohmann/json.hpp
    PATHS
        ${CMAKE_SOURCE_DIR}/external/json/include
)

if(JSON_INCLUDE_DIR)
    target_include_directories(${PROJECT_NAME} PRIVATE ${JSON_INCLUDE_DIR})
    message(STATUS "Found nlohmann/json at: ${JSON_INCLUDE_DIR}")
else()
    message(WARNING "nlohmann/json not found. Download from: https://github.com/nlohmann/json")
endif()

# WebView2 (Windows only)
if(WIN32)
    find_path(WEBVIEW2_INCLUDE_DIR WebView2.h
        PATHS
            ${CMAKE_SOURCE_DIR}/external/webview2/build/native/include
            "$ENV{PROGRAMFILES\(x86\)}/Microsoft/WebView2/*/include"
    )
    
    if(WEBVIEW2_INCLUDE_DIR)
        target_include_directories(${PROJECT_NAME} PRIVATE ${WEBVIEW2_INCLUDE_DIR})
        message(STATUS "Found WebView2 at: ${WEBVIEW2_INCLUDE_DIR}")
    else()
        message(WARNING "WebView2 SDK not found. Install via NuGet or download manually")
    endif()
    
    # Windows Implementation Library (WIL)
    find_path(WIL_INCLUDE_DIR wil/com.h
        PATHS
            ${CMAKE_SOURCE_DIR}/external/wil/include
    )
    
    if(WIL_INCLUDE_DIR)
        target_include_directories(${PROJECT_NAME} PRIVATE ${WIL_INCLUDE_DIR})
        message(STATUS "Found WIL at: ${WIL_INCLUDE_DIR}")
    else()
        message(WARNING "WIL not found. Download from: https://github.com/microsoft/wil")
    endif()
endif()

# Compiler warnings
if(MSVC)
    target_compile_options(${PROJECT_NAME} PRIVATE /W4)
else()
    target_compile_options(${PROJECT_NAME} PRIVATE -Wall -Wextra -pedantic)
endif()

# Installation
install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION bin
)

# Copy resources
install(FILES
    ${CMAKE_SOURCE_DIR}/unreal-studio.html
    ${CMAKE_SOURCE_DIR}/studio.html
    DESTINATION bin
)

# Print configuration summary
message(STATUS "")
message(STATUS "=== Configuration Summary ===")
message(STATUS "Project: ${PROJECT_NAME}")
message(STATUS "Version: ${PROJECT_VERSION}")
message(STATUS "Build Type: ${CMAKE_BUILD_TYPE}")
message(STATUS "C++ Standard: ${CMAKE_CXX_STANDARD}")
message(STATUS "Source Dir: ${SRC_DIR}")
message(STATUS "Binary Dir: ${CMAKE_BINARY_DIR}")
message(STATUS "============================")
message(STATUS "")
