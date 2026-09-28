# NexusIT Master Enterprise Design System & UX Specification
## Enterprise Autonomous IT & Digital Services Engine
**Document Version:** `1.0.0-PROD-UX-SPEC`  
**Classification:** Enterprise Design System, Information Architecture & Human-Grade UX Guidelines  
**Standard:** Enterprise Operations Level (Benchmarked against Cloudflare, Datadog, Linear, Sentry)

---

## 1. Design Philosophy & Aesthetic Identity

**NexusIT** is an enterprise-grade IT operations and digital services execution platform. It is designed for system administrators, DevOps engineers, compliance officers, and technical operators who value **information density, precision, situational awareness, and friction-free execution**.

### Core Tenets
1. **Zero AI Cliché / Zero Generic Template Aesthetics**:
   - Strictly NO purple-to-pink gradients, NO glowing neon borders, NO futuristic gaming particle effects, NO bloated 24px-padded marketing cards.
   - Strictly NO fake graphs or animated counters that do not represent real backend data.
2. **Subtle, Engineered Precision**:
   - Neutral base palette built upon deep zinc/slate tones (`#090A0F`, `#12151D`, `#1A1F2C`, `#242B3D`) with crisp 1px borders (`#2D3748` / `#374151`).
   - Restrained border-radius: 4px (`rounded-sm`) for inputs and buttons; 6px (`rounded-md`) for panels and tables. Never large bubble containers.
   - Typography: **Inter** for clean UI legibility, **JetBrains Mono** for code snippets, JSON schemas, cryptographic hashes, IP addresses, and streaming terminal logs.
3. **Intentional Information Density**:
   - Compact table rows (36px - 40px height) with column sorting, live status indicators, inline action buttons, and slide-over drawer inspectors for deep evidence review.
   - Breadcrumb navigation and persistent contextual breadcrumbs for complex multi-step workflows.

---

## 2. Design Token System

### 2.1 Color Palette & Semantic System

```
+--------------------------------------------------------------------------------------------------+
| CATEGORY          | TOKEN NAME        | HEX VALUE | USAGE / SEMANTIC ROLE                        |
+--------------------------------------------------------------------------------------------------+
| Backgrounds       | bg-canvas         | #0B0E14   | App root background                          |
|                   | bg-surface        | #111622   | Navigation sidebar, top header bar           |
|                   | bg-panel          | #161D2E   | Workspace panels, cards, data tables         |
|                   | bg-panel-elevated | #1E273D   | Dropdown menus, modals, slide-over drawers   |
|                   | bg-subtle         | #25304B   | Active row hover, input backgrounds          |
| Borders           | border-subtle     | #1F293D   | Table dividers, subtle grid lines            |
|                   | border-strong     | #2E3C57   | Card borders, input borders, panel outlines  |
|                   | border-focus      | #3B82F6   | Keyboard focus rings (WCAG 2.1 AA compliant) |
| Typography        | text-primary      | #F1F5F9   | Primary headings, table values, active text  |
|                   | text-secondary    | #94A3B8   | Labels, table headers, breadcrumbs, metrics  |
|                   | text-muted        | #64748B   | Timestamps, metadata, disabled states        |
| Semantic Status   | status-success    | #10B981   | Healthy, Completed, Validated, 200 OK        |
|                   | status-warning    | #F59E0B   | Degraded, Retrying, Queued, Near Expiry      |
|                   | status-danger     | #EF4444   | Critical, Failed, Offline, 500 Error         |
|                   | status-info       | #3B82F6   | Running, Active, SSE Stream, Informational   |
|                   | status-neutral    | #64748B   | Idle, Unverified, Draft                      |
+--------------------------------------------------------------------------------------------------+
```

### 2.2 Typography Scale & Hierarchy

```
+--------------------------------------------------------------------------------------------------+
| STYLE             | FONT FAMILY     | SIZE   | LINE HEIGHT | WEIGHT     | APPLICATION            |
+--------------------------------------------------------------------------------------------------+
| Display Title     | Inter           | 20px   | 28px        | SemiBold   | Section headers        |
| Page Heading      | Inter           | 16px   | 24px        | SemiBold   | View page titles       |
| Section Subhead   | Inter           | 14px   | 20px        | Medium     | Panel headers, groups  |
| Body Standard     | Inter           | 13px   | 18px        | Regular    | Table cells, forms     |
| Body Secondary    | Inter           | 12px   | 16px        | Regular    | Metadata, sub-labels   |
| Micro Text        | Inter           | 11px   | 14px        | Medium     | Badges, status pills   |
| Code / Data Mono  | JetBrains Mono  | 12px   | 16px        | Regular    | Logs, hashes, JSON, IPs|
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Core Component Library Specification

### 3.1 Status Badges & Indicators
All status pills use a solid 6px dot indicator accompanied by semantic text (uppercase 11px font):
- `[ * HEALTHY ]` — Green-500 dot + Slate-900 bg + Emerald-400 text + Emerald-900/50 border.
- `[ * RUNNING ]` — Pulsing Blue-500 dot + Blue-900/30 bg + Blue-400 text + Blue-800/50 border.
- `[ * CRITICAL ]` — Red-500 dot + Red-900/30 bg + Red-400 text + Red-800/50 border.
- `[ * QUEUED ]` — Amber-500 dot + Amber-900/30 bg + Amber-400 text + Amber-800/50 border.

### 3.2 High-Throughput Data Tables
- Header: 32px height, 11px uppercase bold, dark background `#111622`, 1px solid bottom border `#1F293D`.
- Rows: 36px - 40px height, hover state `#1E273D`, clickable for deep inspection.
- Fixed pagination and quick search bar at the top right of every table.
- Column sorting indicators with ascending/descending arrows.

