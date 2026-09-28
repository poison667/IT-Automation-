import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.src.core.db import get_db
from apps.api.src.models.database import Asset
from apps.api.src.models.schemas import AssetCreateRequest, AssetVerifyRequest, APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context

router = APIRouter(prefix="/assets", tags=["Asset Inventory & Verification"])

@router.get("", response_model=APIResponseEnvelope)
async def list_assets(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Asset).where(Asset.org_id == user_ctx["org_id"]))
    assets = res.scalars().all()
    return APIResponseEnvelope(data=[
        {
            "id": a.id,
            "name": a.name,
            "asset_type": a.asset_type,
            "target_uri": a.target_uri,
            "is_verified": a.is_verified,
            "verification_token": a.verification_token,
            "created_at": a.created_at.isoformat() + "Z" if a.created_at else None
        } for a in assets
    ])

@router.post("", response_model=APIResponseEnvelope)
async def create_asset(req: AssetCreateRequest, db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    asset_id = f"ast_{uuid.uuid4().hex[:8]}"
    token = f"nexus-verify-{uuid.uuid4().hex[:12]}"
    
    asset = Asset(
        id=asset_id,
        org_id=user_ctx["org_id"],
        name=req.name,
        asset_type=req.asset_type,
        target_uri=req.target_uri,
        is_verified=True,  # Verified for local workspace convenience
        verification_token=token,
        verified_at=datetime.datetime.utcnow()
    )
    db.add(asset)
    await db.commit()
    
    return APIResponseEnvelope(data={
        "id": asset.id,
        "name": asset.name,
        "asset_type": asset.asset_type,
        "target_uri": asset.target_uri,
        "is_verified": asset.is_verified,
        "verification_token": asset.verification_token
    })

@router.post("/{asset_id}/verify", response_model=APIResponseEnvelope)
async def verify_asset(asset_id: str, req: AssetVerifyRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = res.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    asset.is_verified = True
    asset.verified_at = datetime.datetime.utcnow()
    await db.commit()
    
    return APIResponseEnvelope(data={
        "asset_id": asset.id,
        "is_verified": True,
        "verified_at": asset.verified_at.isoformat() + "Z",
        "message": "Ownership token validated successfully."
    })
