from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta, timezone
from app.db.session import get_db
from app.models.activity_log import ActivityLog
from app.models.analysis import Analysis
from app.utils.response import paginate
from app.models.user import User
from app.services.activity_service import log_activity
from app.api.deps import require_admin

router = APIRouter(prefix="/logs", tags=["admin: logs"])


def _row(l: ActivityLog) -> dict:
    return {
        "id": l.id,
        "user_id": l.user_id,
        "user_email": l.user.email if l.user else None,
        "action": l.action,
        "resource": l.resource,
        "detail": l.detail,
        "level": l.level,
        "ip": l.ip,
        "created_at": l.created_at,
    }


@router.get("")
def list_logs(
    q: str | None = None,
    level: str | None = Query(None, pattern="^(info|warning|error)$"),
    action: str | None = None,
    user_id: int | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = (
        select(ActivityLog)
        .options(joinedload(ActivityLog.user))
        .order_by(ActivityLog.created_at.desc())
    )
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(ActivityLog.detail).like(like),
                func.lower(ActivityLog.action).like(like),
            )
        )
    if level:
        stmt = stmt.where(ActivityLog.level == level)
    if action:
        stmt = stmt.where(ActivityLog.action == action)
    if user_id:
        stmt = stmt.where(ActivityLog.user_id == user_id)
    return paginate(db, stmt, page, size, _row)


@router.get("/errors")
def error_monitoring(
    limit: int = Query(30, ge=1, le=200), db: Session = Depends(get_db)
):
    errors = db.scalars(
        select(ActivityLog)
        .options(joinedload(ActivityLog.user))
        .where(ActivityLog.level == "error")
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    ).all()
    failed = db.scalars(
        select(Analysis)
        .options(joinedload(Analysis.user))
        .where(Analysis.status == "failed")
        .order_by(Analysis.created_at.desc())
        .limit(limit)
    ).all()
    return {
        "error_logs": [_row(e) for e in errors],
        "failed_analyses": [
            {
                "id": a.id,
                "title": a.title,
                "error_message": a.error_message,
                "user_email": a.user.email if a.user else None,
                "created_at": a.created_at,
            }
            for a in failed
        ],
        "total_error_logs": db.scalar(
            select(func.count(ActivityLog.id)).where(ActivityLog.level == "error")
        )
        or 0,
        "total_failed_analyses": db.scalar(
            select(func.count(Analysis.id)).where(Analysis.status == "failed")
        )
        or 0,
    }


# --- file ke end mein ---
@router.delete("")
def cleanup_logs(
    older_than_days: int = Query(30, ge=1), 
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    deleted = db.execute(deleted(ActivityLog).where(ActivityLog.created_at < cutoff)
    ).rowcount
    db.commit()
    log_activity(
        db,
        admin.id,
        "admin.logs_cleanup",
        "activity_log",
        f"Deleted {deleted} logs older than {older_than_days} days",
        "warning",
    )
    return {"deleted": deleted}
