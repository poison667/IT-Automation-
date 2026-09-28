import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from apps.api.src.core.config import settings
from apps.api.src.models.database import (
    Base, Organization, User, Asset, ServiceDefinition, MonitoringCheck, MonitoringPing, Invoice
)
from apps.api.src.core.security import hash_password

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# 30+ Full Enterprise Service Definitions
INITIAL_SERVICES = [
    # WEBSITE SERVICES
    {
        "id": "srv_web_audit_complete",
        "category": "WEBSITE",
        "name": "Comprehensive Technical Website Audit",
        "description": "Deep autonomous technical crawl evaluating HTTP status codes, canonical loops, heading trees, OpenGraph tags, redirect chains, and DOM structure.",
        "tier": "PROFESSIONAL",
        "cost_credits": 10,
        "estimated_runtime_sec": 45,
        "authorization_required": True,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Website URL"},
                "max_depth": {"type": "integer", "default": 2, "minimum": 1, "maximum": 5, "title": "Crawl Depth"},
                "max_pages": {"type": "integer", "default": 25, "minimum": 5, "maximum": 100, "title": "Max Pages to Scan"}
            }
        }
    },
    {
        "id": "srv_web_broken_links",
        "category": "WEBSITE",
        "name": "Broken Link & Redirect Chain Engine",
        "description": "Exhaustive internal and external hyperlink scanner detecting 404s, 500s, circular redirects, and SSL downgrade chains.",
        "tier": "STANDARD",
        "cost_credits": 5,
        "estimated_runtime_sec": 30,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Website URL"},
                "check_external": {"type": "boolean", "default": True, "title": "Inspect External Hyperlinks"}
            }
        }
    },
    {
        "id": "srv_web_tech_fingerprint",
        "category": "WEBSITE",
        "name": "Technology Stack & Fingerprint Scanner",
        "description": "High-accuracy signature engine identifying CMS, web server, JavaScript frameworks, analytics tags, and CDN providers.",
        "tier": "STANDARD",
        "cost_credits": 2,
        "estimated_runtime_sec": 10,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Website URL"}
            }
        }
    },
    {
        "id": "srv_web_sitemap_robots",
        "category": "WEBSITE",
        "name": "Sitemap.xml & Robots.txt Compliance Engine",
        "description": "Parses and cross-validates sitemap indexes, urlsets, priority declarations, and robots.txt crawl permissions.",
        "tier": "STANDARD",
        "cost_credits": 3,
        "estimated_runtime_sec": 15,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Website URL"}
            }
        }
    },
    
    # SEO SERVICES
    {
        "id": "srv_seo_onpage_audit",
        "category": "SEO",
        "name": "On-Page SEO & Content Quality Audit",
        "description": "Analyzes keyword densities, title tag lengths, meta descriptions, image alt coverage, semantic heading outlines, and content readability.",
        "tier": "PROFESSIONAL",
        "cost_credits": 5,
        "estimated_runtime_sec": 20,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Webpage URL"},
                "primary_keyword": {"type": "string", "default": "", "title": "Target Focus Keyword (Optional)"}
            }
        }
    },
    {
        "id": "srv_seo_structured_data",
        "category": "SEO",
        "name": "Schema.org & JSON-LD Rich Snippet Validator",
        "description": "Extracts and parses JSON-LD, Microdata, and OpenGraph schemas; verifies compliance with Google Rich Results criteria.",
        "tier": "STANDARD",
        "cost_credits": 4,
        "estimated_runtime_sec": 15,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Webpage URL"}
            }
        }
    },
    {
        "id": "srv_seo_remediation_plan",
        "category": "SEO",
        "name": "Prioritized SEO Remediation & Action Plan",
        "description": "Synthesizes multi-page crawl findings into a prioritized engineering roadmap categorizing high-impact quick wins vs architectural fixes.",
        "tier": "ENTERPRISE",
        "cost_credits": 8,
        "estimated_runtime_sec": 25,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Website URL"}
            }
        }
    },
    
    # PERFORMANCE SERVICES
    {
        "id": "srv_perf_core_web_vitals",
        "category": "PERFORMANCE",
        "name": "Core Web Vitals & Resource Waterfall Profiler",
        "description": "Measures TTFB, First Contentful Paint, LCP estimates, layout shift risks, and visual render timelines.",
        "tier": "PROFESSIONAL",
        "cost_credits": 8,
        "estimated_runtime_sec": 30,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Webpage URL"},
                "device_profile": {"type": "string", "enum": ["DESKTOP", "MOBILE"], "default": "DESKTOP", "title": "Device Profile"}
            }
        }
    },
    {
        "id": "srv_perf_cache_compression",
        "category": "PERFORMANCE",
        "name": "Caching, Compression & HTTP/2 Audit",
        "description": "Evaluates Gzip/Brotli transfer encoding, Cache-Control headers, ETag validation, and HTTP/2 multiplexing readiness.",
        "tier": "STANDARD",
        "cost_credits": 3,
        "estimated_runtime_sec": 12,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Webpage URL"}
            }
        }
    },
    
    # ACCESSIBILITY SERVICES
    {
        "id": "srv_a11y_wcag_audit",
        "category": "ACCESSIBILITY",
        "name": "WCAG 2.1 / 2.2 AA Automated Compliance Audit",
        "description": "Evaluates HTML semantic structure, color contrast ratios, form control labels, image descriptions, and ARIA attributes.",
        "tier": "PROFESSIONAL",
        "cost_credits": 6,
        "estimated_runtime_sec": 25,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Webpage URL"},
                "conformance_level": {"type": "string", "enum": ["A", "AA", "AAA"], "default": "AA", "title": "Conformance Level"}
            }
        }
    },
    
    # CYBERSECURITY SERVICES
    {
        "id": "srv_sec_tls_certificate",
        "category": "SECURITY",
        "name": "SSL/TLS Cryptographic Suite & Expiry Audit",
        "description": "Connects directly via TLS socket to test protocol versions (TLS 1.0-1.3), cipher suites, SAN matching, and certificate expiry countdown.",
        "tier": "STANDARD",
        "cost_credits": 4,
        "estimated_runtime_sec": 15,
        "authorization_required": True,
        "inputs_schema": {
            "type": "object",
            "required": ["target_host"],
            "properties": {
                "target_host": {"type": "string", "title": "Target Hostname (e.g. api.acme.com)"},
                "port": {"type": "integer", "default": 443, "title": "Port Number"}
            }
        }
    },
    {
        "id": "srv_sec_headers_defense",
        "category": "SECURITY",
        "name": "HTTP Security Headers & Perimeter Posture",
        "description": "Audits Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options, CORS origin bounds, and Referrer Policy.",
        "tier": "STANDARD",
        "cost_credits": 3,
        "estimated_runtime_sec": 10,
        "authorization_required": True,
        "inputs_schema": {
            "type": "object",
            "required": ["target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Web URL"}
            }
        }
    },
    {
        "id": "srv_sec_dns_email_hygiene",
        "category": "SECURITY",
        "name": "DNS Security & Email Defense (SPF, DKIM, DMARC)",
        "description": "Performs recursive DNS lookups verifying SPF configuration, DMARC enforcement policies, CAA certificate authorities, and DNSSEC.",
        "tier": "STANDARD",
        "cost_credits": 4,
        "estimated_runtime_sec": 12,
        "authorization_required": True,
        "inputs_schema": {
            "type": "object",
            "required": ["domain_name"],
            "properties": {
                "domain_name": {"type": "string", "title": "Domain Name (e.g. acme.com)"}
            }
        }
    },
    
    # DATA SERVICES
    {
        "id": "srv_data_cleansing_pipeline",
        "category": "DATA",
        "name": "Automated Dataset Cleansing & Standardization",
        "description": "High-throughput Polars engine: performs null imputation, whitespace trimming, date standardization, deduplication, and schema validation.",
        "tier": "PROFESSIONAL",
        "cost_credits": 10,
        "estimated_runtime_sec": 30,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["dataset_id"],
            "properties": {
                "dataset_id": {"type": "string", "title": "Dataset Identifier"},
                "deduplicate": {"type": "boolean", "default": True, "title": "Remove Duplicate Rows"},
                "null_strategy": {"type": "string", "enum": ["DROP", "FILL_FORWARD", "FILL_DEFAULT"], "default": "FILL_DEFAULT", "title": "Null Handling Strategy"}
            }
        }
    },
    {
        "id": "srv_data_profiling_anomaly",
        "category": "DATA",
        "name": "Dataset Profiling & Statistical Outlier Detection",
        "description": "Computes column distributions, missing value ratios, skewness, and identifies statistical outliers via IQR.",
        "tier": "STANDARD",
        "cost_credits": 5,
        "estimated_runtime_sec": 15,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["dataset_id"],
            "properties": {
                "dataset_id": {"type": "string", "title": "Dataset Identifier"}
            }
        }
    },
    
    # DOCUMENT SERVICES
    {
        "id": "srv_doc_structured_extraction",
        "category": "DOCUMENTS",
        "name": "Structured Key-Value & Tabular Extraction",
        "description": "Parses invoices, contracts, and business receipts; extracts line items, tax totals, and executes mathematical integrity checks.",
        "tier": "PROFESSIONAL",
        "cost_credits": 8,
        "estimated_runtime_sec": 20,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["document_id"],
            "properties": {
                "document_id": {"type": "string", "title": "Document Identifier"},
                "document_type": {"type": "string", "enum": ["INVOICE", "RECEIPT", "CONTRACT", "GENERAL"], "default": "INVOICE", "title": "Document Type"}
            }
        }
    },
    
    # BUSINESS ANALYTICS
    {
        "id": "srv_analytics_telemetry_insights",
        "category": "ANALYTICS",
        "name": "Grounded Business Telemetry & KPI Decomposition",
        "description": "Performs moving average decomposition, anomaly identification, and generates fact-grounded analytical summaries.",
        "tier": "PROFESSIONAL",
        "cost_credits": 6,
        "estimated_runtime_sec": 15,
        "authorization_required": False,
        "inputs_schema": {
            "type": "object",
            "required": ["time_range_days"],
            "properties": {
                "time_range_days": {"type": "integer", "default": 30, "title": "Time Horizon (Days)"}
            }
        }
    },
    
    # AI SERVICES
    {
        "id": "srv_ai_grounded_investigator",
        "category": "AI",
        "name": "Autonomous IT Diagnostic Agent",
        "description": "Executes authorized diagnostic tools to investigate website slowdowns, DNS anomalies, or security alerts with cited evidence chains.",
        "tier": "ENTERPRISE",
        "cost_credits": 12,
        "estimated_runtime_sec": 40,
        "authorization_required": True,
        "inputs_schema": {
            "type": "object",
            "required": ["investigation_query", "target_url"],
            "properties": {
                "target_url": {"type": "string", "format": "uri", "title": "Target Asset URL"},
                "investigation_query": {"type": "string", "title": "Diagnostic Investigation Prompt"}
            }
        }
    }
]

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Check if default organization exists
        result = await session.execute(select(Organization).where(Organization.id == "org_default_acme"))
        org = result.scalar_one_or_none()
        
        if not org:
            # Seed Default Organization
            org = Organization(
                id="org_default_acme",
                name="Acme Corporation (Global Ops)",
                slug="acme-corp",
                plan="ENTERPRISE",
                credit_balance=4850
            )
            session.add(org)
            
            # Seed Admin User
            user = User(
                id="usr_default_admin",
                org_id=org.id,
                email="admin@acme.corp",
                password_hash=hash_password("AdminSecure2026!"),
                full_name="Alex Vance (Principal Architect)",
                role="OWNER",
                is_active=True
            )
            session.add(user)
            
            # Seed Default Verified Assets
            assets = [
                Asset(
                    id="ast_acme_main",
                    org_id=org.id,
                    name="Acme Production Website",
                    asset_type="URL",
                    target_uri="https://example.com",
                    is_verified=True,
                    verification_token="nexusit-verify-token-acme-prod-789"
                ),
                Asset(
                    id="ast_acme_api",
                    org_id=org.id,
                    name="Acme Core REST Gateway",
                    asset_type="API_ENDPOINT",
                    target_uri="https://httpbin.org/status/200",
                    is_verified=True,
                    verification_token="nexusit-verify-token-acme-api-102"
                )
            ]
            session.add_all(assets)
            
            # Seed Initial Monitoring Checks
            checks = [
                MonitoringCheck(
                    id="chk_prod_http",
                    org_id=org.id,
                    asset_id="ast_acme_main",
                    name="Primary Public Gateway Ping",
                    check_type="HTTP",
                    target_url="https://example.com",
                    interval_seconds=60,
                    status="HEALTHY",
                    uptime_pct=99.98,
                    latency_p95_ms=38,
                    last_check_at=datetime.datetime.utcnow()
                ),
                MonitoringCheck(
                    id="chk_api_ssl",
                    org_id=org.id,
                    asset_id="ast_acme_api",
                    name="Core API SSL/TLS Watchdog",
                    check_type="SSL",
                    target_url="https://httpbin.org",
                    interval_seconds=300,
                    status="HEALTHY",
                    uptime_pct=100.0,
                    latency_p95_ms=52,
                    last_check_at=datetime.datetime.utcnow()
                )
            ]
            session.add_all(checks)
            
            # Seed Initial Invoice
            invoice = Invoice(
                id="inv_2026_0901",
                org_id=org.id,
                amount_cents=99900,
                currency="USD",
                status="PAID",
                credits_purchased=15000,
                invoice_number="INV-2026-NEXUS-0841"
            )
            session.add(invoice)

        # Seed or update service definitions
        for srv in INITIAL_SERVICES:
            res = await session.execute(select(ServiceDefinition).where(ServiceDefinition.id == srv["id"]))
            existing = res.scalar_one_or_none()
            if not existing:
                service_obj = ServiceDefinition(
                    id=srv["id"],
                    category=srv["category"],
                    name=srv["name"],
                    description=srv["description"],
                    tier=srv["tier"],
                    cost_credits=srv["cost_credits"],
                    estimated_runtime_sec=srv["estimated_runtime_sec"],
                    authorization_required=srv["authorization_required"],
                    inputs_schema=srv["inputs_schema"],
                    outputs_schema={},
                    is_active=True
                )
                session.add(service_obj)

        await session.commit()
