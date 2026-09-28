import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.src.core.db import get_db
from apps.api.src.models.database import Workflow, WorkflowExecution
from apps.api.src.models.schemas import WorkflowCreateRequest, APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context
from apps.api.src.engines.automation_engine import AutomationEngine

router = APIRouter(prefix="/automations", tags=["Workflow Automation Engine"])

@router.get("", response_model=APIResponseEnvelope)
async def list_workflows(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Workflow).where(Workflow.org_id == user_ctx["org_id"]))
    workflows = res.scalars().all()
    return APIResponseEnvelope(data=[
        {
            "id": w.id,
            "name": w.name,
            "description": w.description,
            "is_active": w.is_active,
            "trigger_type": w.trigger_type,
            "trigger_config": w.trigger_config_json,
            "steps": w.steps_json,
            "last_run_at": w.last_run_at.isoformat() + "Z" if w.last_run_at else None
        } for w in workflows
    ])

@router.post("", response_model=APIResponseEnvelope)
async def create_workflow(
    req: WorkflowCreateRequest,
    db: AsyncSession = Depends(get_db),
    user_ctx: dict = Depends(get_current_user_context)
):
    workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
    wf = Workflow(
        id=workflow_id,
        org_id=user_ctx["org_id"],
        name=req.name,
        description=req.description or "Automated operational pipeline",
        is_active=True,
        trigger_type=req.trigger_type,
        trigger_config_json=req.trigger_config,
        steps_json=req.steps,
        created_at=datetime.datetime.utcnow()
    )
    db.add(wf)
    await db.commit()
    return APIResponseEnvelope(data={"id": wf.id, "name": wf.name})

@router.post("/{workflow_id}/execute", response_model=APIResponseEnvelope)
async def execute_workflow_now(workflow_id: str, db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    wf = res.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found.")
        
    execution_result = await AutomationEngine.execute_workflow(
        workflow_id=wf.id,
        steps=wf.steps_json or [
            {"name": "Run Technical Web Crawl", "service_id": "srv_web_audit_complete"},
            {"name": "Profile Core Web Vitals", "service_id": "srv_perf_core_web_vitals"}
        ]
    )
    
    # Save execution record
    exec_id = f"exec_{uuid.uuid4().hex[:8]}"
    wf_exec = WorkflowExecution(
        id=exec_id,
        workflow_id=wf.id,
        org_id=user_ctx["org_id"],
        status=execution_result["status"],
        started_at=datetime.datetime.utcnow(),
        completed_at=datetime.datetime.utcnow(),
        execution_log_json=execution_result["execution_log"]
    )
    db.add(wf_exec)
    wf.last_run_at = datetime.datetime.utcnow()
    await db.commit()
    
    return APIResponseEnvelope(data=execution_result)
