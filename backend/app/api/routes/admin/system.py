import platform
import sys
import time
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import (
    ActivityLog,
    Analysis,
    Document,
    EvidenceFile,
    KnowledgeSource,
    User,
)

router = APIRouter(prefix="/system", tags=["admin: system"])
STARTED_AT = time.time()


@router.get("/health")
def system_health(db: Session = Depends(get_db)):
    t0 = time.perf_counter()
    try:
        db.execute(text("SELECT 1"))
        database = {
            "status": "ok",
            "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
        }
    except Exception as exc:  # noqa: BLE001
        database = {"status": "error", "detail": str(exc)[:200]}
    return {
        "api": "ok",
        "database": database,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "uptime_seconds": int(time.time() - STARTED_AT),
        "python": sys.version.split()[0],
        "platform": platform.platform(),
    }


@router.get("/metrics")
def system_metrics(db: Session = Depends(get_db)):
    count = lambda model: db.scalar(select(func.count(model.id))) or 0
    upload_dir = Path(getattr(settings, "UPLOAD_DIR", "uploads"))
    storage = (
        sum(f.stat().st_size for f in upload_dir.rglob("*") if f.is_file())
        if upload_dir.exists()
        else 0
    )
    return {
        "counts": {
            "users": count(User),
            "analyses": count(Analysis),
            "evidence_files": count(EvidenceFile),
            "documents": count(Document),
            "knowledge_sources": count(KnowledgeSource),
            "activity_logs": count(ActivityLog),
        },
        "storage_bytes": storage,
        "storage_mb": round(storage / 1024 / 1024, 2),
    }


@router.get("/settings")
def system_settings():
    """Read-only, non-secret configuration."""
    return {
        "frontend_url": settings.FRONTEND_URL,
        "access_token_minutes": settings.ACCESS_TOKEN_MINUTES,
        "gemini_model": getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "upload_dir": str(getattr(settings, "UPLOAD_DIR", "uploads")),
    }
