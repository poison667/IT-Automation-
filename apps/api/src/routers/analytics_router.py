from fastapi import APIRouter, Query
from apps.api.src.models.schemas import APIResponseEnvelope
from apps.api.src.engines.analytics_engine import AnalyticsEngine

router = APIRouter(prefix="/analytics", tags=["Grounded Business Telemetry"])

@router.get("/telemetry", response_model=APIResponseEnvelope)
async def get_telemetry(time_range_days: int = Query(30, ge=7, le=90)):
    data = AnalyticsEngine.generate_grounded_telemetry(time_range_days)
    return APIResponseEnvelope(data=data)
