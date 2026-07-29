# Engineering Onboarding Copilot

An AI assistant that helps new engineers understand a codebase, team conventions, architecture, onboarding steps, and internal documentation.

## Why this exists

Engineering onboarding is often fragmented across docs, tribal knowledge, Slack threads, and meetings. This project explores how an AI copilot can reduce time-to-context while preserving source grounding and making uncertainty explicit.

## MVP capabilities

- Ask onboarding questions through a FastAPI endpoint
- Retrieve relevant snippets from a local knowledge base
- Send grounded context to an LLM through a provider abstraction
- Return an answer plus the source documents used
- Swap the model/provider layer without rewriting the API
- Run automated API tests

## Architecture

Client → FastAPI → Retrieval Service → AI Provider → Response + Sources

The MVP uses lightweight lexical retrieval so the full flow is easy to understand and test. The next iteration replaces retrieval with embeddings + PostgreSQL/pgvector, then adds evaluations, observability, document ingestion, auth, and a UI.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# add your OPENAI_API_KEY
uvicorn app.main:app --reload
```

Open:

- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

## Example

```bash
curl -X POST http://127.0.0.1:8000/ask   -H "Content-Type: application/json"   -d '{"question":"How should I ship my first production change?"}'
```

## Portfolio roadmap

### V1 — Working MVP
- grounded Q&A
- provider abstraction
- API
- tests

### V2 — Production retrieval
- document upload
- chunking
- embeddings
- PostgreSQL + pgvector
- citations with chunk IDs

### V3 — Onboarding intelligence
- role-aware onboarding plans
- knowledge-gap detection
- quiz generation
- confidence scoring
- feedback capture

### V4 — Enterprise layer
- auth/RBAC
- Slack integration
- observability
- eval suite
- cost/latency tracking
- Claude provider + model routing

## Interview story

> I built an engineering onboarding copilot designed around a real enterprise problem: reducing time-to-context for new engineers. I intentionally separated retrieval, model providers, and API concerns so the system could evolve from a simple MVP into a multi-provider, evaluated production service.
