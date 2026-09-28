import asyncio
import uuid
import datetime
import json
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from apps.api.src.core.db import get_db, AsyncSessionLocal
from apps.api.src.models.database import Job, ServiceDefinition, Organization, Asset
from apps.api.src.models.schemas import JobCreateRequest, APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context
from apps.api.src.services.job_manager import JobManager, get_job_event_queue

router = APIRouter(prefix="/jobs", tags=["Job Execution"])

@router.post("", response_model=APIResponseEnvelope)
async def submit_job(
    req: JobCreateRequest,
    db: AsyncSession = Depends(get_db),
    user_ctx: dict = Depends(get_current_user_context)
):
    org_id = user_ctx["org_id"]
    
    # 1. Fetch Service Definition
    res = await db.execute(select(ServiceDefinition).where(ServiceDefinition.id == req.service_id))
    service = res.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Requested service definition not found.")

    # 2. Check Credit Balance
    org_res = await db.execute(select(Organization).where(Organization.id == org_id))
    org = org_res.scalar_one_or_none()
    if org and org.credit_balance < service.cost_credits:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Required: {service.cost_credits}, Available: {org.credit_balance}."
        )

    # 3. Authorization Check if Required
    if service.authorization_required and req.asset_id:
        ast_res = await db.execute(select(Asset).where(Asset.id == req.asset_id))
        asset = ast_res.scalar_one_or_none()
        if asset and not asset.is_verified:
            raise HTTPException(
                status_code=403,
                detail=f"Target asset '{asset.name}' is not verified. Defensive audits require domain verification."
            )

    # 4. Deduct credits
    if org:
        org.credit_balance -= service.cost_credits

    # 5. Create Job Record
    job_id = f"job_{uuid.uuid4().hex[:10]}"
    job = Job(
        id=job_id,
        org_id=org_id,
        service_id=service.id,
        asset_id=req.asset_id,
        status="QUEUED",
        progress_pct=5,
        current_stage="VALIDATING_PARAMETERS",
        input_params=req.input_params,
        execution_cost=service.cost_credits,
        created_at=datetime.datetime.utcnow()
    )
    db.add(job)
    await db.commit()

    # 6. Dispatch Background Task Asynchronously
    asyncio.create_task(JobManager.run_job_pipeline(job_id, AsyncSessionLocal))

    return APIResponseEnvelope(data={
        "job_id": job.id,
        "service_id": service.id,
        "service_name": service.name,
        "status": "QUEUED",
        "progress_pct": 5,
        "execution_cost": service.cost_credits,
        "stream_url": f"/api/v1/jobs/{job.id}/stream"
    })

@router.get("", response_model=APIResponseEnvelope)
async def list_jobs(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user_ctx: dict = Depends(get_current_user_context)
):
    query = select(Job).where(Job.org_id == user_ctx["org_id"]).order_by(desc(Job.created_at)).limit(limit)
    if status_filter:
        query = query.where(Job.status == status_filter.upper())
        
    res = await db.execute(query)
    jobs = res.scalars().all()
    
    return APIResponseEnvelope(data=[
        {
            "id": j.id,
            "service_id": j.service_id,
            "asset_id": j.asset_id,
            "status": j.status,
            "progress_pct": j.progress_pct,
            "current_stage": j.current_stage,
            "execution_cost": j.execution_cost,
            "input_params": j.input_params,
            "output_data": j.output_data,
            "error_message": j.error_message,
            "created_at": j.created_at.isoformat() + "Z" if j.created_at else None,
            "completed_at": j.completed_at.isoformat() + "Z" if j.completed_at else None
        } for j in jobs
    ])

@router.get("/{job_id}", response_model=APIResponseEnvelope)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Job).where(Job.id == job_id))
    j = res.scalar_one_or_none()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found.")
        
    return APIResponseEnvelope(data={
        "id": j.id,
        "service_id": j.service_id,
        "asset_id": j.asset_id,
        "status": j.status,
        "progress_pct": j.progress_pct,
        "current_stage": j.current_stage,
        "execution_cost": j.execution_cost,
        "input_params": j.input_params,
        "output_data": j.output_data,
        "error_message": j.error_message,
        "created_at": j.created_at.isoformat() + "Z" if j.created_at else None,
        "completed_at": j.completed_at.isoformat() + "Z" if j.completed_at else None
    })

@router.get("/{job_id}/stream")
async def stream_job_logs(job_id: str):
    queue = get_job_event_queue(job_id)
    
    async def event_generator():
        # Emit initial connected state
        yield f"data: {json.dumps({'message': 'Connected to live job event stream', 'stage': 'CONNECTING', 'progress_pct': 5})}\n\n"
        
        while True:
            try:
                # Wait for next event or timeout to send heartbeat
                event = await asyncio.wait_for(queue.get(), timeout=15.0)
                yield f"data: {json.dumps(event)}\n\n"
                if event.get("stage") in ["COMPLETED", "FAILED"]:
                    break
            except asyncio.TimeoutError:
                # Keepalive ping
                yield f": ping\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
