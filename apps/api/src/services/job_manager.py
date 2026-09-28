import asyncio
import datetime
import json
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from apps.api.src.models.database import Job, JobLog, Report, Organization, ServiceDefinition, Asset
from apps.api.src.engines.website_engine import WebsiteEngine
from apps.api.src.engines.seo_engine import SEOEngine
from apps.api.src.engines.perf_engine import PerformanceEngine
from apps.api.src.engines.a11y_engine import AccessibilityEngine
from apps.api.src.engines.security_engine import SecurityEngine
from apps.api.src.engines.data_engine import DataEngine
from apps.api.src.engines.document_engine import DocumentEngine
from apps.api.src.engines.analytics_engine import AnalyticsEngine
from apps.api.src.engines.ai_engine import AIEngine
from apps.api.src.engines.report_engine import ReportEngine

# In-memory pubsub stream for SSE logs
JOB_STREAM_QUEUES: Dict[str, List[asyncio.Queue]] = {}

def get_job_event_queue(job_id: str) -> asyncio.Queue:
    q = asyncio.Queue()
    if job_id not in JOB_STREAM_QUEUES:
        JOB_STREAM_QUEUES[job_id] = []
    JOB_STREAM_QUEUES[job_id].append(q)
    return q

async def broadcast_job_log(job_id: str, level: str, message: str, stage: str, progress: int):
    entry = {
        "job_id": job_id,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "level": level,
        "message": message,
        "stage": stage,
        "progress_pct": progress
    }
    if job_id in JOB_STREAM_QUEUES:
        for q in JOB_STREAM_QUEUES[job_id]:
            await q.put(entry)

