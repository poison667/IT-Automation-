@echo off
REM ==============================================================================
REM NexusIT Cross-Platform Windows Packaging Script
REM Compiles React frontend and packages native Windows binaries (NSIS .exe, .msi)
REM ==============================================================================

cd /d "%~dp0..\apps\desktop"

echo ==> [1/3] Installing Frontend Dependencies...
call npm install

echo ==> [2/3] Compiling TypeScript and Bundling Vite...
call npm run build

echo ==> [3/3] Building Native Windows Desktop Installers (Tauri v2)...
call npx tauri build --target x86_64-pc-windows-msvc

echo ==> Windows installer artifacts generated in: apps\desktop\src-tauri\target\release\bundle\
pause
