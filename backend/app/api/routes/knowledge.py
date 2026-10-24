"""Authenticated document indexing, retrieval, and grounded chat APIs."""

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import KnowledgeConversation, User
from app.schemas.knowledge import (
    ConversationCreate,
    KnowledgeAskRequest,
    KnowledgeSearchRequest,
)
from app.services.knowledge_service import (
    ask_knowledge,
    conversation_detail,
    conversation_row,
    create_conversation,
    get_owned_conversation,
    index_document,
    list_knowledge_documents,
    search_knowledge,
)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/documents")
def list_documents(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_knowledge_documents(db, user)


@router.post("/documents/{document_id}/index")
def index_user_document(
    document_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return index_document(db, user, document_id)


@router.post("/search")
def search_documents(
    body: KnowledgeSearchRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "results": search_knowledge(
            db,
            user,
            body.query.strip(),
            body.document_ids,
            body.limit,
        )
    }


@router.post("/ask")
def ask_documents(
    body: KnowledgeAskRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ask_knowledge(
        db,
        user,
        body.question,
        body.document_ids,
        body.conversation_id,
    )


@router.post("/conversations", status_code=status.HTTP_201_CREATED)
def create_user_conversation(
    body: ConversationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_conversation(db, user, body.title)


@router.get("/conversations")
def list_user_conversations(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statement = (
        select(KnowledgeConversation)
        .where(KnowledgeConversation.user_id == user.id)
        .order_by(
            KnowledgeConversation.updated_at.desc(),
            KnowledgeConversation.id.desc(),
        )
    )
    rows = db.scalars(statement.offset((page - 1) * size).limit(size)).all()
    total = db.scalar(
        select(func.count(KnowledgeConversation.id)).where(
            KnowledgeConversation.user_id == user.id
        )
    ) or 0
    return {
        "items": [conversation_row(row) for row in rows],
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size,
    }


@router.get("/conversations/{conversation_id}")
def get_user_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return conversation_detail(get_owned_conversation(db, user, conversation_id))


@router.delete(
    "/conversations/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = get_owned_conversation(db, user, conversation_id)
    db.delete(conversation)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
