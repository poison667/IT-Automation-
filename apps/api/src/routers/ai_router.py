from fastapi import APIRouter
from apps.api.src.models.schemas import AIQueryRequest, APIResponseEnvelope
from apps.api.src.engines.ai_engine import AIEngine

router = APIRouter(prefix="/ai", tags=["Grounded AI Diagnostics"])

@router.post("/query", response_model=APIResponseEnvelope)
async def grounded_ai_query(req: AIQueryRequest):
    result = await AIEngine.investigate_asset(req.target_url, req.query)
    return APIResponseEnvelope(data=result)
