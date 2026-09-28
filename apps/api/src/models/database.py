import datetime
from typing import Optional
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    plan = Column(String(50), default="ENTERPRISE")  # STARTER, PROFESSIONAL, ENTERPRISE
    credit_balance = Column(Integer, default=5000)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="OWNER")  # OWNER, ADMIN, ENGINEER, VIEWER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    asset_type = Column(String(50), default="URL")  # URL, DOMAIN, API_ENDPOINT, DATASET
    target_uri = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=True)
    verification_token = Column(String(100), nullable=False)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ServiceDefinition(Base):
    __tablename__ = "service_definitions"
    
    id = Column(String(100), primary_key=True)
    category = Column(String(50), nullable=False)  # WEBSITE, SEO, PERF, A11Y, SEC, DATA, DOC, AI, BI
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    tier = Column(String(50), default="STANDARD")
    cost_credits = Column(Integer, default=5)
    estimated_runtime_sec = Column(Integer, default=30)
    authorization_required = Column(Boolean, default=False)
    inputs_schema = Column(JSON, default=dict)
    outputs_schema = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    service_id = Column(String(100), ForeignKey("service_definitions.id"), nullable=False)
    asset_id = Column(String(50), ForeignKey("assets.id"), nullable=True)
    status = Column(String(50), default="QUEUED")  # QUEUED, RUNNING, ANALYZING, QUALITY_CHECK, COMPLETED, FAILED, CANCELLED
    progress_pct = Column(Integer, default=0)
    current_stage = Column(String(100), default="INITIALIZING")
    input_params = Column(JSON, default=dict)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    raw_artifact_url = Column(Text, nullable=True)
    execution_cost = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

class JobLog(Base):
    __tablename__ = "job_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    level = Column(String(20), default="INFO")  # INFO, DEBUG, WARN, ERROR
    message = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String(50), primary_key=True)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    summary_json = Column(JSON, default=dict)
    pdf_storage_path = Column(Text, nullable=True)
    integrity_sha256 = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MonitoringCheck(Base):
    __tablename__ = "monitoring_checks"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    asset_id = Column(String(50), ForeignKey("assets.id"), nullable=True)
    name = Column(String(255), nullable=False)
    check_type = Column(String(50), default="HTTP")  # HTTP, SSL, DNS, DOM, API
    target_url = Column(Text, nullable=False)
    interval_seconds = Column(Integer, default=60)
    timeout_seconds = Column(Integer, default=10)
    status = Column(String(50), default="HEALTHY")  # HEALTHY, DEGRADED, DOWN, PAUSED
    last_check_at = Column(DateTime, nullable=True)
    uptime_pct = Column(Float, default=100.0)
    latency_p95_ms = Column(Integer, default=45)
    config_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MonitoringPing(Base):
    __tablename__ = "monitoring_pings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    check_id = Column(String(50), ForeignKey("monitoring_checks.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    region = Column(String(50), default="us-east-1")
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=False)
    is_successful = Column(Boolean, default=True)
    error_detail = Column(Text, nullable=True)

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    check_id = Column(String(50), ForeignKey("monitoring_checks.id"), nullable=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(50), default="CRITICAL")  # CRITICAL, MAJOR, MINOR
    status = Column(String(50), default="TRIGGERED")  # TRIGGERED, ACKNOWLEDGED, RESOLVED
    root_cause = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    timeline_json = Column(JSON, default=list)

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    file_format = Column(String(20), default="CSV")
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    storage_path = Column(Text, nullable=False)
    schema_json = Column(JSON, default=dict)
    profile_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    mime_type = Column(String(100), default="application/pdf")
    page_count = Column(Integer, default=1)
    storage_path = Column(Text, nullable=False)
    text_content = Column(Text, nullable=True)
    extracted_data_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    trigger_type = Column(String(50), default="CRON")  # CRON, WEBHOOK, THRESHOLD, FILE
    trigger_config_json = Column(JSON, default=dict)
    steps_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_run_at = Column(DateTime, nullable=True)

class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"
    
    id = Column(String(50), primary_key=True)
    workflow_id = Column(String(50), ForeignKey("workflows.id"), nullable=False)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    status = Column(String(50), default="COMPLETED")  # RUNNING, COMPLETED, FAILED
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    execution_log_json = Column(JSON, default=list)

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    amount_cents = Column(Integer, default=29900)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="PAID")
    credits_purchased = Column(Integer, default=2500)
    invoice_number = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(50), primary_key=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(50), nullable=True)
    details_json = Column(JSON, default=dict)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
