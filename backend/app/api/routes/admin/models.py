from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.analysis_metric import AnalysisMetric

router = APIRouter(prefix="/models", tags=["admin: models"])


@router.get("")
def models(db: Session = Depends(get_db)):
    rows = db.execute(
        select(
            AnalysisMetric.model_name,
            func.count(),
            func.sum(case((AnalysisMetric.success.is_(True), 1), else_=0)),
            func.avg(AnalysisMetric.latency_ms),
            func.sum(AnalysisMetric.prompt_tokens + AnalysisMetric.completion_tokens),
            func.max(AnalysisMetric.created_at),
        )
        .group_by(AnalysisMetric.model_name)
        .order_by(func.count().desc())
    ).all()
    return {
        "provider": "Google Gemini",
        "configured_model": getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
        "api_key_configured": bool(settings.GEMINI_API_KEY),
        "usage": [
            {
                "model": m,
                "requests": n,
                "success_rate": round((s or 0) / n * 100, 1),
                "avg_latency_ms": int(lat or 0),
                "total_tokens": int(tok or 0),
                "last_used": last,
            }
            for m, n, s, lat, tok, last in rows
        ],
    }
