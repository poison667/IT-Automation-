import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from apps.api.src.core.config import settings
from apps.api.src.core.db import init_db
from apps.api.src.routers import (
    auth_router,
    services_router,
    jobs_router,
    assets_router,
    monitoring_router,
    data_router,
    documents_router,
    analytics_router,
    ai_router,
    automations_router,
    reports_router,
    billing_router,
    admin_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & Seed Initial Service Catalog
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous IT & Digital Services Engine API",
    lifespan=lifespan
)

# CORS Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router.router, prefix=api_v1)
app.include_router(services_router.router, prefix=api_v1)
app.include_router(jobs_router.router, prefix=api_v1)
app.include_router(assets_router.router, prefix=api_v1)
app.include_router(monitoring_router.router, prefix=api_v1)
app.include_router(data_router.router, prefix=api_v1)
app.include_router(documents_router.router, prefix=api_v1)
app.include_router(analytics_router.router, prefix=api_v1)
app.include_router(ai_router.router, prefix=api_v1)
app.include_router(automations_router.router, prefix=api_v1)
app.include_router(reports_router.router, prefix=api_v1)
app.include_router(billing_router.router, prefix=api_v1)
app.include_router(admin_router.router, prefix=api_v1)

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "platform": "NexusIT OmniOps Core",
        "version": settings.VERSION,
        "environment": settings.ENV
    }

# Mount Static Frontend Bundle if present
dist_dir = Path(__file__).resolve().parent.parent.parent / "desktop" / "dist"
assets_dir = dist_dir / "assets"

if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/{full_path:path}")
async def serve_spa_frontend(request: Request, full_path: str):
    if full_path.startswith("api/") or full_path == "health" or full_path == "api/health":
        return {"error": "Not Found", "status": 404}
    
    index_path = dist_dir / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {
        "platform": "NexusIT Enterprise Autonomous Engine",
        "message": "API is online. Frontend bundle is compiling."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.src.main:app", host=settings.HOST, port=settings.PORT, reload=False)
