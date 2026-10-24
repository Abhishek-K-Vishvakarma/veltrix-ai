import asyncio
import json
from pathlib import Path
from typing import Literal

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
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import SessionLocal, get_db
from app.models.action_plan import ActionPlan
from app.models.analysis import Analysis
from app.models.evidence_file import EvidenceFile
from app.models.finding import Finding
from app.models.reasoning_log import ReasoningLog
from app.models.user import User
from app.services.activity_service import log_activity
from app.services.analysis_service import (
    analysis_detail,
    analysis_row,
    create_analysis,
    get_owned,
    read_uploads,
    run_pipeline,
)
from app.services.knowledge_service import get_indexed_document_evidence
from app.utils.response import paginate

router = APIRouter(prefix="/analyses", tags=["analyses"])


class ActionToggle(BaseModel):
    is_done: bool


def _insight_type(text: str) -> str:
    value = text.casefold()
    if any(
        term in value
        for term in (
            "risk",
            "decline",
            "decrease",
            "loss",
            "issue",
            "anomal",
            "concern",
            "missing",
        )
    ):
        return "RISK"
    if any(
        term in value
        for term in ("opportun", "growth", "improv", "increase", "potential", "optimiz")
    ):
        return "OPPORTUNITY"
    if any(
        term in value for term in ("recommend", "should", "action", "next step")
    ):
        return "RECOMMENDATION"
    return "TREND"