### 3.3 Terminal & Live Log Streamer
- Real-time SSE/WebSocket stream viewer styled as a dark technical console (`#0B0E14` background).
- Monospace font (`JetBrains Mono`, 12px), auto-scrolling with user-pause lock.
- Timestamp column (11px muted gray), severity tag (`[INFO]`, `[DEBUG]`, `[WARN]`, `[ERROR]`), and colored log message payload.
- One-click "Copy Raw Logs" and "Download Logfile" buttons.

### 3.4 Slide-Over Inspector Drawer
- When clicking any job, asset, incident, or dataset row, a 480px - 640px slide-over drawer animates smoothly from the right viewport boundary.
- Allows operators to inspect full JSON payloads, raw HTTP request/response headers, DOM selector paths, and execution telemetry without losing table context.

---

## 4. Enterprise Workflow Information Architecture

```
+----------------------------------------------------------------------------------------------------+
| 1. DASHBOARD VIEW: Real-time Operational NOC                                                       |
|    - Top KPI Row: Global System Health (%), Active Jobs (count), Monitored Assets, Incident Alerts|
|    - Main Grid (Left 65%): Live Asset Uptime & Latency Matrix + Active Job Execution Pipeline      |
|    - Auxiliary (Right 35%): Recent Incidents, Credit Consumption Telemetry, Quick Service Launcher|
+----------------------------------------------------------------------------------------------------+
| 2. SERVICE MARKETPLACE & CONFIGURATOR:                                                             |
|    - Search & Filter bar by category (Website, SEO, Performance, A11y, Security, Data, AI, Doc)   |
|    - Service Specification Cards: Exact SLA, credit cost, toolchain used, and required scopes      |
|    - Interactive Drawer Configurator: Dynamic JSONSchema form, live credit preview, asset selector |
+----------------------------------------------------------------------------------------------------+
| 3. ACTIVE JOBS & EXECUTION CONSOLE:                                                                |
|    - Filterable Job Table (Status: Queued, Running, Analyzing, Completed, Failed)                  |
|    - Real-time SSE Job Detail: Stage progress bar (5 steps), Live Terminal Logs, Artifact preview  |
+----------------------------------------------------------------------------------------------------+
| 4. CONTINUOUS MONITORING & INCIDENT CENTER:                                                        |
|    - Asset Health Grid: Ping latency graphs (Sparkline/Recharts), SSL validity countdowns          |
|    - Incident Management: Active outages, timeline, root-cause diagnostics, manual acknowledge     |
+----------------------------------------------------------------------------------------------------+
| 5. DATA WORKBENCH:                                                                                 |
|    - Ingestion dropzone for CSV, XLSX, JSON, Parquet                                               |
|    - Column Profiler: Type inference, null percentages, anomaly tags, sample data grid            |
|    - Cleansing Rule Builder: Deduplication strategy, imputation rules, type casting, instant test  |
+----------------------------------------------------------------------------------------------------+
| 6. DOCUMENT INTELLIGENCE VAULT:                                                                    |
|    - Multi-page PDF / OCR layout viewer with extracted bounding box overlays                      |
|    - Extracted Key-Value structured JSON viewer with copy and CSV export                           |
+----------------------------------------------------------------------------------------------------+
| 7. AUTOMATION WORKFLOW BUILDER:                                                                    |
|    - Visual DAG Pipeline: Trigger (Cron/Webhook) -> Condition -> Action (Run Service) -> Result   |
|    - Execution Run History: Step-by-step logs, input/output payload inspection                     |
+----------------------------------------------------------------------------------------------------+
| 8. GROUNDED AI WORKBENCH:                                                                          |
|    - Grounded Query Interface: Interacts directly with platform data                               |
|    - Provenance Inspector: Fact vs Inference vs Recommendation separation with verified source IDs |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. Honest Empty States & Failure Recovery Patterns

### 5.1 Empty States
Every empty state contains:
1. A crisp, non-decorative technical icon (e.g. `ServerOff`, `Database`, `FileSearch`).
2. A direct, clear statement of fact (e.g., *"No monitoring checks configured for this workspace."*).
3. A short 1-sentence explanation of what to do next.
4. A direct primary action button (e.g., `+ Add Monitored Endpoint` or `Import Dataset`).

### 5.2 Error & Failure States
When a job fails (e.g. target host DNS resolution timeout):
- Red failure banner with exact technical error code and raw stack trace toggle.
- Plain-English root cause explanation generated by the diagnostic engine.
- One-click `[ Retry Job ]` with identical parameters and `[ Inspect Raw Logs ]` button.

---

## 6. Accessibility & Keyboard Navigation (WCAG 2.1 AA)

- **Focus Visible**: All interactive buttons, inputs, tabs, and table rows feature a distinct `2px solid #3B82F6` focus outline with a `2px` offset.
- **Keyboard Shortcuts**:
  - `Ctrl + K` / `Cmd + K`: Global Command Palette (Jump to service, asset, job, or setting).
  - `Esc`: Close any open modal, drawer, or dropdown.
  - `J` / `K` or `ArrowUp` / `ArrowDown`: Navigate rows in tables and search lists.
  - `Enter`: Select item or trigger primary action.
- **Color Contrast**: All body text meets or exceeds a `4.5:1` contrast ratio against background panels; headings exceed `7:1`.

---
*NexusIT Design System & UX Standards document is approved as the design benchmark for all frontend implementation.*
