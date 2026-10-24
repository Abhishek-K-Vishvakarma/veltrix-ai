from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.knowledge_source import KnowledgeSource
from app.models.user import User
from app.services.activity_service import log_activity
from app.utils.response import paginate

router = APIRouter(prefix="/knowledge-sources", tags=["admin: knowledge"])


@router.get("")
def list_sources(
    q: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = (
        select(KnowledgeSource)
        .options(joinedload(KnowledgeSource.owner))
        .order_by(KnowledgeSource.created_at.desc())
    )
    if q:
        stmt = stmt.where(func.lower(KnowledgeSource.name).like(f"%{q.lower()}%"))
    if status:
        stmt = stmt.where(KnowledgeSource.status == status)
    return paginate(
        db,
        stmt,
        page,
        size,
        lambda s: {
            "id": s.id,
            "name": s.name,
            "source_type": s.source_type,
            "status": s.status,
            "chunk_count": s.chunk_count,
            "size_bytes": s.size_bytes,
            "owner_email": s.owner.email if s.owner else None,
            "created_at": s.created_at,
        },
    )


@router.delete("/{source_id}")
def delete_source(
    source_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    s = db.get(KnowledgeSource, source_id)
    if not s:
        raise HTTPException(404, "Knowledge source not found")
    name = s.name
    db.delete(s)
    db.commit()
    log_activity(
        db,
        admin.id,
        "admin.knowledge_delete",
        "knowledge_source",
        f"Deleted {name}",
        "warning",
    )
    return {"message": "Knowledge source deleted"}
