from calendar import month_name
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.analysis import Analysis
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("")
def get_analytics(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(422, "start_date must be on or before end_date")

    statement = (
        select(Analysis)
        .options(selectinload(Analysis.evidence), selectinload(Analysis.action_plans))
        .where(Analysis.user_id == user.id)
        .order_by(Analysis.created_at.asc(), Analysis.id.asc())
    )
    if start_date:
        statement = statement.where(func.date(Analysis.created_at) >= start_date)
    if end_date:
        statement = statement.where(func.date(Analysis.created_at) <= end_date)
    analyses = db.scalars(statement).all()

    total = len(analyses)
    completed = sum(
        item.status.lower() in {"completed", "verified"} for item in analyses
    )
    partial = sum(item.status.lower() == "partial" for item in analyses)
    failed = sum(item.status.lower() == "failed" for item in analyses)
    confidences = [
        item.confidence for item in analyses if item.confidence is not None
    ]
    processing_times = [
        item.processing_time_ms
        for item in analyses
        if item.processing_time_ms is not None
    ]
    distribution = [
        ("90–100%", 90, 100),
        ("80–89%", 80, 90),
        ("70–79%", 70, 80),
        ("60–69%", 60, 70),
        ("Below 60%", 0, 60),
    ]
    confidence_distribution = [
        {
            "label": label,
            "count": sum(
                lower <= confidence < upper
                or (upper == 100 and confidence == 100)
                for confidence in confidences
            ),
        }
        for label, lower, upper in distribution
    ]

    activity_dates = [
        item.created_at.date()
        for item in analyses
        if item.created_at is not None
    ]
    range_start = start_date or (min(activity_dates) if activity_dates else None)
    range_end = end_date or (max(activity_dates) if activity_dates else None)
    granularity = "day"
    activity: list[dict] = []
    if range_start and range_end:
        span = (range_end - range_start).days
        if span > 31:
            granularity = "month"
            cursor = range_start.replace(day=1)
            final_month = range_end.replace(day=1)
            buckets: dict[str, int] = {}
            while cursor <= final_month:
                key = cursor.isoformat()
                buckets[key] = 0
                cursor = (
                    cursor.replace(year=cursor.year + 1, month=1)
                    if cursor.month == 12
                    else cursor.replace(month=cursor.month + 1)
                )
            for item in analyses:
                if item.created_at is not None:
                    key = item.created_at.date().replace(day=1).isoformat()
                    if key in buckets:
                        buckets[key] += 1
            activity = [
                {
                    "date": key,
                    "label": f"{month_name[int(key[5:7])][:3]} {key[:4]}",
                    "count": count,
                }
                for key, count in buckets.items()
            ]
        else:
            buckets = {
                (range_start + timedelta(days=offset)).isoformat(): 0
                for offset in range(span + 1)
            }
            for item in analyses:
                if item.created_at is not None:
                    key = item.created_at.date().isoformat()
                    if key in buckets:
                        buckets[key] += 1
            activity = [
                {
                    "date": key,
                    "label": date.fromisoformat(key).strftime("%b %d"),
                    "count": count,
                }
                for key, count in buckets.items()
            ]

    input_counts = {
        "Files and Knowledge Base": 0,
        "Uploaded files": 0,
        "Knowledge Base": 0,
        "Text prompt": 0,
    }
    for item in analyses:
        has_files = bool(item.evidence)
        result = item.result_json or {}
        has_knowledge = bool(result.get("knowledge_sources"))
        if has_files and has_knowledge:
            input_counts["Files and Knowledge Base"] += 1
        elif has_files:
            input_counts["Uploaded files"] += 1
        elif has_knowledge:
            input_counts["Knowledge Base"] += 1
        else:
            input_counts["Text prompt"] += 1

    with_actions = sum(bool(item.action_plans) for item in analyses)
    evidence_backed = sum(
        bool(item.evidence)
        or bool((item.result_json or {}).get("knowledge_sources"))
        for item in analyses
    )
    return {
        "total_analyses": total,
        "completed_analyses": completed,
        "partial_analyses": partial,
        "failed_analyses": failed,
        "success_rate": (
            round((completed + partial) / total * 100, 1) if total else 0
        ),
        "average_confidence": (
            round(sum(confidences) / len(confidences), 1) if confidences else None
        ),
        "average_processing_time_ms": (
            round(sum(processing_times) / len(processing_times))
            if processing_times
            else None
        ),
        "confidence_distribution": confidence_distribution,
        "activity": activity,
        "granularity": granularity,
        "input_mix": [
            {"label": label, "count": count}
            for label, count in input_counts.items()
            if count
        ],
        "evidence_backed_count": evidence_backed,
        "actionable_count": with_actions,
    }
