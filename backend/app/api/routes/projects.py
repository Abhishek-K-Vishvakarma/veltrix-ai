from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Analysis, Document, Project, User
from app.models.project import project_analyses, project_documents
from app.schemas.project import ProjectCreate, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


def _owned_project(db: Session, user: User, project_id: int) -> Project:
    project = db.scalar(
        select(Project).where(Project.id == project_id, Project.user_id == user.id)
    )
    if project is None:
        raise HTTPException(404, "Project not found")
    return project


def _project_counts(db: Session, project_id: int) -> tuple[int, int]:
    analysis_count = db.scalar(
        select(func.count())
        .select_from(project_analyses)
        .where(project_analyses.c.project_id == project_id)
    ) or 0
    document_count = db.scalar(
        select(func.count())
        .select_from(project_documents)
        .where(project_documents.c.project_id == project_id)
    ) or 0
    return analysis_count, document_count


def _project_row(db: Session, project: Project) -> dict:
    analysis_count, document_count = _project_counts(db, project.id)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "analysis_count": analysis_count,
        "document_count": document_count,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


def _project_detail(db: Session, project: Project) -> dict:
    result = _project_row(db, project)
    result["analyses"] = [
        {
            "id": analysis.id,
            "title": analysis.title,
            "status": analysis.status,
            "category": analysis.category,
            "created_at": analysis.created_at,
        }
        for analysis in project.analyses
    ]
    result["documents"] = [
        {
            "id": document.id,
            "filename": document.filename,
            "content_type": document.content_type,
            "size_bytes": document.size_bytes,
            "created_at": document.created_at,
        }
        for document in project.documents
    ]
    return result


@router.get("")
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.scalars(
        select(Project)
        .where(Project.user_id == user.id)
        .order_by(Project.updated_at.desc(), Project.id.desc())
    ).all()
    items = [_project_row(db, project) for project in projects]
    return {
        "items": items,
        "total": len(items),
        "active_count": sum(project["status"] == "active" for project in items),
        "analysis_count": sum(project["analysis_count"] for project in items),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = Project(
        user_id=user.id,
        name=body.name,
        description=body.description,
    )
    db.add(project)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "A project with this name already exists") from None
    db.refresh(project)
    return _project_row(db, project)


@router.get("/{project_id}")
def get_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _project_detail(db, _owned_project(db, user, project_id))


@router.patch("/{project_id}")
def update_project(
    project_id: int,
    body: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _owned_project(db, user, project_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    project.updated_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "A project with this name already exists") from None
    db.refresh(project)
    return _project_row(db, project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _owned_project(db, user, project_id)
    project.analyses.clear()
    project.documents.clear()
    db.delete(project)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _attach_resource(
    db: Session,
    project: Project,
    resource_id: int,
    resource_model: type[Analysis] | type[Document],
    relationship_name: str,
) -> dict:
    resource = db.scalar(
        select(resource_model).where(
            resource_model.id == resource_id,
            resource_model.user_id == project.user_id,
        )
    )
    if resource is None:
        raise HTTPException(404, "Resource not found")
    resources = getattr(project, relationship_name)
    if all(item.id != resource_id for item in resources):
        resources.append(resource)
        project.updated_at = datetime.now(timezone.utc)
        db.commit()
    return _project_detail(db, project)


def _detach_resource(
    db: Session,
    project: Project,
    resource_id: int,
    relationship_name: str,
) -> dict:
    resources = getattr(project, relationship_name)
    resource = next((item for item in resources if item.id == resource_id), None)
    if resource is None:
        raise HTTPException(404, "Project resource not found")
    resources.remove(resource)
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    return _project_detail(db, project)


@router.post("/{project_id}/analyses/{analysis_id}")
def add_analysis(
    project_id: int,
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _owned_project(db, user, project_id)
    return _attach_resource(db, project, analysis_id, Analysis, "analyses")


@router.delete(
    "/{project_id}/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_analysis(
    project_id: int,
    analysis_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _owned_project(db, user, project_id)
    _detach_resource(db, project, analysis_id, "analyses")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{project_id}/documents/{document_id}")
def add_document(
    project_id: int,
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _owned_project(db, user, project_id)
    return _attach_resource(db, project, document_id, Document, "documents")


@router.delete(
    "/{project_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_document(
    project_id: int,
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = _owned_project(db, user, project_id)
    _detach_resource(db, project, document_id, "documents")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
