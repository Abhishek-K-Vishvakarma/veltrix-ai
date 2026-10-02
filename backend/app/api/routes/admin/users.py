from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.security import hash_password
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.user import AdminUserCreate, AdminUserUpdate, PasswordReset, UserOut
from app.services.activity_service import log_activity
from app.utils.response import paginate

router = APIRouter(prefix="/users", tags=["admin: users"])


def _get(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.get("")
def list_users(
    q: str | None = None,
    role: str | None = Query(None, pattern="^(user|admin)$"),
    is_active: bool | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(User).order_by(User.created_at.desc())
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(User.email).like(like), func.lower(User.full_name).like(like)
            )
        )
    if role:
        stmt = stmt.where(User.role == role)
    if is_active is not None:
        stmt = stmt.where(User.is_active.is_(is_active))
    res = paginate(
        db,
        stmt,
        page,
        size,
        lambda u: UserOut.model_validate(u).model_dump(mode="json"),
    )
    ids = [u["id"] for u in res["items"]]
    counts = (
        dict(
            db.execute(
                select(Analysis.user_id, func.count())
                .where(Analysis.user_id.in_(ids))
                .group_by(Analysis.user_id)
            ).all()
        )
        if ids
        else {}
    )
    for u in res["items"]:
        u["analysis_count"] = counts.get(u["id"], 0)
    return res


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = _get(db, user_id)
    stats = db.execute(
        select(func.count(Analysis.id), func.avg(Analysis.confidence)).where(
            Analysis.user_id == user_id
        )
    ).one()
    return {
        **UserOut.model_validate(user).model_dump(mode="json"),
        "analysis_count": stats[0],
        "avg_confidence": round(float(stats[1] or 0), 1),
    }


@router.post("", response_model=UserOut, status_code=201)
def create_user(
    body: AdminUserCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "Email already registered")
    user = User(
        email=email,
        full_name=body.full_name,
        role=body.role,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_activity(
        db, admin.id, "admin.user_create", "user", f"Created {email} ({body.role})"
    )
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    body: AdminUserUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = _get(db, user_id)
    if user.id == admin.id and (
        body.is_active is False or (body.role and body.role != "admin")
    ):
        raise HTTPException(400, "You cannot deactivate or demote yourself")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    log_activity(
        db,
        admin.id,
        "admin.user_update",
        "user",
        f"Updated {user.email}: {body.model_dump(exclude_unset=True)}",
    )
    return user


@router.post("/{user_id}/reset-password")
def reset_password(
    user_id: int,
    body: PasswordReset,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = _get(db, user_id)
    user.hashed_password = hash_password(body.new_password)
    db.commit()
    log_activity(
        db,
        admin.id,
        "admin.password_reset",
        "user",
        f"Reset password for {user.email}",
        "warning",
    )
    return {"message": "Password updated"}


@router.delete("/{user_id}")
def delete_user(
    user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    user = _get(db, user_id)
    if user.id == admin.id:
        raise HTTPException(400, "You cannot delete yourself")
    email = user.email
    db.delete(user)
    db.commit()
    log_activity(
        db, admin.id, "admin.user_delete", "user", f"Deleted {email}", "warning"
    )
    return {"message": "User deleted"}
