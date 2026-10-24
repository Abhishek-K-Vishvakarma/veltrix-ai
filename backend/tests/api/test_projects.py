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
from app.models import Analysis, Document, Project, User


@pytest.fixture
def project_context():
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
    with factory() as db:
        owner = User(email="projects-owner@example.test", hashed_password="unused")
        other = User(email="projects-other@example.test", hashed_password="unused")
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


def test_projects_crud_and_resource_assignments(project_context):
    client = project_context.client
    headers = project_context.owner_headers

    created = client.post(
        "/api/projects",
        json={"name": "  Market research  ", "description": "  Competitor review  "},
        headers=headers,
    )
    assert created.status_code == 201
    project = created.json()
    assert project["name"] == "Market research"
    assert project["description"] == "Competitor review"
    assert project["analysis_count"] == project["document_count"] == 0

    with project_context.factory() as db:
        document = Document(
            user_id=project_context.owner_id,
            filename="brief.txt",
            content_type="text/plain",
            size_bytes=12,
            storage_path="brief.txt",
        )
        analysis = Analysis(user_id=project_context.owner_id, title="Brief review")
        db.add_all([document, analysis])
        db.commit()
        document_id, analysis_id = document.id, analysis.id

    attached_document = client.post(
        f"/api/projects/{project['id']}/documents/{document_id}", headers=headers
    )
    assert attached_document.status_code == 200
    assert attached_document.json()["document_count"] == 1

    attached_analysis = client.post(
        f"/api/projects/{project['id']}/analyses/{analysis_id}", headers=headers
    )
    assert attached_analysis.status_code == 200
    assert attached_analysis.json()["analysis_count"] == 1

    detail = client.get(f"/api/projects/{project['id']}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["documents"][0]["id"] == document_id
    assert detail.json()["analyses"][0]["id"] == analysis_id

    updated = client.patch(
        f"/api/projects/{project['id']}",
        json={"status": "archived"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "archived"

    listing = client.get("/api/projects", headers=headers)
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
    assert listing.json()["active_count"] == 0
    assert listing.json()["analysis_count"] == 1

    removed = client.delete(
        f"/api/projects/{project['id']}/documents/{document_id}", headers=headers
    )
    assert removed.status_code == 204
    deleted = client.delete(f"/api/projects/{project['id']}", headers=headers)
    assert deleted.status_code == 204
    with project_context.factory() as db:
        assert db.get(Project, project["id"]) is None
        assert db.get(Document, document_id) is not None
        assert db.get(Analysis, analysis_id) is not None
        assert db.scalar(select(Project.id)) is None


def test_projects_are_private_and_reject_duplicate_names(project_context):
    client = project_context.client
    created = client.post(
        "/api/projects",
        json={"name": "Private project"},
        headers=project_context.owner_headers,
    )
    project_id = created.json()["id"]
    assert client.get("/api/projects").status_code == 401
    assert (
        client.get(
            f"/api/projects/{project_id}", headers=project_context.other_headers
        ).status_code
        == 404
    )
    duplicate = client.post(
        "/api/projects",
        json={"name": "Private project"},
        headers=project_context.owner_headers,
    )
    assert duplicate.status_code == 409


def test_projects_cannot_attach_another_users_resource(project_context):
    with project_context.factory() as db:
        other = db.scalar(select(User).where(User.email == "projects-other@example.test"))
        document = Document(
            user_id=other.id,
            filename="private.txt",
            content_type="text/plain",
            size_bytes=1,
            storage_path="private.txt",
        )
        db.add(document)
        db.commit()
        document_id = document.id
    project = project_context.client.post(
        "/api/projects",
        json={"name": "Owned project"},
        headers=project_context.owner_headers,
    ).json()

    response = project_context.client.post(
        f"/api/projects/{project['id']}/documents/{document_id}",
        headers=project_context.owner_headers,
    )
    assert response.status_code == 404
