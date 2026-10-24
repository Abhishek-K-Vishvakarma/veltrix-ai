from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.config import settings
from app.db.session import get_db
from app.llm.gemini_client import get_active_model, set_active_model
from app.models.analysis_metric import AnalysisMetric
from app.models.user import User
from app.services.activity_service import log_activity

router = APIRouter(prefix="/models", tags=["admin: models"])


class ActiveModel(BaseModel):
    model: str = Field(pattern=r"^gemini-[A-Za-z0-9._-]+$")


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
        "active_model": get_active_model(),
        "configured_model": getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
        "api_key_configured": bool(settings.GEMINI_API_KEY),
        "mock_mode": not settings.GEMINI_API_KEY,
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


@router.put("/active")
def set_active(
    body: ActiveModel,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Switch the model used for new analyses. Resets to GEMINI_MODEL (.env) on server restart."""
    set_active_model(body.model)
    log_activity(
        db,
        admin.id,
        "admin.model_switch",
        "model",
        f"Active model -> {body.model}",
        "warning",
    )
    return {"active_model": get_active_model()}
