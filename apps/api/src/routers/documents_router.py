import uuid
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.src.core.db import get_db
from apps.api.src.models.database import Document
from apps.api.src.models.schemas import DocumentExtractionRequest, APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context
from apps.api.src.engines.document_engine import DocumentEngine

router = APIRouter(prefix="/documents", tags=["Document Intelligence"])

@router.post("/extract", response_model=APIResponseEnvelope)
async def extract_document(
    req: DocumentExtractionRequest,
    db: AsyncSession = Depends(get_db),
    user_ctx: dict = Depends(get_current_user_context)
):
    result = DocumentEngine.extract_structured_document(req.raw_text, req.document_type)
    
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    doc = Document(
        id=doc_id,
        org_id=user_ctx["org_id"],
        name=req.document_name,
        mime_type="text/plain",
        page_count=1,
        storage_path=f"/storage/docs/{doc_id}.txt",
        text_content=req.raw_text,
        extracted_data_json=result,
        created_at=datetime.datetime.utcnow()
    )
    db.add(doc)
    await db.commit()
    
    return APIResponseEnvelope(data={
        "document_id": doc.id,
        "name": doc.name,
        "extraction": result
    })

@router.get("", response_model=APIResponseEnvelope)
async def list_documents(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Document).where(Document.org_id == user_ctx["org_id"]))
    docs = res.scalars().all()
    return APIResponseEnvelope(data=[
        {
            "id": d.id,
            "name": d.name,
            "mime_type": d.mime_type,
            "page_count": d.page_count,
            "extracted_data": d.extracted_data_json,
            "created_at": d.created_at.isoformat() + "Z" if d.created_at else None
        } for d in docs
    ])
