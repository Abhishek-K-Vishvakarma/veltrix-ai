from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.activity_log import ActivityLog
from app.models.analysis import Analysis
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["admin: dashboard"])


@router.get("")
def dashboard(db: Session = Depends(get_db)):
    count = lambda *where: db.scalar(select(func.count(Analysis.id)).where(*where)) or 0
    total = count()
    completed = count(Analysis.status == "completed")
    failed = count(Analysis.status == "failed")
    processing = count(Analysis.status.in_(["pending", "processing"]))
    avg_conf = (
        db.scalar(
            select(func.avg(Analysis.confidence)).where(Analysis.status == "completed")
        )
        or 0
    )
    avg_ms = (
        db.scalar(
            select(func.avg(Analysis.processing_time_ms)).where(
                Analysis.status == "completed"
            )
        )
        or 0
    )

    start = (datetime.now(timezone.utc) - timedelta(days=6)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    rows = db.execute(
        select(func.date(Analysis.created_at), func.count())
        .where(Analysis.created_at >= start)
        .group_by(func.date(Analysis.created_at))
    ).all()
    per_day = {str(d): c for d, c in rows}
    activity = []
    for i in range(7):
        day = (start + timedelta(days=i)).date().isoformat()
        activity.append({"date": day, "count": per_day.get(day, 0)})

    categories = [
        {"category": c, "count": n}
        for c, n in db.execute(
            select(Analysis.category, func.count())
            .group_by(Analysis.category)
            .order_by(func.count().desc())
        ).all()
    ]
    recent = db.scalars(
        select(Analysis)
        .options(joinedload(Analysis.user))
        .order_by(Analysis.created_at.desc())
        .limit(5)
    ).all()
    errors = db.scalars(
        select(ActivityLog)
        .where(ActivityLog.level == "error")
        .order_by(ActivityLog.created_at.desc())
        .limit(5)
    ).all()

    return {
        "users": {
            "total": db.scalar(select(func.count(User.id))) or 0,
            "active": db.scalar(
                select(func.count(User.id)).where(User.is_active.is_(True))
            )
            or 0,
            "admins": db.scalar(select(func.count(User.id)).where(User.role == "admin"))
            or 0,
        },
        "analyses": {
            "total": total,
            "completed": completed,
            "failed": failed,
            "in_progress": processing,
        },
        "avg_confidence": round(float(avg_conf), 1),
        "avg_processing_ms": int(avg_ms),
        "estimated_time_saved_hours": round(
            completed * 6 / 60, 1
        ),  # estimate: ~6 min saved per analysis
        "analysis_activity": activity,
        "categories": categories,
        "recent_analyses": [
            {
                "id": a.id,
                "title": a.title,
                "status": a.status,
                "confidence": a.confidence,
                "user_email": a.user.email if a.user else None,
                "created_at": a.created_at,
            }
            for a in recent
        ],
        "recent_errors": [
            {
                "id": e.id,
                "action": e.action,
                "detail": e.detail,
                "created_at": e.created_at,
            }
            for e in errors
        ],
    }
