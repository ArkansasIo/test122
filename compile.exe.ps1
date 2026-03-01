#!/usr/bin/env pwsh
<#
  Labyrinth of the Dragon - PowerShell Executable Wrapper
  Can be renamed to compile.exe.ps1 or used as is
  Usage: .\compile.ps1 [target]
#>

# Allow running with or without file extension
$target = $args[0] -or 'all'

# Invoke the Node CLI
& node "$PSScriptRoot\compile-cli.js" $target
exit $LASTEXITCODE
