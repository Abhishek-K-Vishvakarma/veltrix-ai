from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
)
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload
from app.services.analysis_service import (
    create_analysis,
    read_uploads,
    reset_for_retry,
    run_pipeline,
)

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.services.activity_service import log_activity
from app.utils.response import paginate

router = APIRouter(prefix="/analyses", tags=["admin: analyses"])


def _row(a: Analysis) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "category": a.category,
        "input_type": a.input_type,
        "status": a.status,
        "confidence": a.confidence,
        "processing_time_ms": a.processing_time_ms,
        "created_at": a.created_at,
        "user_id": a.user_id,
        "user_email": a.user.email if a.user else None,
    }


@router.get("")
def list_analyses(
    q: str | None = None,
    status: str | None = None,
    category: str | None = None,
    user_id: int | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Analysis)
        .options(joinedload(Analysis.user))
        .order_by(Analysis.created_at.desc())
    )
    if q:
        stmt = stmt.where(func.lower(Analysis.title).like(f"%{q.lower()}%"))
    if status:
        stmt = stmt.where(Analysis.status == status)
    if category:
        stmt = stmt.where(Analysis.category == category)
    if user_id:
        stmt = stmt.where(Analysis.user_id == user_id)
    return paginate(db, stmt, page, size, _row)


@router.get("/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    a = db.scalar(
        select(Analysis)
        .where(Analysis.id == analysis_id)
        .options(
            joinedload(Analysis.user),
            selectinload(Analysis.findings),
            selectinload(Analysis.action_plans),
            selectinload(Analysis.reasoning_logs),
            selectinload(Analysis.evidence),
        )
    )
    if not a:
        raise HTTPException(404, "Analysis not found")
    return {
        **_row(a),
        "summary": a.summary,
        "error_message": a.error_message,
        "completed_at": a.completed_at,
        "findings": [
            {
                "id": f.id,
                "title": f.title,
                "description": f.description,
                "source": f.source,
                "confidence": f.confidence,
            }
            for f in a.findings
        ],
        "actions": [
            {
                "id": x.id,
                "action": x.action,
                "priority": x.priority,
                "is_done": x.is_done,
            }
            for x in a.action_plans
        ],
        "reasoning_logs": [
            {
                "id": l.id,
                "step": l.step,
                "message": l.message,
                "status": l.status,
                "duration_ms": l.duration_ms,
                "created_at": l.created_at,
            }
            for l in a.reasoning_logs
        ],
        "evidence_files": [
            {
                "id": e.id,
                "filename": e.filename,
                "content_type": e.content_type,
                "size_bytes": e.size_bytes,
            }
            for e in a.evidence
        ],
    }


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    a = db.get(Analysis, analysis_id)
    if not a:
        raise HTTPException(404, "Analysis not found")
    title = a.title
    db.delete(a)
    db.commit()
    log_activity(
        db,
        admin.id,
        "admin.analysis_delete",
        "analysis",
        f"Deleted analysis #{analysis_id} ({title})",
        "warning",
    )
    return {"message": "Analysis deleted"}


@router.post("", status_code=202)
async def admin_create_analysis(
    bg: BackgroundTasks,
    problem: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """AI Playground: admin runs an analysis (owned by the admin) to test prompts/models."""
    a = create_analysis(db, admin, problem, await read_uploads(files))
    bg.add_task(run_pipeline, a.id)
    return {"id": a.id, "status": a.status}


@router.post("/{analysis_id}/retry", status_code=202)
def retry_analysis(
    analysis_id: int,
    bg: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    a = db.get(Analysis, analysis_id)
    if not a:
        raise HTTPException(404, "Analysis not found")
    if a.status == "processing":
        raise HTTPException(409, "Analysis is already running")
    reset_for_retry(db, a)
    log_activity(
        db,
        admin.id,
        "admin.analysis_retry",
        "analysis",
        f"Retried analysis #{analysis_id}",
    )
    bg.add_task(run_pipeline, a.id)
    return {"id": a.id, "status": "processing"}
