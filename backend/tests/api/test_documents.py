from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.core.security import create_access_token
from app.db.base import Base
from app.main import app
from app.models import Document, User


@pytest.fixture
def document_context(tmp_path, monkeypatch):
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
    monkeypatch.setattr("app.storage.local_storage._base", lambda: tmp_path / "uploads")
    with factory() as db:
        owner = User(email="document-owner@example.test", hashed_password="unused")
        other = User(email="document-other@example.test", hashed_password="unused")
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


def _upload(context, name="notes.txt", data=b"document text"):
    return context.client.post(
        "/api/documents",
        files={"file": (name, data, "text/plain")},
        headers=context.owner_headers,
    )


def test_upload_list_detail_and_delete_document(document_context):
    uploaded = _upload(document_context, r"..\private notes.txt")
    assert uploaded.status_code == 201
    detail = uploaded.json()
    document_id = detail["id"]
    assert detail["filename"] == "private_notes.txt"
    assert detail["content_type"] == "text/plain"
    assert detail["size_bytes"] == len(b"document text")
    assert "storage_path" not in detail

    listed = document_context.client.get(
        "/api/documents?page=1&size=1", headers=document_context.owner_headers
    )
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["id"] == document_id

    retrieved = document_context.client.get(
        f"/api/documents/{document_id}", headers=document_context.owner_headers
    )
    assert retrieved.status_code == 200
    assert retrieved.json()["filename"] == "private_notes.txt"

    with document_context.factory() as db:
        document = db.get(Document, document_id)
        storage_path = document.storage_path
        assert storage_path.endswith("private_notes.txt")
        assert (
            db.scalar(select(Document.user_id).where(Document.id == document_id))
            == document_context.owner_id
        )
    assert Path(storage_path).is_file()

    deleted = document_context.client.delete(
        f"/api/documents/{document_id}", headers=document_context.owner_headers
    )
    assert deleted.status_code == 204
    assert not Path(storage_path).exists()
    with document_context.factory() as db:
        assert db.get(Document, document_id) is None


def test_documents_are_private_and_endpoints_require_auth(document_context):
    uploaded = _upload(document_context)
    document_id = uploaded.json()["id"]

    assert document_context.client.get("/api/documents").status_code == 401
    assert (
        document_context.client.get(
            f"/api/documents/{document_id}",
            headers=document_context.other_headers,
        ).status_code
        == 404
    )
    assert (
        document_context.client.delete(
            f"/api/documents/{document_id}",
            headers=document_context.other_headers,
        ).status_code
        == 404
    )
    with document_context.factory() as db:
        assert db.get(Document, document_id) is not None
    assert _upload(document_context, "another.txt").status_code == 201
    listing = document_context.client.get(
        "/api/documents", headers=document_context.other_headers
    )
    assert listing.status_code == 200
    assert listing.json()["items"] == []


@pytest.mark.parametrize(
    ("filename", "data", "status"),
    [
        ("payload.exe", b"content", 415),
        ("empty.txt", b"", 400),
        ("bad.pdf", b"not a PDF", 400),
    ],
)
def test_upload_rejects_invalid_files(document_context, filename, data, status):
    response = document_context.client.post(
        "/api/documents",
        files={"file": (filename, data, "application/octet-stream")},
        headers=document_context.owner_headers,
    )
    assert response.status_code == status
