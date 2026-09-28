import pytest
from apps.api.src.engines.website_engine import WebsiteEngine
from apps.api.src.engines.seo_engine import SEOEngine
from apps.api.src.engines.perf_engine import PerformanceEngine
from apps.api.src.engines.a11y_engine import AccessibilityEngine
from apps.api.src.engines.security_engine import SecurityEngine
from apps.api.src.engines.data_engine import DataEngine
from apps.api.src.engines.document_engine import DocumentEngine
from apps.api.src.engines.analytics_engine import AnalyticsEngine
from apps.api.src.engines.report_engine import ReportEngine

@pytest.mark.asyncio
async def test_website_engine():
    res = await WebsiteEngine.analyze_website("https://example.com")
    assert "health_score" in res
    assert res["health_score"] >= 0
    assert "issues" in res

@pytest.mark.asyncio
async def test_seo_engine():
    res = await SEOEngine.analyze_seo("https://example.com", "example domain")
    assert "seo_score" in res
    assert "word_count" in res
    assert "remediation_plan" in res

@pytest.mark.asyncio
async def test_perf_engine():
    res = await PerformanceEngine.analyze_performance("https://example.com")
    assert "performance_score" in res
    assert "core_web_vitals" in res
    assert "waterfall" in res

@pytest.mark.asyncio
async def test_a11y_engine():
    res = await AccessibilityEngine.analyze_a11y("https://example.com")
    assert "accessibility_score" in res
    assert "violations" in res

@pytest.mark.asyncio
async def test_security_engine():
    res = await SecurityEngine.analyze_security_headers("https://example.com")
    assert "security_score" in res
    assert "headers_evaluated" in res

def test_data_engine():
    sample_data = [
        {"id": 1, "name": "  Alpha Corp  ", "revenue": 1200},
        {"id": 2, "name": "Beta LLC", "revenue": None},
        {"id": 1, "name": "Alpha Corp", "revenue": 1200}
    ]
    res = DataEngine.profile_and_cleanse_data(sample_data, deduplicate=True)
    assert res["initial_row_count"] == 3
    assert res["cleaned_row_count"] == 2
    assert res["duplicates_removed"] == 1

def test_document_engine():
    sample_text = """
    INVOICE #INV-2026-9901
    Date: 2026-09-28
    Vendor: Acme Cloud Services
    Item 1: Kubernetes Cluster Node 1 $500.00 $500.00
    Item 2: Managed Database Backup 2 $100.00 $200.00
    Total Due: $756.00
    """
    res = DocumentEngine.extract_structured_document(sample_text)
    assert "extracted_fields" in res
    assert res["financial_summary"]["calculated_subtotal"] == 700.00
    assert res["financial_summary"]["calculated_total"] == 756.00

def test_analytics_engine():
    res = AnalyticsEngine.generate_grounded_telemetry(30)
    assert len(res["facts"]) >= 3
    assert len(res["inferences"]) >= 1

def test_report_engine():
    sample_data = {"target_url": "https://example.com", "health_score": 95, "issues": []}
    res = ReportEngine.generate_pdf_report("test_job_1", "Test Audit", "WEBSITE", sample_data)
    assert "storage_path" in res
    assert "integrity_sha256" in res
