from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    user_id: int | None,
    action: str,
    resource: str = "",
    detail: str = "",
    level: str = "info",
    ip: str | None = None,
) -> None:
    db.add(
        ActivityLog(
            user_id=user_id,
            action=action,
            resource=resource,
            detail=detail,
            level=level,
            ip=ip,
        )
    )
    db.commit()
