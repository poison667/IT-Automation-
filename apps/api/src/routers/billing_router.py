import uuid
import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from apps.api.src.core.db import get_db
from apps.api.src.models.database import Organization, Invoice
from apps.api.src.models.schemas import APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context

router = APIRouter(prefix="/billing", tags=["Billing & Credit Subsystem"])

class CreditPurchaseRequest(BaseModel):
    package: str = "PRO_PACK_2500"  # STARTER_500, PRO_PACK_2500, ENTERPRISE_15000

@router.get("/summary", response_model=APIResponseEnvelope)
async def get_billing_summary(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Organization).where(Organization.id == user_ctx["org_id"]))
    org = res.scalar_one_or_none()
    
    inv_res = await db.execute(select(Invoice).where(Invoice.org_id == user_ctx["org_id"]).order_by(desc(Invoice.created_at)))
    invoices = inv_res.scalars().all()
    
    return APIResponseEnvelope(data={
        "organization": {
            "name": org.name if org else "Enterprise Workspace",
            "plan": org.plan if org else "ENTERPRISE",
            "credit_balance": org.credit_balance if org else 4850
        },
        "pricing_plans": [
            {"id": "STARTER", "name": "Starter Operations", "price_usd": 99, "credits": 500, "assets_limit": 5},
            {"id": "PROFESSIONAL", "name": "Professional Ops", "price_usd": 299, "credits": 2500, "assets_limit": 25},
            {"id": "ENTERPRISE", "name": "Global Enterprise", "price_usd": 999, "credits": 15000, "assets_limit": "Unlimited"}
        ],
        "invoices": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "amount_cents": inv.amount_cents,
                "currency": inv.currency,
                "status": inv.status,
                "credits_purchased": inv.credits_purchased,
                "created_at": inv.created_at.isoformat() + "Z" if inv.created_at else None
            } for inv in invoices
        ]
    })

@router.post("/purchase-credits", response_model=APIResponseEnvelope)
async def purchase_credits(req: CreditPurchaseRequest, db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    credits_map = {
        "STARTER_500": (500, 9900),
        "PRO_PACK_2500": (2500, 29900),
        "ENTERPRISE_15000": (15000, 99900)
    }
    credits, amount = credits_map.get(req.package, (2500, 29900))
    
    res = await db.execute(select(Organization).where(Organization.id == user_ctx["org_id"]))
    org = res.scalar_one_or_none()
    if org:
        org.credit_balance += credits
        
    inv = Invoice(
        id=f"inv_{uuid.uuid4().hex[:8]}",
        org_id=user_ctx["org_id"],
        amount_cents=amount,
        currency="USD",
        status="PAID",
        credits_purchased=credits,
        invoice_number=f"INV-2026-NEXUS-{uuid.uuid4().hex[:4].upper()}",
        created_at=datetime.datetime.utcnow()
    )
    db.add(inv)
    await db.commit()
    
    return APIResponseEnvelope(data={
        "new_balance": org.credit_balance if org else 5000,
        "credits_added": credits,
        "invoice_number": inv.invoice_number
    })
