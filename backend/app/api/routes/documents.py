"""Upload and manage user-owned documents."""

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.services.document_service import (
    create_document,
    delete_document,
    document_detail,
    document_row,
    get_owned_document,
    read_document_upload,
)
from app.utils.response import paginate

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data, content_type, filename = await read_document_upload(file)
    document = create_document(db, user, filename, content_type, data)
    return document_detail(document)


@router.get("")
def list_documents(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statement = (
        select(Document)
        .where(Document.user_id == user.id)
        .order_by(Document.created_at.desc(), Document.id.desc())
    )
    return paginate(db, statement, page, size, document_row)


@router.get("/{document_id}")
def get_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return document_detail(get_owned_document(db, user, document_id))


@router.delete("/{document_id}", status_code=204)
def remove_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_document(db, get_owned_document(db, user, document_id))
    return None
