"""Runs the analysis pipeline"""

# TODO
import logging
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.llm.gemini_client import LoadedFile, analyze, get_active_model
from app.models import (
    ActivityLog,
    ActionPlan,
    Analysis,
    AnalysisMetric,
    EvidenceFile,
    Finding,
    ReasoningLog,
    User,
)
from app.services.activity_service import log_activity
from app.storage.local_storage import read_bytes, save_bytes
from app.tools.calculator import calculate
from app.utils.file_validation import MAX_BYTES, MAX_FILES, validate_upload

logger = logging.getLogger(__name__)


async def read_uploads(files: list[UploadFile]) -> list[tuple[str, str, bytes]]:
    """Reads + validates uploaded files -> [(filename, mime, bytes)]"""
    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Maximum {MAX_FILES} files allowed")
    items = []
    for f in files:
        data = await f.read(MAX_BYTES + 1)
        items.append((f.filename or "file", validate_upload(f, data), data))
    return items


def create_analysis(
    db: Session,
    owner: User,
    problem: str,
    items: list[tuple[str, str, bytes]],
    knowledge_evidence: list[dict] | None = None,
    knowledge_sources: list[dict] | None = None,
    output_detail: str = "detailed",
) -> Analysis:
    problem = (problem or "").strip()
    knowledge_evidence = knowledge_evidence or []
    knowledge_sources = knowledge_sources or []
    if not problem and not items and not knowledge_evidence:
        raise HTTPException(400, "Provide a problem description or at least one file")
    if any(m.startswith("image/") for _, m, _ in items):
        input_type = "image"
    elif items or knowledge_evidence:
        input_type = "document"
    else:
        input_type = "problem"
    a = Analysis(
        user_id=owner.id,
        title=(
            problem[:60]
            or (items[0][0] if items else knowledge_sources[0]["filename"])
        ),
        category="Other",
        input_type=input_type,
        status="processing",
        result_json={
            "problem": problem,
            "knowledge_evidence": knowledge_evidence,
            "knowledge_sources": knowledge_sources,
            "output_detail": output_detail,
        },
    )
    saved_paths: list[str] = []
    try:
        db.add(a)
        db.flush()
        for filename, mime, data in items:
            path = save_bytes(f"{owner.id}/{a.id}", filename, data)
            saved_paths.append(path)
            db.add(
                EvidenceFile(
                    analysis_id=a.id,
                    filename=filename,
                    content_type=mime,
                    size_bytes=len(data),
                    storage_path=path,
                )
            )
        db.add(
            ActivityLog(
                user_id=owner.id,
                action="analysis.created",
                resource="analysis",
                detail=f"#{a.id} {a.title}",
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        for path in saved_paths:
            try:
                Path(path).unlink(missing_ok=True)
            except OSError:
                logger.exception("Failed to remove upload after analysis creation failed")
        raise
    db.refresh(a)
    return a


def reset_for_retry(db: Session, a: Analysis) -> None:
    for rel in (a.findings, a.action_plans, a.reasoning_logs):
        for row in list(rel):
            db.delete(row)
    a.status, a.error_message, a.confidence, a.summary, a.completed_at = (
        "processing",
        None,
        None,
        "",
        None,
    )
    db.commit()


def _log(
    db: Session,
    analysis_id: int,
    step: str,
    message: str,
    status: str = "done",
    ms: int | None = None,
) -> None:
    db.add(
        ReasoningLog(
            analysis_id=analysis_id,
            step=step,
            message=message,
            status=status,
            duration_ms=ms,
        )
    )
    db.commit()


def run_pipeline(analysis_id: int) -> None:
    """Background job: Evidence -> Extract -> Reason -> Verify -> Action. Uses its own DB session."""
    with SessionLocal() as db:
        a = db.get(Analysis, analysis_id)
        if not a:
            return
        started = time.perf_counter()
        model = "unavailable"
        latency = 0
        try:
            model = get_active_model()
            result = a.result_json or {}
            problem = result.get("problem", "")
            output_detail = result.get("output_detail", "detailed")
            evidence_rows = list(a.evidence)
            knowledge_evidence = result.get("knowledge_evidence", [])
            knowledge_sources = result.get("knowledge_sources", [])
            _log(
                db,
                a.id,
                "Evidence",
                (
                    f"Reading {len(evidence_rows)} uploaded file(s) and "
                    f"{len(knowledge_sources)} Knowledge Base document(s) "
                    f"({len(knowledge_evidence)} indexed chunks)"
                ),
            )
            files = [
                LoadedFile(e.filename, e.content_type, read_bytes(e.storage_path))
                for e in evidence_rows
            ]
            files.extend(
                LoadedFile(
                    filename=(
                        f"{item['filename']}"
                        + (
                            f" (page {item['page_number']})"
                            if item.get("page_number")
                            else ""
                        )
                    ),
                    mime="text/plain",
                    data=(
                        f"Source: {item['filename']}; "
                        f"page: {item.get('page_number') or 'not specified'}; "
                        f"chunk: {item['chunk_index'] + 1}\n"
                        f"{item['content']}"
                    ).encode("utf-8"),
                )
                for item in knowledge_evidence
            )

            _log(db, a.id, "Extract", "Reading values from the evidence")
            t = time.perf_counter()
            detail_instruction = (
                "Keep the response concise while preserving the key evidence and conclusions."
                if output_detail == "concise"
                else "Provide a detailed explanation of the evidence, reasoning, and conclusions."
            )
            prompt = f"{problem}\n\nOutput preference: {detail_instruction}".strip()
            out, usage = analyze(prompt, files, model)
            latency = int((time.perf_counter() - t) * 1000)

            _log(db, a.id, "Reason", "Interpreting the extracted values", ms=latency)
            calcs, calc_failed = [], False
            for c in out.calculations:  # the LLM never does math: we compute it
                try:
                    result = calculate(c.expression)
                    calcs.append(
                        {
                            "label": c.label,
                            "expression": c.expression,
                            "result": (
                                int(result)
                                if result == result.to_integral_value()
                                else float(result)
                            ),
                            "inputs": c.inputs,
                            "unit": c.unit,
                        }
                    )
                except (ValueError, SyntaxError, ArithmeticError):
                    calc_failed = True
                    calcs.append({
                        "label": c.label,
                        "expression": c.expression,
                        "result": None,
                        "inputs": c.inputs,
                        "unit": c.unit,
                    })

            _log(db, a.id, "Verify", "Checking values and confidence")
            conf = max(0.0, min(100.0, float(out.confidence)))
            if usage.provider_status != "ai":
                conf = min(conf, 40.0)
            if calc_failed:
                conf = min(conf, 70.0)
            needs_more = out.needs_more_evidence or conf < 60
            if needs_more:
                conf = min(conf, 59.0)

            a.title, a.category, a.summary, a.confidence = (
                out.title[:200],
                out.category[:40],
                out.summary,
                round(conf, 1),
            )
            for f in out.findings:
                db.add(
                    Finding(
                        analysis_id=a.id,
                        title=f.title[:200],
                        description=f.description,
                        source=f.source[:200],
                        confidence=a.confidence,
                    )
                )
            actions = out.actions or []
            if needs_more:
                actions = ["Upload clearer or additional evidence"] + actions
            for i, text in enumerate(actions, 1):
                db.add(ActionPlan(analysis_id=a.id, action=text, priority=i))
            a.result_json = {
                "problem": problem,
                "analysis_type": out.analysis_type,
                "answer": out.answer,
                "reasoning_summary": out.reasoning_summary,
                "evidence": [e.model_dump() for e in out.evidence],
                "calculations": calcs,
                "needs_more_evidence": needs_more,
                "missing_evidence_message": (
                    out.missing_evidence_message if needs_more else ""
                ),
                "uncertainties": out.uncertainties,
                "missing_evidence": out.missing_evidence,
                "follow_up_questions": out.follow_up_questions,
                "sources": [source.model_dump() for source in out.sources],
                "knowledge_sources": knowledge_sources,
                "provider_status": usage.provider_status,
            }
            _log(db, a.id, "Action", "Preparing recommendations")
            a.status = "completed" if usage.provider_status == "ai" else "partial"
            a.error_message = usage.error_message
            a.completed_at = datetime.now(timezone.utc)
            a.processing_time_ms = int((time.perf_counter() - started) * 1000)
            db.add(
                AnalysisMetric(
                    analysis_id=a.id,
                    model_name=model,
                    latency_ms=latency,
                    prompt_tokens=usage.prompt_tokens,
                    completion_tokens=usage.completion_tokens,
                    success=usage.provider_status == "ai",
                    error_message=usage.error_message,
                )
            )
            db.commit()
            log_activity(
                db,
                a.user_id,
                "analysis.completed",
                "analysis",
                f"#{a.id} {a.title} ({a.confidence}%, {a.status})",
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Analysis pipeline failed for analysis_id=%s", analysis_id)
            db.rollback()
            a = db.get(Analysis, analysis_id)
            logger_message = (
                str(exc)
                if str(exc).startswith("GEMINI_MODEL")
                else f"Analysis pipeline failed ({type(exc).__name__}). Check backend logs."
            )
            a.status, a.error_message = "failed", logger_message[:500]
            a.processing_time_ms = int((time.perf_counter() - started) * 1000)
            model_error = logger_message[:300]
            db.add(
                AnalysisMetric(
                    analysis_id=a.id,
                    model_name=model,
                    latency_ms=latency,
                    success=False,
                    error_message=model_error,
                )
            )
            db.commit()
            _log(db, a.id, "Error", model_error, status="failed")
            log_activity(
                db,
                a.user_id,
                "analysis.failed",
                "analysis",
                f"#{a.id}: {model_error[:200]}",
                "error",
            )


# def get_owned(db: Session, user: User, analysis_id: int) -> Analysis:
#     a = db.scalar(
#         select(Analysis).where(Analysis.id == analysis_id, Analysis.user_id == user.id)
#     )
#     if not a:
#         raise HTTPException(404, "Analysis not found")
#     return a


# def analysis_row(a: Analysis) -> dict:
#     return {
#         "id": a.id,
#         "title": a.title,
#         "category": a.category,
#         "input_type": a.input_type,
#         "status": a.status,
#         "confidence": a.confidence,
#         "processing_time_ms": a.processing_time_ms,
#         "created_at": a.created_at,
#     }


# def analysis_detail(a: Analysis) -> dict:
#     r = a.result_json or {}
#     return {
#         **analysis_row(a),
#         "problem": r.get("problem", ""),
#         "summary": a.summary,
#         "error_message": a.error_message,
#         "needs_more_evidence": r.get("needs_more_evidence", False),
#         "missing_evidence_message": r.get("missing_evidence_message", ""),
#         "evidence": r.get("evidence", []),
#         "calculations": r.get("calculations", []),
#         "findings": [
#             {
#                 "id": f.id,
#                 "title": f.title,
#                 "description": f.description,
#                 "source": f.source,
#                 "confidence": f.confidence,
#             }
#             for f in a.findings
#         ],
#         "actions": [
#             {
#                 "id": x.id,
#                 "action": x.action,
#                 "priority": x.priority,
#                 "is_done": x.is_done,
#             }
#             for x in a.actions
#         ],
#         "reasoning_logs": [
#             {
#                 "id": l.id,
#                 "step": l.step,
#                 "message": l.message,
#                 "status": l.status,
#                 "duration_ms": l.duration_ms,
#             }
#             for l in a.logs
#         ],
#         "evidence_files": [
#             {
#                 "id": e.id,
#                 "filename": e.filename,
#                 "content_type": e.content_type,
#                 "size_bytes": e.size_bytes,
#             }
#             for e in a.evidence
#         ],
#     }
def get_owned(db: Session, user: User, analysis_id: int) -> Analysis:
    """Sirf apna analysis; doosre ka ho to 404 (existence leak nahi hota)."""
    a = db.scalar(
        select(Analysis).where(Analysis.id == analysis_id, Analysis.user_id == user.id)
    )
    if not a:
        raise HTTPException(404, "Analysis not found")
    return a


def analysis_row(a: Analysis) -> dict:
    r = a.result_json or {}
    return {
        "id": a.id,
        "title": a.title,
        "category": a.category,
        "input_type": a.input_type,
        "status": a.status,
        "analysis_type": r.get("analysis_type", a.category),
        "confidence": a.confidence,
        "summary": (a.summary or "")[:140],
        "needs_more_evidence": r.get("needs_more_evidence", False),
        "knowledge_document_count": len(r.get("knowledge_sources", [])),
        "processing_time_ms": a.processing_time_ms,
        "created_at": a.created_at,
    }


def analysis_detail(a: Analysis) -> dict:
    r = a.result_json or {}
    default_provider_status = {
        "completed": "ai",
        "partial": "fallback",
        "failed": "unavailable",
    }.get(a.status, "pending")
    return {
        **analysis_row(a),
        "problem": r.get("problem", ""),
        "summary": a.summary,
        "analysis_type": r.get("analysis_type", a.category),
        "answer": r.get("answer", a.summary),
        "reasoning_summary": r.get("reasoning_summary", ""),
        "error_message": a.error_message,
        "missing_evidence_message": r.get("missing_evidence_message", ""),
        "uncertainties": r.get("uncertainties", []),
        "missing_evidence": r.get("missing_evidence", []),
        "follow_up_questions": r.get("follow_up_questions", []),
        "sources": r.get("sources", []),
        "provider_status": r.get("provider_status", default_provider_status),
        "evidence": r.get("evidence", []),
        "calculations": r.get("calculations", []),
        "findings": [
            {"id": f.id, "title": f.title, "description": f.description,
             "source": f.source, "confidence": f.confidence}
            for f in a.findings
        ],
        "actions": [
            {"id": x.id, "action": x.action, "priority": x.priority, "is_done": x.is_done}
            for x in a.action_plans
        ],
        "reasoning_logs": [
            {"id": l.id, "step": l.step, "message": l.message,
             "status": l.status, "duration_ms": l.duration_ms}
            for l in a.reasoning_logs
        ],
        "evidence_files": [
            {"id": e.id, "filename": e.filename, "content_type": e.content_type,
             "size_bytes": e.size_bytes}
            for e in a.evidence
        ],
        "knowledge_sources": r.get("knowledge_sources", []),
        "evidence_source_count": len(a.evidence) + len(r.get("knowledge_sources", [])),
    }