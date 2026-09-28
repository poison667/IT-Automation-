#!/usr/bin/env bash
# ==============================================================================
# NexusIT Cross-Platform Linux Packaging Script
# Compiles React frontend and packages native Linux binaries (.AppImage, .deb, .rpm)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/apps/desktop"

echo "==> [1/3] Installing Frontend Dependencies..."
npm install

echo "==> [2/3] Compiling TypeScript & Bundling Vite..."
npm run build

echo "==> [3/3] Building Native Linux Desktop Packages (Tauri v2)..."
if command -v cargo &> /dev/null; then
    npx tauri build
    echo "==> Linux packages generated in: apps/desktop/src-tauri/target/release/bundle/"
else
    echo "==> [NOTICE] Cargo/Rust is not detected on path. Frontend is compiled and verified in apps/desktop/dist."
fi
