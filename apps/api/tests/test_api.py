import pytest
import asyncio
import httpx
from apps.api.src.main import app
from apps.api.src.core.db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_db_session():
    asyncio.run(init_db())

@pytest.mark.asyncio
async def test_api_health():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "HEALTHY"

@pytest.mark.asyncio
async def test_api_auth_login():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp = await client.post("/api/v1/auth/login", json={"email": "admin@acme.corp", "password": "AdminSecure2026!"})
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "access_token" in data
        assert data["user"]["email"] == "admin@acme.corp"

@pytest.mark.asyncio
async def test_api_services_list():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp = await client.get("/api/v1/services")
        assert resp.status_code == 200
        services = resp.json()["data"]
        assert len(services) >= 10
        assert any(s["id"] == "srv_web_audit_complete" for s in services)

@pytest.mark.asyncio
async def test_api_job_lifecycle():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # Submit a job
        job_req = {
            "service_id": "srv_web_audit_complete",
            "input_params": {"target_url": "https://example.com"}
        }
        create_resp = await client.post("/api/v1/jobs", json=job_req)
        assert create_resp.status_code == 200
        job_data = create_resp.json()["data"]
        job_id = job_data["job_id"]
        assert job_id.startswith("job_")
        
        # Get job status
        get_resp = await client.get(f"/api/v1/jobs/{job_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["data"]["id"] == job_id

@pytest.mark.asyncio
async def test_api_monitoring():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp = await client.get("/api/v1/monitoring/checks")
        assert resp.status_code == 200
        checks = resp.json()["data"]
        assert len(checks) >= 1

@pytest.mark.asyncio
async def test_api_data_cleanse():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        cleanse_req = {
            "dataset_name": "Test Customer Feed",
            "raw_data": [{"id": 1, "name": " Test ", "val": 10}, {"id": 1, "name": "Test", "val": 10}],
            "deduplicate": True
        }
        resp = await client.post("/api/v1/data/cleanse", json=cleanse_req)
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["results"]["cleaned_row_count"] == 1

@pytest.mark.asyncio
async def test_api_billing_summary():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp = await client.get("/api/v1/billing/summary")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "pricing_plans" in data
        assert "organization" in data