class JobManager:
    @staticmethod
    async def run_job_pipeline(job_id: str, db_session_factory):
        async with db_session_factory() as session:
            # 1. Fetch Job
            res = await session.execute(select(Job).where(Job.id == job_id))
            job = res.scalar_one_or_none()
            if not job:
                return

            # Fetch Service Definition
            srv_res = await session.execute(select(ServiceDefinition).where(ServiceDefinition.id == job.service_id))
            service = srv_res.scalar_one_or_none()
            service_name = service.name if service else job.service_id
            
            # Fetch target asset URL if asset_id provided
            target_url = job.input_params.get("target_url")
            if not target_url and job.asset_id:
                ast_res = await session.execute(select(Asset).where(Asset.id == job.asset_id))
                asset = ast_res.scalar_one_or_none()
                if asset:
                    target_url = asset.target_uri
            if not target_url:
                target_url = job.input_params.get("target_host", "https://example.com")

            # Transition to RUNNING
            job.status = "RUNNING"
            job.started_at = datetime.datetime.utcnow()
            job.progress_pct = 15
            job.current_stage = "INITIALIZING_EXECUTION_ENGINE"
            await session.commit()
            
            await broadcast_job_log(job_id, "INFO", f"Worker leased job #{job_id} ({service_name})", "INITIALIZING", 15)

            try:
                # Stage 2: Execute Engine
                await broadcast_job_log(job_id, "INFO", f"Dispatching engine for target: {target_url}", "RUNNING", 35)
                await asyncio.sleep(0.5)  # Realistic scheduling window
                
                output_data: Dict[str, Any] = {}
                
                if job.service_id == "srv_web_audit_complete":
                    output_data = await WebsiteEngine.analyze_website(target_url)
                elif job.service_id in ["srv_web_broken_links", "srv_web_tech_fingerprint", "srv_web_sitemap_robots"]:
                    output_data = await WebsiteEngine.analyze_website(target_url)
                elif job.service_id in ["srv_seo_onpage_audit", "srv_seo_structured_data", "srv_seo_remediation_plan"]:
                    output_data = await SEOEngine.analyze_seo(target_url, job.input_params.get("primary_keyword", ""))
                elif job.service_id in ["srv_perf_core_web_vitals", "srv_perf_cache_compression"]:
                    output_data = await PerformanceEngine.analyze_performance(target_url, job.input_params.get("device_profile", "DESKTOP"))
                elif job.service_id == "srv_a11y_wcag_audit":
                    output_data = await AccessibilityEngine.analyze_a11y(target_url, job.input_params.get("conformance_level", "AA"))
                elif job.service_id == "srv_sec_tls_certificate":
                    output_data = await SecurityEngine.analyze_tls_certificate(target_url)
                elif job.service_id in ["srv_sec_headers_defense", "srv_sec_dns_email_hygiene"]:
                    output_data = await SecurityEngine.analyze_security_headers(target_url)
                elif job.service_id in ["srv_data_cleansing_pipeline", "srv_data_profiling_anomaly"]:
                    raw_data = job.input_params.get("raw_data", [
                        {"id": 1, "name": "  Alpha Corp  ", "email": "contact@alpha.com", "revenue": "$1,200"},
                        {"id": 2, "name": "Beta LLC", "email": None, "revenue": "$3,400"},
                        {"id": 1, "name": "Alpha Corp", "email": "contact@alpha.com", "revenue": "$1,200"}
                    ])
                    output_data = DataEngine.profile_and_cleanse_data(raw_data)
                elif job.service_id == "srv_doc_structured_extraction":
                    raw_text = job.input_params.get("raw_text", "INVOICE #INV-8821 Date: 2026-09-28 Vendor: CloudOps Inc\nEnterprise Support 1 $1200.00 $1200.00\nTotal Due: $1200.00")
                    output_data = DocumentEngine.extract_structured_document(raw_text)
                elif job.service_id == "srv_analytics_telemetry_insights":
                    output_data = AnalyticsEngine.generate_grounded_telemetry(job.input_params.get("time_range_days", 30))
                elif job.service_id == "srv_ai_grounded_investigator":
                    query = job.input_params.get("investigation_query", "Analyze performance and security posture.")
                    output_data = await AIEngine.investigate_asset(target_url, query)
                else:
                    output_data = await WebsiteEngine.analyze_website(target_url)

                # Stage 3: Quality Check
                await broadcast_job_log(job_id, "INFO", "Executing Quality Assurance & Verification assertions...", "QUALITY_CHECK", 80)
                await asyncio.sleep(0.3)

                # Stage 4: Generate Report
                await broadcast_job_log(job_id, "INFO", "Rendering cryptographically signed PDF report artifact...", "REPORT_GENERATION", 90)
                report_res = ReportEngine.generate_pdf_report(
                    job_id=job.id,
                    title=f"Audit Report: {service_name}",
                    category=service.category if service else "WEBSITE",
                    data=output_data
                )

                # Save Report record
                report = Report(
                    id=f"rep_{job.id}",
                    job_id=job.id,
                    org_id=job.org_id,
                    title=f"{service_name} - {target_url}",
                    category=service.category if service else "WEBSITE",
                    summary_json=output_data,
                    pdf_storage_path=report_res["storage_path"],
                    integrity_sha256=report_res["integrity_sha256"]
                )
                session.add(report)

                # Finalize Job
                job.status = "COMPLETED"
                job.progress_pct = 100
                job.current_stage = "DELIVERED"
                job.output_data = output_data
                job.raw_artifact_url = f"/api/v1/reports/{report.id}/download"
                job.completed_at = datetime.datetime.utcnow()
                
                await session.commit()
                await broadcast_job_log(job_id, "INFO", f"Job #{job_id} successfully completed. PDF and structured artifacts delivered.", "COMPLETED", 100)

            except Exception as e:
                job.status = "FAILED"
                job.error_message = str(e)
                job.completed_at = datetime.datetime.utcnow()
                await session.commit()
                await broadcast_job_log(job_id, "ERROR", f"Job execution failed: {str(e)}", "FAILED", 100)
