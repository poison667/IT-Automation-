# NexusIT (OmniOps Core)
### Enterprise Autonomous IT & Digital Services Engine
**Unified Cross-Platform Desktop (Windows 10/11 & Linux) + Distributed Cloud Engine**

---

## Overview

**NexusIT** is a unified, software-powered enterprise IT and Digital Services platform. Rather than acting as a static dashboard or cosmetic mockup, the software itself autonomously executes, validates, and delivers genuine IT, cybersecurity, performance, data engineering, and automation services to customers.

The entire product is developed from **ONE shared source codebase and ONE unified architecture**, compiling into installable desktop applications for:
- **Windows 10 / 11** (NSIS `.exe` Installer and MSI `.msi` Enterprise Package)
- **Linux Desktop Distributions** (Universal `.AppImage`, Debian/Ubuntu `.deb`, and Fedora/RHEL `.rpm`)

---

## Architectural Topography

```
+----------------------------------------------------------------------------------------------------+
|                                    NEXUSIT DESKTOP CORE (Tauri 2.x)                                |
+----------------------------------------------------------------------------------------------------+
|                                SHARED REACT 18+ / TYPESCRIPT UI                                    |
|   (Marketplace, Job Console, Telemetry Charts, A11y Tree, File Cleanse, Workflow DAG, Auth, IAM)   |
+----------------------------------------------------------------------------------------------------+
|                         SHARED TYPESCRIPT PLATFORM ABSTRACTION LAYER (PAL)                         |
|   - Storage Interface (Encrypted Keyring, Local SQLite Cache)                                      |
|   - Notification Interface (Native OS Toast / D-Bus / Windows Notification Service)                |
|   - File System & Dialog Interface (Native Open/Save, Drag-and-Drop, MIME Streamer)                |
|   - Network Interface (mTLS / JWT Session / SSE EventSource / Auto-Reconnecting WebSocket)         |
+----------------------------------------------------------------------------------------------------+
|                           RUST DESKTOP RUNTIME & OS BINDINGS (Tauri v2)                            |
+---------------------------------------------------+------------------------------------------------+
|               WINDOWS 10 / 11 TARGET              |                  LINUX TARGET                  |
+---------------------------------------------------+------------------------------------------------+
| - Microsoft Edge WebView2 Evergreen               | - WebKitGTK 4.1 / GTK 3+                       |
| - Windows Credential Manager (DPAPI)              | - Secret Service API (libsecret / Keyring)     |
| - WinRT Native Notifications (Action Center)      | - FreeDesktop D-Bus Desktop Notifications      |
| - AppData\Local\NexusIT Configuration Store       | - XDG Base Directory Specification (~/.config) |
| - Native NSIS (.exe) & Windows Installer (.msi)   | - AppImage (Universal), .deb (Debian), .rpm    |
+---------------------------------------------------+------------------------------------------------+
```

---

## Service Catalog Overview

NexusIT provides 18+ verifiable, autonomous service engines across 8 primary domains:

| Domain | Service Engine ID | Description | Toolchain |
| :--- | :--- | :--- | :--- |
| **Website & DOM** | `srv_web_audit_complete` | Deep technical crawl: status codes, canonicals, H1-H6 hierarchy, OpenGraph, DOM AST. | `aiohttp`, `BeautifulSoup4`, `selectolax` |
| **Website & DOM** | `srv_web_broken_links` | Internal & external hyperlink scanner (404s, redirect loops, SSL downgrade chains). | `httpx`, Socket Handshake |
| **Website & DOM** | `srv_web_tech_fingerprint` | Signature engine identifying CMS, JS frameworks, web servers, and CDNs. | Heuristic AST Profiler |
| **SEO** | `srv_seo_onpage_audit` | Focus keyword density, meta title/description bounds, and image alt coverage. | NLP Tokenizer, Regex AST |
| **SEO** | `srv_seo_structured_data` | Schema.org JSON-LD, Microdata, and Google Rich Result criteria validation. | `rdflib`, JSON-LD Parser |
| **Performance** | `srv_perf_core_web_vitals` | TTFB, FCP, LCP, CLS, and 5-phase network waterfall breakdown. | Playwright CDP, Network Harvester |
| **Accessibility** | `srv_a11y_wcag_audit` | WCAG 2.1/2.2 AA automated compliance: landmarks, contrast ratios, ARIA roles. | `axe-core`, Color Contrast Evaluator |
| **Cybersecurity** | `srv_sec_tls_certificate` | Socket TLS probe: protocol versions (1.0-1.3), cipher suites, SANs, expiry. | Python `ssl`, `cryptography` |
| **Cybersecurity** | `srv_sec_headers_defense` | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and CORS boundary audit. | HTTP Header Profiler |
| **Monitoring** | `srv_mon_synthetic_ping` | Multi-region 60-second synthetic health checks, P95 latency, and incident engine. | Distributed Ping Prober |
| **Data Engineering**| `srv_data_cleansing_pipeline`| Vectorized null imputation, whitespace trim, date normalization, and deduplication.| **Polars (Rust)**, `PyArrow` |
| **Documents** | `srv_doc_structured_extraction`| Invoice/receipt key-value binding, tabular line items, and mathematical cross-check.| `PyMuPDF`, Layout Regex Parser |
| **Business BI** | `srv_analytics_telemetry_insights`| Moving average decomposition, operational ratios, Fact vs Inference matrix. | Statistical Telemetry Engine |
| **AI Investigator**| `srv_ai_grounded_investigator`| ReAct autonomous diagnostic agent with tool execution and evidence citations. | ReAct Planner, Provenance Graph |
| **Automations** | `srv_workflow_dag_engine` | Visual DAG builder: Trigger (Cron/Webhook) -> Condition -> Action -> Signed PDF. | DAG State Machine |
| **Reporting** | `srv_report_pdf_signing` | Pixel-perfect PDF generation with ReportLab and embedded SHA-256 hash. | **ReportLab**, Cryptographic Hasher |