@router.get("/insights")
def get_insights(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return findings and recommendations from this user's completed analyses."""
    completed_statuses = ("completed", "partial")
    findings = db.execute(
        select(Finding, Analysis)
        .join(Analysis, Analysis.id == Finding.analysis_id)
        .where(
            Analysis.user_id == user.id,
            Analysis.status.in_(completed_statuses),
        )
        .order_by(Analysis.created_at.desc(), Finding.id.desc())
    ).all()
    actions = db.execute(
        select(ActionPlan, Analysis)
        .join(Analysis, Analysis.id == ActionPlan.analysis_id)
        .where(
            Analysis.user_id == user.id,
            Analysis.status.in_(completed_statuses),
        )
        .order_by(Analysis.created_at.desc(), ActionPlan.priority, ActionPlan.id)
    ).all()

    items = [
        {
            "id": f"finding-{finding.id}",
            "type": _insight_type(f"{finding.title} {finding.description}"),
            "title": finding.title,
            "description": finding.description,
            "confidence": finding.confidence,
            "source": finding.source,
            "analysis_id": analysis.id,
            "analysis_title": analysis.title,
            "date": analysis.completed_at or analysis.created_at,
        }
        for finding, analysis in findings
    ]
    items.extend(
        {
            "id": f"action-{action.id}",
            "type": "RECOMMENDATION",
            "title": action.action,
            "description": f"Recommended action from {analysis.title}.",
            "confidence": analysis.confidence,
            "source": None,
            "analysis_id": analysis.id,
            "analysis_title": analysis.title,
            "date": analysis.completed_at or analysis.created_at,
        }
        for action, analysis in actions
    )
    items.sort(
        key=lambda item: (
            item["date"].isoformat() if item["date"] else "",
            item["id"],
        ),
        reverse=True,
    )
    return {
        "total": len(items),
        "high_confidence_count": sum(
            (item["confidence"] or 0) > 80 for item in items
        ),
        "risk_count": sum(item["type"] == "RISK" for item in items),
        "opportunity_count": sum(
            item["type"] == "OPPORTUNITY" for item in items
        ),
        "featured": (
            max(
                items,
                key=lambda item: (
                    item["confidence"] if item["confidence"] is not None else -1,
                    item["date"].isoformat() if item["date"] else "",
                ),
            )
            if items
            else None
        ),
        "items": items[:100],
    }


# 1) CREATE ------------------------------------------------------------
@router.post("", status_code=202)
async def create(
    bg: BackgroundTasks,
    problem: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    knowledge_document_ids: list[int] = Form(default=[]),
    output_detail: Literal["concise", "detailed"] = Form("detailed"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Multipart form: problem (text) + files[]. Returns immediately; pipeline runs in background."""
    if len(knowledge_document_ids) > 20:
        raise HTTPException(422, "Select no more than 20 Knowledge Base documents")
    knowledge_evidence, knowledge_sources = get_indexed_document_evidence(
        db, user, knowledge_document_ids
    )
    items = await read_uploads(files)
    a = create_analysis(
        db,
        user,
        problem,
        items,
        knowledge_evidence=knowledge_evidence,
        knowledge_sources=knowledge_sources,
        output_detail=output_detail,
    )
    bg.add_task(run_pipeline, a.id)
    return analysis_row(a)


# 2) LIST (History) ----------------------------------------------------
@router.get("")
def list_mine(
    q: str | None = Query(None, max_length=200),
    status: str | None = Query(None, max_length=20),
    category: str | None = Query(None, max_length=40),
    input_type: str | None = Query(None, max_length=20),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Analysis)
        .where(Analysis.user_id == user.id)
        .order_by(Analysis.created_at.desc(), Analysis.id.desc())
    )
    if q:
        escaped_q = (
            q.lower()
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_")
        )
        stmt = stmt.where(
            func.lower(Analysis.title).like(f"%{escaped_q}%", escape="\\")
        )
    if status:
        stmt = stmt.where(Analysis.status == status)
    if category:
        stmt = stmt.where(Analysis.category == category)
    if input_type:
        stmt = stmt.where(Analysis.input_type == input_type)
    return paginate(db, stmt, page, size, analysis_row)


# 2.1) DASHBOARD STATS -----------------------------------------------
@router.get("/stats")
def get_analysis_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(
            func.lower(Analysis.status),
            func.count(Analysis.id),
        )
        .where(Analysis.user_id == user.id)
        .group_by(func.lower(Analysis.status))
    ).all()

    status_counts = {
        status: count
        for status, count in rows
        if status is not None
    }

    return {
        "total": sum(status_counts.values()),
        "completed": (
            status_counts.get("completed", 0)
            + status_counts.get("verified", 0)
        ),
        "processing": (
            status_counts.get("processing", 0)
            + status_counts.get("running", 0)
        ),
        "failed": status_counts.get("failed", 0),
        "pending": status_counts.get("pending", 0),
    }



# 3) DETAIL ------------------------------------------------------------
@router.get("/{analysis_id}")
def get_one(
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analysis_detail(get_owned(db, user, analysis_id))


# 4) LIVE PROGRESS (SSE) -----------------------------------------------
@router.get("/{analysis_id}/stream")
async def stream(analysis_id: int, user: User = Depends(get_current_user)):
    """Server-Sent Events: one 'step' event per pipeline step, then 'done'."""
    with SessionLocal() as db:
        get_owned(db, user, analysis_id)  # ownership check

    def sse(event: str, data: dict) -> str:
        return f"event: {event}\ndata: {json.dumps(data, default=str)}\n\n"

    async def gen():
        last, waited = 0, 0.0
        while waited < 180:
            with SessionLocal() as db:
                status = db.scalar(
                    select(Analysis.status).where(Analysis.id == analysis_id)
                )
                logs = db.scalars(
                    select(ReasoningLog)
                    .where(
                        ReasoningLog.analysis_id == analysis_id,
                        ReasoningLog.id > last,
                    )
                    .order_by(ReasoningLog.id)
                ).all()
                rows = [
                    {
                        "id": l.id,
                        "step": l.step,
                        "message": l.message,
                        "status": l.status,
                    }
                    for l in logs
                ]
            for r in rows:
                last = r["id"]
                yield sse("step", r)
            if status in ("completed", "partial", "failed"):
                yield sse("done", {"status": status})
                return
            await asyncio.sleep(0.5)
            waited += 0.5
        yield sse("done", {"status": "timeout"})

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# 5) TICK ACTION PLAN STEP ---------------------------------------------
@router.patch("/{analysis_id}/actions/{action_id}")
def toggle_action(
    analysis_id: int,
    action_id: int,
    body: ActionToggle,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned(db, user, analysis_id)
    action = db.scalar(
        select(ActionPlan).where(
            ActionPlan.id == action_id, ActionPlan.analysis_id == analysis_id
        )
    )
    if not action:
        raise HTTPException(404, "Action not found")
    action.is_done = body.is_done
    db.commit()
    return {"id": action.id, "is_done": action.is_done}


# 6) DOWNLOAD EVIDENCE FILE --------------------------------------------
@router.get("/{analysis_id}/files/{file_id}")
def download_file(
    analysis_id: int,
    file_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned(db, user, analysis_id)
    f = db.scalar(
        select(EvidenceFile).where(
            EvidenceFile.id == file_id, EvidenceFile.analysis_id == analysis_id
        )
    )
    if not f or not Path(f.storage_path).exists():
        raise HTTPException(404, "File not found")
    return FileResponse(
        f.storage_path,
        media_type=f.content_type or "application/octet-stream",
        filename=f.filename,
    )


# 7) DELETE ------------------------------------------------------------
@router.delete("/{analysis_id}")
def delete_mine(
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    a = get_owned(db, user, analysis_id)
    title = a.title
    db.delete(a)
    db.commit()
    log_activity(db, user.id, "analysis.deleted", "analysis", f"#{analysis_id} {title}")
    return {"message": "Analysis deleted"}
