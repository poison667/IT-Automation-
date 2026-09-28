import os

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Lightweight task runner configuration for distributed background execution
class WorkerQueueConfig:
    QUEUES = ["critical", "browser", "crawler", "data", "ai", "default"]
