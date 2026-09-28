import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from apps.api.src.core.db import get_db
from apps.api.src.models.database import Report
from apps.api.src.models.schemas import APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context

router = APIRouter(prefix="/reports", tags=["Enterprise Reports & Evidence Vault"])

@router.get("", response_model=APIResponseEnvelope)
async def list_reports(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Report).where(Report.org_id == user_ctx["org_id"]).order_by(desc(Report.created_at)))
    reports = res.scalars().all()
    return APIResponseEnvelope(data=[
        {
            "id": r.id,
            "job_id": r.job_id,
            "title": r.title,
            "category": r.category,
            "summary": r.summary_json,
            "integrity_sha256": r.integrity_sha256,
            "created_at": r.created_at.isoformat() + "Z" if r.created_at else None
        } for r in reports
    ])

@router.get("/{report_id}/download")
async def download_report_pdf(report_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Report).where(Report.id == report_id))
    r = res.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    if not r.pdf_storage_path or not os.path.exists(r.pdf_storage_path):
        raise HTTPException(status_code=404, detail="PDF artifact has expired or was not found in storage.")
        
    return FileResponse(
        path=r.pdf_storage_path,
        filename=f"NexusIT_Report_{r.job_id}.pdf",
        media_type="application/pdf"
    )
