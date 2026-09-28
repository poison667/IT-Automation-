from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.src.core.db import get_db
from apps.api.src.models.database import User, Organization
from apps.api.src.models.schemas import LoginRequest, AuthTokenResponse, APIResponseEnvelope
from apps.api.src.core.security import verify_password, create_access_token, get_current_user_context

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=APIResponseEnvelope)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == req.email))
    user = res.scalar_one_or_none()
    
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    org_res = await db.execute(select(Organization).where(Organization.id == user.org_id))
    org = org_res.scalar_one()
    
    token = create_access_token({
        "user_id": user.id,
        "org_id": user.org_id,
        "email": user.email,
        "role": user.role,
        "org_name": org.name
    })
    
    return APIResponseEnvelope(data={
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": 86400,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        },
        "organization": {
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "plan": org.plan,
            "credit_balance": org.credit_balance
        }
    })

@router.get("/me", response_model=APIResponseEnvelope)
async def get_me(user_ctx: dict = Depends(get_current_user_context), db: AsyncSession = Depends(get_db)):
    org_res = await db.execute(select(Organization).where(Organization.id == user_ctx["org_id"]))
    org = org_res.scalar_one_or_none()
    
    return APIResponseEnvelope(data={
        "user": user_ctx,
        "organization": {
            "id": org.id if org else user_ctx["org_id"],
            "name": org.name if org else user_ctx.get("org_name", "Nexus Workspace"),
            "plan": org.plan if org else "ENTERPRISE",
            "credit_balance": org.credit_balance if org else 5000
        }
    })
