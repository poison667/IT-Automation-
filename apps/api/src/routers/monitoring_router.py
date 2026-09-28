import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from apps.api.src.core.db import get_db
from apps.api.src.models.database import MonitoringCheck, MonitoringPing, Incident
from apps.api.src.models.schemas import MonitoringCheckCreate, APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context
from apps.api.src.engines.monitoring_engine import MonitoringEngine

router = APIRouter(prefix="/monitoring", tags=["Continuous Telemetry & NOC"])

@router.get("/checks", response_model=APIResponseEnvelope)
async def list_checks(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(MonitoringCheck).where(MonitoringCheck.org_id == user_ctx["org_id"]))
    checks = res.scalars().all()
    return APIResponseEnvelope(data=[
        {
            "id": c.id,
            "name": c.name,
            "check_type": c.check_type,
            "target_url": c.target_url,
            "interval_seconds": c.interval_seconds,
            "status": c.status,
            "uptime_pct": c.uptime_pct,
            "latency_p95_ms": c.latency_p95_ms,
            "last_check_at": c.last_check_at.isoformat() + "Z" if c.last_check_at else None
        } for c in checks
    ])

@router.post("/checks", response_model=APIResponseEnvelope)
async def create_check(req: MonitoringCheckCreate, db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    check_id = f"chk_{uuid.uuid4().hex[:8]}"
    check = MonitoringCheck(
        id=check_id,
        org_id=user_ctx["org_id"],
        asset_id=req.asset_id,
        name=req.name,
        check_type=req.check_type,
        target_url=req.target_url,
        interval_seconds=req.interval_seconds,
        timeout_seconds=req.timeout_seconds,
        status="HEALTHY",
        uptime_pct=100.0,
        latency_p95_ms=45,
        last_check_at=datetime.datetime.utcnow()
    )
    db.add(check)
    await db.commit()
    return APIResponseEnvelope(data={"id": check.id, "name": check.name, "status": check.status})

@router.post("/checks/{check_id}/ping", response_model=APIResponseEnvelope)
async def trigger_manual_ping(check_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(MonitoringCheck).where(MonitoringCheck.id == check_id))
    check = res.scalar_one_or_none()
    if not check:
        raise HTTPException(status_code=404, detail="Monitoring check not found.")
        
    probe_result = await MonitoringEngine.execute_probe(check.target_url, check.timeout_seconds)
    
    # Save ping record
    ping = MonitoringPing(
        check_id=check.id,
        region="us-east-1",
        status_code=probe_result.get("status_code"),
        response_time_ms=probe_result.get("latency_ms", 50),
        is_successful=probe_result.get("is_successful", True),
        error_detail=probe_result.get("error_detail")
    )
    db.add(ping)
    
    # Update check status
    check.status = probe_result.get("status", "HEALTHY")
    check.latency_p95_ms = probe_result.get("latency_ms", 50)
    check.last_check_at = datetime.datetime.utcnow()
    await db.commit()
    
    return APIResponseEnvelope(data=probe_result)

@router.get("/incidents", response_model=APIResponseEnvelope)
async def list_incidents(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Incident).where(Incident.org_id == user_ctx["org_id"]).order_by(desc(Incident.started_at)))
    incidents = res.scalars().all()
    return APIResponseEnvelope(data=[
        {
            "id": i.id,
            "title": i.title,
            "severity": i.severity,
            "status": i.status,
            "root_cause": i.root_cause,
            "started_at": i.started_at.isoformat() + "Z" if i.started_at else None,
            "resolved_at": i.resolved_at.isoformat() + "Z" if i.resolved_at else None
        } for i in incidents
    ])
