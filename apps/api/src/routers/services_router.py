from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.src.core.db import get_db
from apps.api.src.models.database import ServiceDefinition
from apps.api.src.models.schemas import APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context

router = APIRouter(prefix="/services", tags=["Service Marketplace"])

@router.get("", response_model=APIResponseEnvelope)
async def list_services(
    category: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user_ctx: dict = Depends(get_current_user_context)
):
    query = select(ServiceDefinition).where(ServiceDefinition.is_active == True)
    if category:
        query = query.where(ServiceDefinition.category == category.upper())
    if tier:
        query = query.where(ServiceDefinition.tier == tier.upper())
        
    res = await db.execute(query)
    services = res.scalars().all()
    
    return APIResponseEnvelope(data=[
        {
            "id": s.id,
            "category": s.category,
            "name": s.name,
            "description": s.description,
            "tier": s.tier,
            "cost_credits": s.cost_credits,
            "estimated_runtime_sec": s.estimated_runtime_sec,
            "authorization_required": s.authorization_required,
            "inputs_schema": s.inputs_schema
        } for s in services
    ])

@router.get("/{service_id}", response_model=APIResponseEnvelope)
async def get_service(service_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(ServiceDefinition).where(ServiceDefinition.id == service_id))
    s = res.scalar_one_or_none()
    if not s:
        return APIResponseEnvelope(success=False, error="Service not found", data=None)
    return APIResponseEnvelope(data={
        "id": s.id,
        "category": s.category,
        "name": s.name,
        "description": s.description,
        "tier": s.tier,
        "cost_credits": s.cost_credits,
        "estimated_runtime_sec": s.estimated_runtime_sec,
        "authorization_required": s.authorization_required,
        "inputs_schema": s.inputs_schema
    })
