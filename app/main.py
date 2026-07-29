from fastapi import FastAPI, HTTPException

from app.models import AskRequest, AskResponse, Source
from app.service import OnboardingService

app = FastAPI(
    title="Engineering Onboarding Copilot",
    version="0.1.0",
    description="Grounded AI assistant for engineering onboarding."
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    try:
        answer, docs = OnboardingService().ask(request.question)
        sources = [
            Source(title=doc["title"], excerpt=doc["content"][:240])
            for doc in docs
        ]
        return AskResponse(answer=answer, sources=sources)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
