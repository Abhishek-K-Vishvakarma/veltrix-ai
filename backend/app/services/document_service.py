"""Persistence and ownership operations for uploaded documents."""

import logging
import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.user import User
from app.storage import local_storage
from app.utils.file_validation import MAX_BYTES, validate_upload

logger = logging.getLogger(__name__)


async def read_document_upload(file: UploadFile) -> tuple[bytes, str, str]:
    data = await file.read(MAX_BYTES + 1)
    content_type = validate_upload(file, data)
    original_filename = (file.filename or "").replace("\\", "/").rsplit("/", 1)[-1]
    filename = re.sub(r"[^A-Za-z0-9._-]", "_", original_filename).strip("._")
    if not filename:
        raise HTTPException(400, "Invalid filename")
    return data, content_type, filename


def create_document(
    db: Session,
    owner: User,
    filename: str,
    content_type: str,
    data: bytes,
) -> Document:
    storage_path = local_storage.save_bytes(
        f"{owner.id}/documents", filename, data
    )
    document = Document(
        user_id=owner.id,
        filename=filename,
        content_type=content_type,
        size_bytes=len(data),
        storage_path=storage_path,
    )
    try:
        db.add(document)
        db.commit()
        db.refresh(document)
    except Exception:
        db.rollback()
        try:
            Path(storage_path).unlink(missing_ok=True)
        except OSError:
            logger.exception("Failed to remove document upload after database failure")
        raise
    return document


def get_owned_document(db: Session, owner: User, document_id: int) -> Document:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == owner.id,
        )
    )
    if document is None:
        raise HTTPException(404, "Document not found")
    return document


def document_row(document: Document) -> dict:
    return {
        "id": document.id,
        "filename": document.filename,
        "content_type": document.content_type,
        "size_bytes": document.size_bytes,
        "created_at": document.created_at,
    }


def document_detail(document: Document) -> dict:
    return document_row(document)


def delete_document(db: Session, document: Document) -> None:
    document_values = {
        "id": document.id,
        "user_id": document.user_id,
        "filename": document.filename,
        "content_type": document.content_type,
        "size_bytes": document.size_bytes,
        "storage_path": document.storage_path,
        "created_at": document.created_at,
    }
    chunk_values = [
        {
            "document_id": chunk.document_id,
            "chunk_index": chunk.chunk_index,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "embedding": chunk.embedding,
        }
        for chunk in db.scalars(
            select(KnowledgeChunk).where(
                KnowledgeChunk.document_id == document.id
            )
        ).all()
    ]
    storage_root = local_storage._base().resolve()
    storage_path = Path(document_values["storage_path"]).resolve()
    if not storage_path.is_relative_to(storage_root):
        raise HTTPException(500, "Document storage reference is invalid")

    staged_path = storage_path.with_name(
        f".{storage_path.name}.{uuid.uuid4().hex}.deleting"
    )
    moved_file = False
    if storage_path.exists():
        storage_path.replace(staged_path)
        moved_file = True

    try:
        db.query(KnowledgeChunk).filter(
            KnowledgeChunk.document_id == document.id
        ).delete(synchronize_session=False)
        db.delete(document)
        db.commit()
    except Exception:
        db.rollback()
        if moved_file:
            try:
                staged_path.replace(storage_path)
            except OSError:
                logger.exception("Failed to restore document after database deletion failed")
        raise

    if moved_file:
        try:
            staged_path.unlink()
        except OSError:
            logger.exception("Failed to remove staged document after database deletion")
            try:
                staged_path.replace(storage_path)
                db.add(
                    Document(
                        **document_values,
                    )
                )
                db.add_all(
                    KnowledgeChunk(**chunk_values) for chunk_values in chunk_values
                )
                db.commit()
            except Exception:
                db.rollback()
                logger.exception("Failed to restore document after storage deletion failed")
            raise HTTPException(500, "Could not delete document file")
