from typing import Annotated

from pydantic import BaseModel, Field, field_validator

DocumentId = Annotated[int, Field(gt=0)]


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=1000)
    document_ids: list[DocumentId] | None = Field(default=None, max_length=100)
    limit: int = Field(default=5, ge=1, le=20)

    @field_validator("query", mode="before")
    @classmethod
    def trim_query(cls, value):
        return value.strip() if isinstance(value, str) else value


class KnowledgeAskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    document_ids: list[DocumentId] | None = Field(default=None, max_length=100)
    conversation_id: int | None = Field(default=None, gt=0)

    @field_validator("question", mode="before")
    @classmethod
    def trim_question(cls, value):
        return value.strip() if isinstance(value, str) else value


class ConversationCreate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