---

## Getting Started & Local Development

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 20+ / 22+**
- **Rust 1.75+ & Cargo** (for native desktop packaging)

### 2. Running Backend API Gateway
```bash
# Install dependencies
pip install -r apps/api/requirements.txt

# Launch FastAPI server (Port 8000)
python3 -m uvicorn apps.api.src.main:app --host 0.0.0.0 --port 8000
```

### 3. Running Cross-Platform Desktop Client (Dev Mode)
```bash
cd apps/desktop

# Install packages
npm install

# Start Vite React Desktop UI (Port 5173 with backend proxy)
npm run dev
```

### 4. Running the Complete Automated Diagnostic Suite
```bash
# Execute end-to-end verification of all 18+ service engines
python3 scripts/run_all_diagnostics.py
```

### 5. Running Pytest Suite
```bash
python3 -m pytest apps/api/tests/ -v
```

---

## Desktop Packaging & Distribution

### Linux Desktop Build (Ubuntu/Debian, Fedora, Arch)
```bash
# Builds .AppImage, .deb, and .rpm packages
./scripts/build_desktop.sh
```
*Output artifacts:* `apps/desktop/src-tauri/target/release/bundle/`

### Windows Desktop Build (Windows 10/11)
```cmd
REM Builds NSIS installer (.exe) and Windows Installer (.msi)
scripts\build_desktop.bat
```
*Output artifacts:* `apps\desktop\src-tauri\target\release\bundle\`

---

## Repository Structure

```
/home/user/IT-Automation-/
├── apps/
│   ├── desktop/                 # Cross-Platform Desktop App (Tauri v2 + React 18+ + TypeScript)
│   │   ├── src-tauri/           # Rust Native Desktop Runtime & OS Bindings
│   │   ├── src/                 # Shared React UI (100% Unified Windows & Linux)
│   │   │   ├── components/      # UI Component Library (Tables, Drawers, Terminals, Badges)
│   │   │   ├── views/           # 14 Enterprise Views
│   │   │   ├── pal/             # TypeScript Bridge to Tauri Rust Runtime
│   │   │   └── types/           # Domain TypeScript Interfaces
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   ├── api/                     # FastAPI Backend Application
│   │   ├── src/
│   │   │   ├── core/            # Config, Security, DB, Exceptions
│   │   │   ├── models/          # SQLAlchemy Async Models & Pydantic Schemas
│   │   │   ├── engines/         # 12 Genuine Technical Execution Engines
│   │   │   ├── services/        # JobManager, Billing, Incidents
│   │   │   └── routers/         # 13 REST & SSE Routers
│   │   └── tests/               # Unit & Integration Pytest Suites
│   └── worker/                  # Celery / Redis Worker Service
├── docker/                      # Multi-stage Container Builds
├── docs/                        # Specifications & Architecture
│   ├── MASTER_ARCHITECTURE_SPECIFICATION.md
│   └── MASTER_DESIGN_SYSTEM.md
├── scripts/                     # Build & Diagnostic Scripts
│   ├── run_all_diagnostics.py
│   ├── build_desktop.sh
│   └── build_desktop.bat
├── .github/workflows/           # Matrix CI/CD Workflows
│   └── ci-cd.yml
└── docker-compose.yml
```

---

## Master Architecture & Design System Documentation

- **Full Technical Specification (42 Sections):** `docs/MASTER_ARCHITECTURE_SPECIFICATION.md`
- **Enterprise Design System & UX Standards:** `docs/MASTER_DESIGN_SYSTEM.md`

---
*NexusIT Enterprise Autonomous IT & Digital Services Engine — Production Baseline v2.0.0.*
