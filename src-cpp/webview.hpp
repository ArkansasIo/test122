/**
 * WebView Implementation
 * Embeds Chromium/Edge WebView for displaying UI
 */

#pragma once

#include <string>

#ifdef _WIN32
#include <windows.h>
#include <wrl.h>
#include <wil/com.h>
#include "WebView2.h"
using namespace Microsoft::WRL;
#endif

class LODWebView {
private:
    std::string title_;
    std::string url_;
    int width_;
    int height_;

#ifdef _WIN32
    HWND hwnd_ = nullptr;
    wil::com_ptr<ICoreWebView2Controller> webviewController_;
    wil::com_ptr<ICoreWebView2> webview_;

    static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
        LODWebView* self = nullptr;

        if (msg == WM_NCCREATE) {
            CREATESTRUCT* cs = (CREATESTRUCT*)lParam;
            self = (LODWebView*)cs->lpCreateParams;
            SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR)self);
        } else {
            self = (LODWebView*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
        }

        if (self) {
            return self->handleMessage(hwnd, msg, wParam, lParam);
        }
        return DefWindowProc(hwnd, msg, wParam, lParam);
    }

    LRESULT handleMessage(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
        switch (msg) {
            case WM_SIZE:
                if (webviewController_) {
                    RECT bounds;
                    GetClientRect(hwnd, &bounds);
                    webviewController_->put_Bounds(bounds);
                }
                return 0;

            case WM_DESTROY:
                PostQuitMessage(0);
                return 0;
        }
        return DefWindowProc(hwnd, msg, wParam, lParam);
    }

    bool createWindow() {
        WNDCLASSEX wc = {};
        wc.cbSize = sizeof(WNDCLASSEX);
        wc.lpfnWndProc = WndProc;
        wc.hInstance = GetModuleHandle(nullptr);
        wc.lpszClassName = L"LODWebView";
        wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
        wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
        
        RegisterClassEx(&wc);

        std::wstring wtitle(title_.begin(), title_.end());
        
        // Center window on screen
        int screenWidth = GetSystemMetrics(SM_CXSCREEN);
        int screenHeight = GetSystemMetrics(SM_CYSCREEN);
        int x = (screenWidth - width_) / 2;
        int y = (screenHeight - height_) / 2;

        hwnd_ = CreateWindowEx(
            0,
            L"LODWebView",
            wtitle.c_str(),
            WS_OVERLAPPEDWINDOW,
            x, y, width_, height_,
            nullptr, nullptr,
            GetModuleHandle(nullptr),
            this
        );

        if (!hwnd_) {
            return false;
        }

        ShowWindow(hwnd_, SW_SHOW);
        UpdateWindow(hwnd_);
        return true;
    }

    bool createWebView() {
        // Create WebView2 environment
        CreateCoreWebView2EnvironmentWithOptions(
            nullptr, nullptr, nullptr,
            Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
                [this](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
                    if (FAILED(result)) return result;

                    env->CreateCoreWebView2Controller(
                        hwnd_,
                        Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
                            [this](HRESULT result, ICoreWebView2Controller* controller) -> HRESULT {
                                if (FAILED(result)) return result;

                                webviewController_ = controller;
                                webviewController_->get_CoreWebView2(&webview_);

                                // Set bounds
                                RECT bounds;
                                GetClientRect(hwnd_, &bounds);
                                webviewController_->put_Bounds(bounds);

                                // Navigate to URL
                                std::wstring wurl(url_.begin(), url_.end());
                                webview_->Navigate(wurl.c_str());

                                return S_OK;
                            }).Get());

                    return S_OK;
                }).Get());

        return true;
    }
#endif

public:
    LODWebView(const std::string& title, const std::string& url, int width, int height)
        : title_(title), url_(url), width_(width), height_(height) {}

    void run() {
#ifdef _WIN32
        CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);

        if (!createWindow()) {
            return;
        }

        createWebView();

        // Message loop
        MSG msg = {};
        while (GetMessage(&msg, nullptr, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        CoUninitialize();
#else
        // For non-Windows, just keep alive
        std::cout << "WebView not supported on this platform" << std::endl;
        std::cout << "Please open: " << url_ << std::endl;
        std::cin.get();
#endif
    }
};
