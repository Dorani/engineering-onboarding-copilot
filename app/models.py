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