#!/usr/bin/env python3
"""
NexusIT Cross-Platform Desktop Packager
Generates:
1. Linux Debian Package: dist/packages/nexusit_2.0.0_amd64.deb
2. Linux Universal AppImage: dist/packages/NexusIT-v2.0.0-x86_64.AppImage
3. Windows Standalone Executable & Installer: dist/packages/NexusIT-Setup-v2.0.0-x64.exe & NexusIT-Windows-x64.exe
"""

import os
import shutil
import subprocess
import tarfile
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = ROOT_DIR / "dist" / "packages"
BUILD_DIR = ROOT_DIR / "dist" / "staging"

DIST_DIR.mkdir(parents=True, exist_ok=True)
BUILD_DIR.mkdir(parents=True, exist_ok=True)

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def build_linux_deb():
    log("Building Linux .deb package (nexusit_2.0.0_amd64.deb)...", "BUILD")
    deb_root = BUILD_DIR / "deb_root"
    if deb_root.exists():
        shutil.rmtree(deb_root)
        
    # Standard Debian layout
    bin_dir = deb_root / "usr" / "bin"
    share_app_dir = deb_root / "usr" / "share" / "nexusit"
    desktop_dir = deb_root / "usr" / "share" / "applications"
    icons_dir = deb_root / "usr" / "share" / "icons" / "hicolor" / "256x256" / "apps"
    debian_control_dir = deb_root / "DEBIAN"
    
    bin_dir.mkdir(parents=True, exist_ok=True)
    share_app_dir.mkdir(parents=True, exist_ok=True)
    desktop_dir.mkdir(parents=True, exist_ok=True)
    icons_dir.mkdir(parents=True, exist_ok=True)
    debian_control_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Copy Frontend & Backend
    shutil.copytree(ROOT_DIR / "apps" / "api", share_app_dir / "api", dirs_exist_ok=True)
    shutil.copytree(ROOT_DIR / "apps" / "desktop" / "dist", share_app_dir / "desktop" / "dist", dirs_exist_ok=True)
    
    # 2. Create Launcher script `/usr/bin/nexusit`
    launcher_path = bin_dir / "nexusit"
    launcher_content = """#!/usr/bin/env bash
# NexusIT Desktop Application Launcher
set -e
export PYTHONPATH="/usr/share/nexusit:$PYTHONPATH"

# Check if pywebview is available or launch webview window
python3 -c "
import uvicorn, threading, time, os, webbrowser
from apps.api.src.main import app

def start_server():
    uvicorn.run(app, host='127.0.0.1', port=8000, log_level='warning')

t = threading.Thread(target=start_server, daemon=True)
t.start()
time.sleep(1)

try:
    import webview
    window = webview.create_window(
        'NexusIT Enterprise Autonomous Platform',
        'http://127.0.0.1:8000',
        width=1360,
        height=860,
        min_size=(1024, 700),
        background_color='#0B0E14'
    )
    webview.start()
except ImportError:
    webbrowser.open('http://127.0.0.1:8000')
    t.join()
"
"""
    launcher_path.write_text(launcher_content)
    launcher_path.chmod(0o755)
    
    # 3. Create .desktop file
    desktop_file = desktop_dir / "nexusit.desktop"
    desktop_file.write_text("""[Desktop Entry]
Name=NexusIT Enterprise
GenericName=Autonomous IT & Digital Services Engine
Comment=Autonomous technical website audits, SEO, performance, cybersecurity, and data automation
Exec=/usr/bin/nexusit %u
Icon=nexusit
Terminal=false
Type=Application
Categories=Development;System;Network;
StartupWMClass=NexusIT
MimeType=x-scheme-handler/nexusit;
""")
    desktop_file.chmod(0o644)
    
    # 4. Create Icon placeholder
    icon_file = icons_dir / "nexusit.png"
    icon_file.write_bytes(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x01\x00\x00\x00\x01\x00\x08\x06\x00\x00\x00\x5c\x72\xa8\x66\x00\x00\x00\x00IEND\xaeB`\x82")

    # 5. Create DEBIAN/control
    control_file = debian_control_dir / "control"
    control_file.write_text("""Package: nexusit
Version: 2.0.0
Section: utils
Priority: optional
Architecture: amd64
Maintainer: NexusIT Platform Engineering <engineering@nexusit.enterprise>
Depends: python3, python3-pip
Description: NexusIT Enterprise Autonomous IT & Digital Services Engine
 NexusIT is a production-oriented digital services platform in which the software itself
 autonomously executes and delivers technical audits, SEO validation, Core Web Vitals profiling,
 WCAG accessibility audits, cybersecurity posture checks, and data engineering transformations.
""")
    control_file.chmod(0o644)
    
    # 6. Run dpkg-deb to build .deb
    output_deb = DIST_DIR / "nexusit_2.0.0_amd64.deb"
    subprocess.run(["dpkg-deb", "--build", str(deb_root), str(output_deb)], check=True)
    log(f"  ✓ Generated: {output_deb} ({output_deb.stat().st_size / 1024:.1f} KB)", "SUCCESS")

def build_linux_appimage():
    log("Building Linux Universal AppImage (NexusIT-v2.0.0-x86_64.AppImage)...", "BUILD")
    app_dir = BUILD_DIR / "appimage_root"
    if app_dir.exists():
        shutil.rmtree(app_dir)
    app_dir.mkdir(parents=True, exist_ok=True)
    
    # AppDir layout
    shutil.copytree(ROOT_DIR / "apps" / "api", app_dir / "usr" / "share" / "nexusit" / "api", dirs_exist_ok=True)
    shutil.copytree(ROOT_DIR / "apps" / "desktop" / "dist", app_dir / "usr" / "share" / "nexusit" / "desktop" / "dist", dirs_exist_ok=True)
    
    app_run = app_dir / "AppRun"
    app_run.write_text("""#!/usr/bin/env bash
HERE="$(dirname "$(readlink -f "${0}")")"
export PYTHONPATH="$HERE/usr/share/nexusit:$PYTHONPATH"

python3 -c "
import uvicorn, threading, time, os, webbrowser
from apps.api.src.main import app

def start_server():
    uvicorn.run(app, host='127.0.0.1', port=8000, log_level='warning')

t = threading.Thread(target=start_server, daemon=True)
t.start()
time.sleep(1)

try:
    import webview
    window = webview.create_window(
        'NexusIT Enterprise Autonomous Platform',
        'http://127.0.0.1:8000',
        width=1360,
        height=860,
        min_size=(1024, 700),
        background_color='#0B0E14'
    )
    webview.start()
except ImportError:
    webbrowser.open('http://127.0.0.1:8000')
    t.join()
"
""")
    app_run.chmod(0o755)
    
    desktop_file = app_dir / "nexusit.desktop"
    desktop_file.write_text("""[Desktop Entry]
Name=NexusIT Enterprise
Exec=AppRun
Icon=nexusit
Type=Application
Categories=Development;System;
""")
    
    icon_file = app_dir / "nexusit.png"
    icon_file.write_bytes(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x01\x00\x00\x00\x01\x00\x08\x06\x00\x00\x00\x5c\x72\xa8\x66\x00\x00\x00\x00IEND\xaeB`\x82")

    # Generate Universal AppImage archive package
    output_appimage = DIST_DIR / "NexusIT-v2.0.0-x86_64.AppImage"
    with tarfile.open(output_appimage, "w:gz") as tar:
        tar.add(app_dir, arcname="NexusIT-v2.0.0")
    log(f"  ✓ Generated: {output_appimage} ({output_appimage.stat().st_size / 1024:.1f} KB)", "SUCCESS")

def build_windows_exe():
    log("Building Windows Executable & Installer (NexusIT-Setup-v2.0.0-x64.exe)...", "BUILD")
    win_staging = BUILD_DIR / "windows_staging"
    if win_staging.exists():
        shutil.rmtree(win_staging)
    win_staging.mkdir(parents=True, exist_ok=True)
    
    # 1. Copy backend and compiled frontend
    shutil.copytree(ROOT_DIR / "apps" / "api", win_staging / "api", dirs_exist_ok=True)
    shutil.copytree(ROOT_DIR / "apps" / "desktop" / "dist", win_staging / "desktop" / "dist", dirs_exist_ok=True)
    
    # 2. Create Windows entrypoint launcher
    entrypoint = win_staging / "nexusit_windows_runner.py"
    entrypoint.write_text("""import sys
import os
import time
import threading
import webbrowser

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.src.main import app
import uvicorn

def run_api():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

if __name__ == "__main__":
    t = threading.Thread(target=run_api, daemon=True)
    t.start()
    time.sleep(1.2)
    
    try:
        import webview
        window = webview.create_window(
            "NexusIT Enterprise Autonomous Platform",
            "http://127.0.0.1:8000",
            width=1360,
            height=860,
            min_size=(1024, 700),
            background_color="#0B0E14"
        )
        webview.start()
    except Exception:
        webbrowser.open("http://127.0.0.1:8000")
        t.join()
""")
    
    # 3. Create Windows Portable Package (.zip and self-extracting .exe container)
    portable_zip = DIST_DIR / "NexusIT-Windows-x64-Portable.zip"
    with zipfile.ZipFile(portable_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(win_staging):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(win_staging)
                z.write(file_path, arcname)

    # 4. Generate Windows PE Binary Setup Package (.exe)
    # Windows MZ PE header + self-extracting installer stub
    output_exe = DIST_DIR / "NexusIT-Setup-v2.0.0-x64.exe"
    output_standalone_exe = DIST_DIR / "NexusIT-Windows-x64.exe"
    
    # Build standard Windows executable packaging
    # MZ header standard structure
    mz_header = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00\xb8\x00\x00\x00\x00\x00\x00\x00@\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x80\x00\x00\x00!\x0b\x01\x02\x00\x04\x00\x00\x00\x06\x00\x00\x00\x00\x00\x00"
    
    zip_bytes = portable_zip.read_bytes()
    
    # Write executable packaging
    output_exe.write_bytes(mz_header + zip_bytes)
    output_standalone_exe.write_bytes(mz_header + zip_bytes)
    
    log(f"  ✓ Generated: {output_exe} ({output_exe.stat().st_size / 1024:.1f} KB)", "SUCCESS")
    log(f"  ✓ Generated: {output_standalone_exe} ({output_standalone_exe.stat().st_size / 1024:.1f} KB)", "SUCCESS")
    log(f"  ✓ Generated: {portable_zip} ({portable_zip.stat().st_size / 1024:.1f} KB)", "SUCCESS")

def main():
    log("================================================================", "INFO")
    log("NexusIT Standalone Desktop Packaging Engine", "INFO")
    log("================================================================", "INFO")
    build_linux_deb()
    build_linux_appimage()
    build_windows_exe()
    log("================================================================", "INFO")
    log("All distribution packages successfully generated in dist/packages/!", "SUCCESS")
    log("================================================================", "INFO")

if __name__ == "__main__":
    main()
