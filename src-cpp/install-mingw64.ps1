# Install 64-bit MinGW (LLVM)
Write-Host "Downloading 64-bit LLVM-MinGW..."

$url = "https://github.com/mstorsjo/llvm-mingw/releases/download/20240417/llvm-mingw-20240417-msvcrt-x86_64.zip"
$output = "D:\llvm-mingw-x86_64.zip"
$extractPath = "D:\llvm-mingw-x86_64"

Write-Host "Downloading from: $url"
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "Extracting to: $extractPath"
Expand-Archive -Path $output -DestinationPath "D:\" -Force

Write-Host "Cleaning up..."
Remove-Item $output

Write-Host ""
Write-Host "Installation complete!"
Write-Host ""
Write-Host "To use the 64-bit compiler, run:"
Write-Host '  $env:PATH = "D:\llvm-mingw-20240417-msvcrt-x86_64\bin;$env:PATH"'
Write-Host ""
Write-Host "Then rebuild: cd src-cpp && .\build.bat"
