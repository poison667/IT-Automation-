from typing import Any, Dict, List, Optional
import datetime
from pydantic import BaseModel, Field

class APIResponseEnvelope(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    error: Optional[str] = None
    meta: Dict[str, Any] = Field(default_factory=lambda: {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "version": "2.0.0-PROD"
    })

# Auth
class LoginRequest(BaseModel):
    email: str
    password: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int
    user: Dict[str, Any]
    organization: Dict[str, Any]

# Assets
class AssetCreateRequest(BaseModel):
    name: str
    asset_type: str = "URL"  # URL, DOMAIN, API_ENDPOINT, DATASET
    target_uri: str

class AssetVerifyRequest(BaseModel):
    verification_method: str = "HTTP_TOKEN"  # HTTP_TOKEN, DNS_TXT

# Services & Jobs
class JobCreateRequest(BaseModel):
    service_id: str
    asset_id: Optional[str] = None
    input_params: Dict[str, Any] = Field(default_factory=dict)

class JobStatusResponse(BaseModel):
    id: str
    org_id: str
    service_id: str
    asset_id: Optional[str]
    status: str
    progress_pct: int
    current_stage: str
    input_params: Dict[str, Any]
    output_data: Optional[Dict[str, Any]]
    error_message: Optional[str]
    raw_artifact_url: Optional[str]
    execution_cost: int
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime]

class JobLogEntry(BaseModel):
    timestamp: str
    level: str
    message: str
    metadata: Optional[Dict[str, Any]] = None

# Monitoring
class MonitoringCheckCreate(BaseModel):
    asset_id: Optional[str] = None
    name: str
    check_type: str = "HTTP"
    target_url: str
    interval_seconds: int = 60
    timeout_seconds: int = 10

class MonitoringPingTrigger(BaseModel):
    check_id: str

# Data Cleansing
class DataCleansingRequest(BaseModel):
    dataset_name: str
    raw_data: List[Dict[str, Any]]
    deduplicate: bool = True
    null_strategy: str = "FILL_DEFAULT"  # DROP, FILL_DEFAULT, FILL_FORWARD
    trim_whitespace: bool = True
    normalize_dates: bool = True

# Document Extraction
class DocumentExtractionRequest(BaseModel):
    document_name: str
    document_type: str = "INVOICE"
    raw_text: str

# AI Grounded Query
class AIQueryRequest(BaseModel):
    target_url: str
    query: str

# Workflow
class WorkflowCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str = "CRON"
    trigger_config: Dict[str, Any] = Field(default_factory=dict)
    steps: List[Dict[str, Any]] = Field(default_factory=list)
