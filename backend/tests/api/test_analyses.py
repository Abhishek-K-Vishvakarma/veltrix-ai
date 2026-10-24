from datetime import datetime
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.api.routes import analyses as analyses_routes
from app.core.config import settings
from app.core.security import create_access_token
from app.core.security import hash_password, verify_password
from app.db.base import Base
from app.llm.gemini_client import AnalysisOutput, Usage
from app.main import app
from app.models import (
    ActionPlan,
    ActivityLog,
    Analysis,
    AnalysisMetric,
    Document,
    Finding,
    KnowledgeChunk,
    User,
)
from app.schemas.evidence import EvidenceItem
from app.services import analysis_service
from app.utils.file_validation import MAX_BYTES, MAX_FILES


@pytest.fixture
def api_context(tmp_path, monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def override_get_db():
        with factory() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(analysis_service, "SessionLocal", factory)
    monkeypatch.setattr(analyses_routes, "run_pipeline", lambda _analysis_id: None)
    monkeypatch.setattr("app.storage.local_storage._base", lambda: tmp_path / "uploads")

    with factory() as db:
        owner = User(email="analysis-owner@example.test", hashed_password="unused")
        other = User(email="analysis-other@example.test", hashed_password="unused")
        db.add_all([owner, other])
        db.commit()
        db.refresh(owner)
        db.refresh(other)
        owner_token = create_access_token(owner.id, owner.role)
        other_token = create_access_token(other.id, other.role)
        owner_id = owner.id

    try:
        yield SimpleNamespace(
            client=TestClient(app),
            factory=factory,
            owner_id=owner_id,
            owner_headers={"Authorization": f"Bearer {owner_token}"},
            other_headers={"Authorization": f"Bearer {other_token}"},
        )
    finally:
        app.dependency_overrides.pop(get_db, None)
        Base.metadata.drop_all(engine)
        engine.dispose()


def _valid_analysis_output():
    return AnalysisOutput(
        title="Evidence summary",
        category="Other",
        summary="The supplied evidence was reviewed.",
        confidence=85,
        needs_more_evidence=False,
    )


def test_insights_returns_only_authenticated_users_findings_and_actions(api_context):
    with api_context.factory() as db:
        owner_analysis = Analysis(
            user_id=api_context.owner_id,
            title="Resume review",
            status="completed",
            confidence=90,
        )
        other_user = db.scalar(
            select(User).where(User.email == "analysis-other@example.test")
        )
        db.add(owner_analysis)
        db.flush()
        db.add(
            Finding(
                analysis_id=owner_analysis.id,
                title="Risk: employment gap needs explanation",
                description="A gap is present in the submitted resume.",
                source="resume.txt",
                confidence=88,
            )
        )
        db.add(
            ActionPlan(
                analysis_id=owner_analysis.id,
                action="Add context for the employment gap",
                priority=1,
            )
        )
        other_analysis = Analysis(
            user_id=other_user.id,
            title="Private analysis",
            status="completed",
            confidence=99,
        )
        db.add(other_analysis)
        db.flush()
        db.add(
            Finding(
                analysis_id=other_analysis.id,
                title="Private finding",
                description="Must not be visible to the owner.",
                confidence=99,
            )
        )
        db.commit()

    response = api_context.client.get(
        "/api/analyses/insights",
        headers=api_context.owner_headers,
    )

    assert response.status_code == 200
    result = response.json()
    assert result["total"] == 2
    assert result["high_confidence_count"] == 2
    assert result["risk_count"] == 1
    assert result["featured"]["analysis_title"] == "Resume review"
    assert {item["title"] for item in result["items"]} == {
        "Risk: employment gap needs explanation",
        "Add context for the employment gap",
    }


def test_analytics_aggregates_owned_records_with_date_filter(api_context):
    with api_context.factory() as db:
        completed = Analysis(
            user_id=api_context.owner_id,
            title="Completed document analysis",
            status="completed",
            input_type="document",
            confidence=85,
            processing_time_ms=120000,
            created_at=datetime(2026, 10, 10, 12, 0),
            result_json={"knowledge_sources": [{"filename": "resume.txt"}]},
        )
        failed = Analysis(
            user_id=api_context.owner_id,
            title="Failed analysis",
            status="failed",
            input_type="problem",
            processing_time_ms=5000,
            created_at=datetime(2026, 10, 12, 12, 0),
        )
        other_user = db.scalar(
            select(User).where(User.email == "analysis-other@example.test")
        )
        outside_range = Analysis(
            user_id=other_user.id,
            title="Outside date range",
            status="completed",
            confidence=99,
            created_at=datetime(2026, 9, 1, 12, 0),
        )
        db.add_all([completed, failed, outside_range])
        db.flush()
        db.add(ActionPlan(analysis_id=completed.id, action="Review sources"))
        db.commit()

    response = api_context.client.get(
        "/api/analytics?start_date=2026-10-01&end_date=2026-10-31",
        headers=api_context.owner_headers,
    )

    assert response.status_code == 200
    result = response.json()
    assert result["total_analyses"] == 2
    assert result["completed_analyses"] == 1
    assert result["failed_analyses"] == 1
    assert result["success_rate"] == 50
    assert result["average_confidence"] == 85
    assert result["average_processing_time_ms"] == 62500
    assert result["actionable_count"] == 1
    assert result["activity"][9]["count"] == 1
    assert result["activity"][11]["count"] == 1
    assert {item["label"] for item in result["input_mix"]} == {
        "Knowledge Base",
        "Text prompt",
    }


def test_user_settings_are_authenticated_and_persisted(api_context):
    default_response = api_context.client.get(
        "/api/auth/preferences",
        headers=api_context.owner_headers,
    )
    assert default_response.status_code == 200
    assert default_response.json()["theme"] == "light"

    preferences = {
        "theme": "dark",
        "language": "en",
        "analysis_detail": "concise",
        "notifications": {
            "analysis_completed": False,
            "analysis_failed": True,
            "weekly_summary": True,
        },
    }
    updated_preferences = api_context.client.put(
        "/api/auth/preferences",
        json=preferences,
        headers=api_context.owner_headers,
    )
    assert updated_preferences.status_code == 200
    assert updated_preferences.json() == preferences

    updated_profile = api_context.client.patch(
        "/api/auth/profile",
        json={"full_name": "Updated User"},
        headers=api_context.owner_headers,
    )
    assert updated_profile.status_code == 200
    assert updated_profile.json()["full_name"] == "Updated User"

    persisted_preferences = api_context.client.get(
        "/api/auth/preferences",
        headers=api_context.owner_headers,
    )
    assert persisted_preferences.json() == preferences

    other_user_preferences = api_context.client.get(
        "/api/auth/preferences",
        headers=api_context.other_headers,
    )
    assert other_user_preferences.status_code == 200
    assert other_user_preferences.json()["theme"] == "light"


def test_password_change_verifies_current_password(api_context):
    current_password = "old-password-123"
    with api_context.factory() as db:
        owner = db.get(User, api_context.owner_id)
        owner.hashed_password = hash_password(current_password)
        db.commit()

    rejected = api_context.client.post(
        "/api/auth/change-password",
        json={
            "current_password": "incorrect-password",
            "new_password": "new-password-456",
        },
        headers=api_context.owner_headers,
    )
    assert rejected.status_code == 400
    assert rejected.json()["detail"] == "Current password is incorrect"

    changed = api_context.client.post(
        "/api/auth/change-password",
        json={
            "current_password": current_password,
            "new_password": "new-password-456",
        },
        headers=api_context.owner_headers,
    )
    assert changed.status_code == 200
    with api_context.factory() as db:
        owner = db.get(User, api_context.owner_id)
        assert verify_password("new-password-456", owner.hashed_password)


def test_create_and_retrieve_successful_analysis(api_context, monkeypatch):
    monkeypatch.setattr(analyses_routes, "run_pipeline", analysis_service.run_pipeline)
    monkeypatch.setattr(analysis_service, "get_active_model", lambda: "gemini-test")
    monkeypatch.setattr(
        analysis_service,
        "analyze",
        lambda problem, files, model: (
            _valid_analysis_output(),
            Usage(provider_status="ai"),
        ),
    )

    created = api_context.client.post(
        "/api/analyses",
        data={"problem": "Review this evidence"},
        headers=api_context.owner_headers,
    )
    assert created.status_code == 202
    analysis_id = created.json()["id"]

    detail = api_context.client.get(
        f"/api/analyses/{analysis_id}", headers=api_context.owner_headers
    )
    assert detail.status_code == 200
    assert detail.json()["status"] == "completed"
    assert detail.json()["answer"] == "The supplied evidence was reviewed."
    assert detail.json()["provider_status"] == "ai"


def test_analysis_uses_authenticated_indexed_knowledge_document(
    api_context, monkeypatch
):
    monkeypatch.setattr(analyses_routes, "run_pipeline", analysis_service.run_pipeline)
    monkeypatch.setattr(analysis_service, "get_active_model", lambda: "gemini-test")
    with api_context.factory() as db:
        document = Document(
            user_id=api_context.owner_id,
            filename="resume.txt",
            content_type="text/plain",
            size_bytes=74,
            storage_path="knowledge/resume.txt",
            indexing_status="indexed",
        )
        db.add(document)
        db.flush()
        db.add(
            KnowledgeChunk(
                document_id=document.id,
                chunk_index=0,
                page_number=1,
                content="Python developer with 5 years of experience in data engineering.",
                embedding=[0.1, 0.2],
            )
        )
        db.commit()
        document_id = document.id

    seen = {}

    def analyze(problem, files, model):
        seen["problem"] = problem
        seen["files"] = files
        assert any(
            b"Python developer with 5 years of experience" in item.data
            for item in files
        )
        output = _valid_analysis_output()
        output.evidence = [
            EvidenceItem(
                label="Experience",
                value="5 years",
                source="resume.txt",
                page=1,
                extraction_method="indexed Knowledge Base text",
            )
        ]
        return output, Usage(provider_status="ai")

    monkeypatch.setattr(analysis_service, "analyze", analyze)
    response = api_context.client.post(
        "/api/analyses",
        data={
            "problem": "Perform an ATS audit of this resume",
            "knowledge_document_ids": str(document_id),
            "output_detail": "concise",
        },
        files={"files": ("cover-letter.txt", b"Please review this cover letter too.", "text/plain")},
        headers=api_context.owner_headers,
    )
    assert response.status_code == 202
    detail = api_context.client.get(
        f"/api/analyses/{response.json()['id']}",
        headers=api_context.owner_headers,
    )
    result = detail.json()
    assert result["status"] == "completed"
    assert len(seen["files"]) == 2
    assert seen["files"][0].filename == "cover-letter.txt"
    assert seen["files"][1].filename == "resume.txt (page 1)"
    assert result["evidence"][0]["value"] == "5 years"
    assert result["knowledge_document_count"] == 1
    assert result["evidence_source_count"] == 2
    assert "Keep the response concise" in seen["problem"]
    assert result["knowledge_sources"] == [
        {
            "document_id": document_id,
            "filename": "resume.txt",
            "chunk_count": 1,
            "pages": [1],
        }
    ]


def test_analysis_rejects_unindexed_or_other_users_knowledge_documents(api_context):
    with api_context.factory() as db:
        unindexed = Document(
            user_id=api_context.owner_id,
            filename="pending.txt",
            content_type="text/plain",
            size_bytes=1,
            storage_path="knowledge/pending.txt",
            indexing_status="processing",
        )
        other = User(email="analysis-third@example.test", hashed_password="unused")
        db.add_all([unindexed, other])
        db.flush()
        private_document = Document(
            user_id=other.id,
            filename="private.txt",
            content_type="text/plain",
            size_bytes=1,
            storage_path="knowledge/private.txt",
            indexing_status="indexed",
        )
        empty_document = Document(
            user_id=api_context.owner_id,
            filename="empty.txt",
            content_type="text/plain",
            size_bytes=0,
            storage_path="knowledge/empty.txt",
            indexing_status="indexed",
        )
        db.add_all([private_document, empty_document])
        db.commit()
        unindexed_id = unindexed.id
        private_id = private_document.id
        empty_id = empty_document.id

    for document_id, expected_status in (
        (unindexed_id, 422),
        (private_id, 404),
        (empty_id, 422),
    ):
        response = api_context.client.post(
            "/api/analyses",
            data={
                "problem": "Review this resume",
                "knowledge_document_ids": str(document_id),
            },
            headers=api_context.owner_headers,
        )
        assert response.status_code == expected_status


def test_empty_list_and_deterministic_pagination(api_context):
    response = api_context.client.get(
        "/api/analyses?page=2&size=2", headers=api_context.owner_headers
    )
    assert response.status_code == 200
    assert response.json() == {
        "items": [],
        "total": 0,
        "page": 2,
        "size": 2,
        "pages": 0,
    }

    with api_context.factory() as db:
        rows = [
            Analysis(
                user_id=api_context.owner_id,
                title=f"Analysis {index}",
                category="Other",
                input_type="problem",
                status="processing",
                result_json={"problem": ""},
            )
            for index in range(5)
        ]
        db.add_all(rows)
        db.commit()
        ids = [row.id for row in rows]

    first = api_context.client.get(
        "/api/analyses?page=1&size=2", headers=api_context.owner_headers
    ).json()
    second = api_context.client.get(
        "/api/analyses?page=2&size=2", headers=api_context.owner_headers
    ).json()
    assert first["total"] == 5
    assert first["pages"] == 3
    assert [row["id"] for row in first["items"]] == sorted(ids, reverse=True)[:2]
    assert [row["id"] for row in second["items"]] == sorted(ids, reverse=True)[2:4]
    filtered = api_context.client.get(
        "/api/analyses?q=Analysis%201&status=processing&category=Other&input_type=problem",
        headers=api_context.owner_headers,
    ).json()
    assert filtered["total"] == 1
    assert filtered["items"][0]["title"] == "Analysis 1"


def test_rejects_empty_input_and_invalid_uploads(api_context):
    empty = api_context.client.post(
        "/api/analyses",
        data={"problem": "   "},
        headers=api_context.owner_headers,
    )
    assert empty.status_code == 400

    unsupported = api_context.client.post(
        "/api/analyses",
        data={"problem": "Check this"},
        files={"files": ("payload.exe", b"content", "application/octet-stream")},
        headers=api_context.owner_headers,
    )
    assert unsupported.status_code == 415

    mismatched = api_context.client.post(
        "/api/analyses",
        data={"problem": "Check this"},
        files={"files": ("payload.png", b"not a PNG", "image/png")},
        headers=api_context.owner_headers,
    )
    assert mismatched.status_code == 400

    oversized = api_context.client.post(
        "/api/analyses",
        data={"problem": "Check this"},
        files={"files": ("payload.txt", b"x" * (MAX_BYTES + 1), "text/plain")},
        headers=api_context.owner_headers,
    )
    assert oversized.status_code == 413

    too_many_files = api_context.client.post(
        "/api/analyses",
        data={"problem": "Check these"},
        files=[
            ("files", (f"payload-{index}.txt", b"text", "text/plain"))
            for index in range(MAX_FILES + 1)
        ],
        headers=api_context.owner_headers,
    )
    assert too_many_files.status_code == 400


def test_analysis_endpoints_require_authentication(api_context):
    response = api_context.client.get("/api/analyses")
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"

    malformed_token = api_context.client.get(
        "/api/analyses", headers={"Authorization": "Bearer invalid"}
    )
    assert malformed_token.status_code == 401

    malformed_subject = jwt.encode(
        {"sub": "not-an-integer"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
    invalid_subject = api_context.client.get(
        "/api/analyses",
        headers={"Authorization": f"Bearer {malformed_subject}"},
    )
    assert invalid_subject.status_code == 401


def test_user_cannot_read_another_users_analysis(api_context):
    with api_context.factory() as db:
        analysis = Analysis(
            user_id=api_context.owner_id,
            title="Private analysis",
            category="Other",
            input_type="problem",
            status="processing",
            result_json={"problem": ""},
        )
        db.add(analysis)
        db.commit()
        analysis_id = analysis.id

    response = api_context.client.get(
        f"/api/analyses/{analysis_id}", headers=api_context.other_headers
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Analysis not found"


def test_provider_fallback_and_pipeline_exception_are_not_successful(
    api_context, monkeypatch, caplog
):
    monkeypatch.setattr(analyses_routes, "run_pipeline", analysis_service.run_pipeline)
    monkeypatch.setattr(analysis_service, "get_active_model", lambda: "gemini-test")
    outcomes = iter(
        [
            (
                _valid_analysis_output(),
                Usage(
                    provider_status="fallback",
                    error_message="Provider unavailable.",
                ),
            ),
            RuntimeError("provider adapter failed"),
        ]
    )

    def analyze(*_args):
        outcome = next(outcomes)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome

    monkeypatch.setattr(analysis_service, "analyze", analyze)
    ids = []
    for problem in ("Fallback result", "Provider exception"):
        response = api_context.client.post(
            "/api/analyses",
            data={"problem": problem},
            headers=api_context.owner_headers,
        )
        assert response.status_code == 202
        ids.append(response.json()["id"])

    fallback = api_context.client.get(
        f"/api/analyses/{ids[0]}", headers=api_context.owner_headers
    ).json()
    failed = api_context.client.get(
        f"/api/analyses/{ids[1]}", headers=api_context.owner_headers
    ).json()
    assert fallback["status"] == "partial"
    assert fallback["provider_status"] == "fallback"
    assert failed["status"] == "failed"
    assert failed["provider_status"] == "unavailable"
    assert "RuntimeError" in failed["error_message"]
    assert "provider adapter failed" in caplog.text

    with api_context.factory() as db:
        metrics = db.scalars(
            select(AnalysisMetric).where(AnalysisMetric.analysis_id.in_(ids))
        ).all()
    assert len(metrics) == 2
    assert all(metric.success is False for metric in metrics)
    assert {metric.analysis_id for metric in metrics} == set(ids)


def test_create_analysis_failure_rolls_back_and_removes_saved_upload(
    api_context, monkeypatch, tmp_path
):
    upload_path = tmp_path / "orphan-candidate.txt"
    monkeypatch.setattr(
        analysis_service,
        "save_bytes",
        lambda *_args: (upload_path.write_bytes(b"contents"), str(upload_path))[1],
    )
    with api_context.factory() as db:
        owner = db.get(User, api_context.owner_id)
        monkeypatch.setattr(
            db,
            "commit",
            lambda: (_ for _ in ()).throw(RuntimeError("commit failed")),
        )
        with pytest.raises(RuntimeError, match="commit failed"):
            analysis_service.create_analysis(
                db,
                owner,
                "Upload evidence",
                [("evidence.txt", "text/plain", b"contents")],
            )
        assert not upload_path.exists()
        assert db.scalar(select(Analysis).where(Analysis.user_id == owner.id)) is None
        assert db.scalar(
            select(ActivityLog).where(ActivityLog.action == "analysis.created")
        ) is None
