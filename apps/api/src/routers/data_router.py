import uuid
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.api.src.core.db import get_db
from apps.api.src.models.database import Dataset
from apps.api.src.models.schemas import DataCleansingRequest, APIResponseEnvelope
from apps.api.src.core.security import get_current_user_context
from apps.api.src.engines.data_engine import DataEngine

router = APIRouter(prefix="/data", tags=["Data Engineering Workbench"])

@router.post("/cleanse", response_model=APIResponseEnvelope)
async def cleanse_dataset(
    req: DataCleansingRequest,
    db: AsyncSession = Depends(get_db),
    user_ctx: dict = Depends(get_current_user_context)
):
    result = DataEngine.profile_and_cleanse_data(
        raw_rows=req.raw_data,
        deduplicate=req.deduplicate,
        null_strategy=req.null_strategy,
        trim_whitespace=req.trim_whitespace,
        normalize_dates=req.normalize_dates
    )
    
    # Save dataset record
    dataset_id = f"ds_{uuid.uuid4().hex[:8]}"
    ds = Dataset(
        id=dataset_id,
        org_id=user_ctx["org_id"],
        name=req.dataset_name,
        file_format="JSON",
        row_count=result["cleaned_row_count"],
        column_count=result["column_count"],
        storage_path=f"/storage/datasets/{dataset_id}.json",
        schema_json={"columns": result["column_profiles"]},
        profile_json=result,
        created_at=datetime.datetime.utcnow()
    )
    db.add(ds)
    await db.commit()
    
    return APIResponseEnvelope(data={
        "dataset_id": ds.id,
        "name": ds.name,
        "results": result
    })

@router.get("/datasets", response_model=APIResponseEnvelope)
async def list_datasets(db: AsyncSession = Depends(get_db), user_ctx: dict = Depends(get_current_user_context)):
    res = await db.execute(select(Dataset).where(Dataset.org_id == user_ctx["org_id"]))
    datasets = res.scalars().all()
    return APIResponseEnvelope(data=[
        {
            "id": d.id,
            "name": d.name,
            "file_format": d.file_format,
            "row_count": d.row_count,
            "column_count": d.column_count,
            "created_at": d.created_at.isoformat() + "Z" if d.created_at else None
        } for d in datasets
    ])
