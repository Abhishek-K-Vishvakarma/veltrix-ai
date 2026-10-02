from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.analysis_metric import AnalysisMetric

router = APIRouter(prefix="/ai-performance", tags=["admin: ai performance"])


def _pct(values: list[int], p: float) -> int:
    if not values:
        return 0
    values = sorted(values)
    return values[min(len(values) - 1, int(len(values) * p))]


@router.get("")
def ai_performance(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = db.scalars(
        select(AnalysisMetric).where(AnalysisMetric.created_at >= since).limit(50000)
    ).all()
    total = len(rows)
    ok = [r for r in rows if r.success]
    lat = [r.latency_ms for r in rows]
    daily: dict[str, dict] = {}
    for r in rows:
        d = daily.setdefault(
            r.created_at.date().isoformat(),
            {"requests": 0, "failures": 0, "latency_sum": 0},
        )
        d["requests"] += 1
        d["failures"] += 0 if r.success else 1
        d["latency_sum"] += r.latency_ms
    series = [
        {
            "date": k,
            "requests": v["requests"],
            "failures": v["failures"],
            "avg_latency_ms": int(v["latency_sum"] / v["requests"]),
        }
        for k, v in sorted(daily.items())
    ]
    conf = (
        db.scalar(
            select(func.avg(Analysis.confidence)).where(
                Analysis.created_at >= since, Analysis.status == "completed"
            )
        )
        or 0
    )
    return {
        "days": days,
        "total_requests": total,
        "successful": len(ok),
        "failed": total - len(ok),
        "success_rate": round(len(ok) / total * 100, 1) if total else 0,
        "avg_latency_ms": int(sum(lat) / total) if total else 0,
        "p95_latency_ms": _pct(lat, 0.95),
        "total_tokens": sum(r.prompt_tokens + r.completion_tokens for r in rows),
        "prompt_tokens": sum(r.prompt_tokens for r in rows),
        "completion_tokens": sum(r.completion_tokens for r in rows),
        "avg_confidence": round(float(conf), 1),
        "daily": series,
    }
