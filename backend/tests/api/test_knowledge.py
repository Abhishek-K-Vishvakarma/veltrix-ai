from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.core.security import create_access_token
from app.db.base import Base
from app.main import app
from app.models import Document, KnowledgeChunk, KnowledgeMessage, User
from app.services import knowledge_service


@pytest.fixture
def knowledge_context(tmp_path, monkeypatch):
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
    monkeypatch.setattr(
        "app.storage.local_storage._base", lambda: tmp_path / "uploads"
    )
    with factory() as db:
        owner = User(email="knowledge-owner@example.test", hashed_password="unused")
        other = User(email="knowledge-other@example.test", hashed_password="unused")
        db.add_all([owner, other])
        db.commit()
        db.refresh(owner)
        db.refresh(other)
        context = SimpleNamespace(
            client=TestClient(app),
            factory=factory,
            owner_id=owner.id,
            owner_headers={
                "Authorization": f"Bearer {create_access_token(owner.id, owner.role)}"
            },
            other_headers={
                "Authorization": f"Bearer {create_access_token(other.id, other.role)}"
            },
        )
    try:
        yield context
    finally:
        app.dependency_overrides.pop(get_db, None)
        Base.metadata.drop_all(engine)
        engine.dispose()


def _upload(context, filename="notes.txt", content=b"The project launches in June."):
    return context.client.post(
        "/api/documents",
        files={"file": (filename, content, "text/plain")},
        headers=context.owner_headers,
    )


def test_index_retrieve_grounded_answer_and_citations(knowledge_context, monkeypatch):
    monkeypatch.setattr(
        knowledge_service,
        "_embed",
        lambda texts, **_kwargs: [[1.0, 0.0] for _ in texts],
    )
    monkeypatch.setattr(
        knowledge_service,
        "_client",
        lambda: SimpleNamespace(
            models=SimpleNamespace(
                generate_content=lambda **kwargs: SimpleNamespace(
                    text="The project launches in June."
                )
            )
        ),
    )
    uploaded = _upload(knowledge_context)
    document_id = uploaded.json()["id"]

    indexed = knowledge_context.client.post(
        f"/api/knowledge/documents/{document_id}/index",
        headers=knowledge_context.owner_headers,
    )
    assert indexed.status_code == 200
    assert indexed.json()["indexing_status"] == "indexed"
    assert "storage_path" not in indexed.json()

    results = knowledge_context.client.post(
        "/api/knowledge/search",
        json={"query": "When does the project launch?", "limit": 3},
        headers=knowledge_context.owner_headers,
    )
    assert results.status_code == 200
    assert results.json()["results"][0]["filename"] == "notes.txt"
    assert results.json()["results"][0]["content"] == "The project launches in June."

    answer = knowledge_context.client.post(
        "/api/knowledge/ask",
        json={"question": "When does the project launch?"},
        headers=knowledge_context.owner_headers,
    )
    assert answer.status_code == 200
    assert answer.json()["ai_generated"] is True
    assert answer.json()["citations"][0]["document_id"] == document_id
    conversation = knowledge_context.client.get(
        f"/api/knowledge/conversations/{answer.json()['conversation_id']}",
        headers=knowledge_context.owner_headers,
    )
    assert [message["role"] for message in conversation.json()["messages"]] == [
        "user",
        "assistant",
    ]

    with knowledge_context.factory() as db:
        assert db.scalar(
            select(KnowledgeChunk).where(KnowledgeChunk.document_id == document_id)
        )
    removed = knowledge_context.client.delete(
        f"/api/documents/{document_id}",
        headers=knowledge_context.owner_headers,
    )
    assert removed.status_code == 204
    with knowledge_context.factory() as db:
        assert db.scalars(
            select(KnowledgeChunk).where(KnowledgeChunk.document_id == document_id)
        ).all() == []


def test_indexing_search_and_conversations_enforce_user_ownership(knowledge_context):
    document_id = _upload(knowledge_context).json()["id"]
    response = knowledge_context.client.post(
        f"/api/knowledge/documents/{document_id}/index",
        headers=knowledge_context.other_headers,
    )
    assert response.status_code == 404

    search = knowledge_context.client.post(
        "/api/knowledge/search",
        json={"query": "project", "document_ids": [document_id]},
        headers=knowledge_context.other_headers,
    )
    assert search.status_code == 404

    conversation = knowledge_context.client.post(
        "/api/knowledge/conversations",
        json={"title": "Private"},
        headers=knowledge_context.owner_headers,
    ).json()
    detail = knowledge_context.client.get(
        f"/api/knowledge/conversations/{conversation['id']}",
        headers=knowledge_context.other_headers,
    )
    assert detail.status_code == 404

    with knowledge_context.factory() as db:
        assert db.scalar(select(Document).where(Document.id == document_id))
        assert db.scalars(select(KnowledgeMessage)).all() == []


def test_ask_reports_insufficient_evidence_without_claiming_ai_answer(
    knowledge_context,
):
    response = knowledge_context.client.post(
        "/api/knowledge/ask",
        json={"question": "What is in my documents?"},
        headers=knowledge_context.owner_headers,
    )
    assert response.status_code == 200
    assert response.json()["ai_generated"] is False
    assert response.json()["citations"] == []
    assert "not contain enough information" in response.json()["answer"]


def test_indexing_failure_is_reported_and_persisted(knowledge_context, monkeypatch):
    monkeypatch.setattr(
        knowledge_service,
        "_embed",
        lambda _texts, **_kwargs: (_ for _ in ()).throw(
            HTTPException(503, "provider unavailable")
        ),
    )
    document_id = _upload(knowledge_context).json()["id"]
    response = knowledge_context.client.post(
        f"/api/knowledge/documents/{document_id}/index",
        headers=knowledge_context.owner_headers,
    )
    assert response.status_code == 503
    with knowledge_context.factory() as db:
        document = db.get(Document, document_id)
        assert document.indexing_status == "failed"


def test_ask_does_not_claim_success_when_provider_fails(knowledge_context, monkeypatch):
    monkeypatch.setattr(
        knowledge_service,
        "_embed",
        lambda texts, **_kwargs: [[1.0, 0.0] for _ in texts],
    )
    document_id = _upload(knowledge_context).json()["id"]
    indexed = knowledge_context.client.post(
        f"/api/knowledge/documents/{document_id}/index",
        headers=knowledge_context.owner_headers,
    )
    assert indexed.status_code == 200

    def fail(**_kwargs):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(
        knowledge_service,
        "_client",
        lambda: SimpleNamespace(models=SimpleNamespace(generate_content=fail)),
    )
    response = knowledge_context.client.post(
        "/api/knowledge/ask",
        json={"question": "When is the project launch?"},
        headers=knowledge_context.owner_headers,
    )
    assert response.status_code == 503
