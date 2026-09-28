import os
from pathlib import Path
from pydantic import BaseModel, ConfigDict

class Settings(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    PROJECT_NAME: str = "NexusIT Enterprise Digital Services Platform"
    VERSION: str = "2.0.0-PROD"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Host
    ENV: str = os.getenv("NEXUS_ENV", "production")
    HOST: str = os.getenv("NEXUS_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("NEXUS_PORT", "8000"))
    
    # Storage & DB
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DATA_DIR}/nexusit.db")
    STORAGE_DIR: Path = DATA_DIR / "storage"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nexusit-enterprise-secret-key-prod-2026-sha256")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Worker & Execution Limits
    MAX_CRAWL_PAGES: int = 100
    REQUEST_TIMEOUT_SECONDS: int = 30

settings = Settings()
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
