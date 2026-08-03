from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.grounded_answer import GroundedAnswerService
from app.models import AskRequest, AskResponse, Source

app = FastAPI(
    title="Engineering Onboarding Copilot",
    version="0.2.0",
    description="Grounded AI assistant for engineering onboarding.",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    try:
        result = GroundedAnswerService().answer(
            request.question
        )

        sources = [
            Source(
                id=source["id"],
                title=source["title"],
                section=source["section"],
                excerpt=source["content"][:240],
            )
            for source in result["sources"]
        ]

        return AskResponse(
            answer=result["answer"],
            grounded=result["grounded"],
            sources=sources,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc