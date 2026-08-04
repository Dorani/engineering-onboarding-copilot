from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(
        min_length=3,
        max_length=2000,
    )


class Source(BaseModel):
    id: int
    title: str
    section: str | None = None
    excerpt: str


class AskResponse(BaseModel):
    answer: str
    grounded: bool
    sources: list[Source]


DocumentStatus = Literal[
    "uploaded",
    "processing",
    "indexed",
    "failed",
]


class DocumentUploadResponse(BaseModel):
    document_id: int
    title: str
    file_name: str
    content_type: str
    status: DocumentStatus
    chunks_created: int


class DocumentSummary(BaseModel):
    id: int
    title: str
    source: str | None = None
    file_name: str | None = None
    content_type: str | None = None
    status: DocumentStatus
    chunk_count: int
    created_at: datetime


class DeleteDocumentResponse(BaseModel):
    document_id: int
    deleted: bool