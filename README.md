# Engineering Onboarding Copilot

A production-oriented Retrieval-Augmented Generation (RAG) system for helping engineers understand internal documentation, architecture, production practices, reliability standards, and engineering conventions.

The project demonstrates how an AI assistant can move beyond basic semantic search into an evaluated, grounded retrieval system with section-aware chunking, vector search, reranking, citations, abstention, and a FastAPI interface.

## Why This Exists

Engineering onboarding knowledge is often fragmented across documentation, codebases, operational runbooks, Slack conversations, and tribal knowledge.

A new engineer may need to answer questions such as:

- How should I release a production change?
- What happens during a customer-impacting incident?
- Should an API route call an external AI provider directly?
- What should reviewers evaluate during code review?
- How should production AI systems be evaluated?

An LLM can answer these questions fluently, but fluency alone is not enough for internal engineering knowledge.

The system should retrieve the right evidence, distinguish relevant evidence from semantic noise, cite the evidence used, and refuse to invent answers when the knowledge base does not support them.

That is the problem this project explores.

---

## Architecture

```text
                         ┌──────────────────────┐
                         │       Client         │
                         └──────────┬───────────┘
                                    │
                              POST /ask
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       FastAPI        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Grounded Answer      │
                         │ Service              │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Vector Retrieval     │
                         │ PostgreSQL + pgvector│
                         └──────────┬───────────┘
                                    │
                              Candidate Set
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Reranker        │
                         └──────────┬───────────┘
                                    │
                               Top Evidence
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Context Assembly     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   LLM Generation     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Grounding + Citation │
                         │ Filtering            │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         Answer + Grounded Status
                              + Used Sources
```

Documents are processed through a separate ingestion pipeline:

```text
Knowledge Documents
        │
        ▼
Section-Aware Chunking
        │
        ▼
Embedding Generation
        │
        ▼
PostgreSQL + pgvector
```

---

## Core Capabilities

### Semantic Retrieval

Documents and chunks are embedded and stored in PostgreSQL using pgvector.

Queries are embedded at runtime and compared against stored chunk embeddings to retrieve semantically relevant evidence.

### Section-Aware Chunking

Long documents are split along meaningful section boundaries rather than treated as single documents.

For example:

```text
Engineering Production Handbook
├── Release Preparation
├── CI Validation
├── Feature Flags
├── Database Migrations
├── Progressive Rollout
├── Health Validation
├── Rollback
└── Post-Deployment Monitoring
```

This improved retrieval precision by allowing the system to retrieve the specific section containing the answer instead of embedding an entire handbook as one vector.

### Reranking

Vector retrieval produces a candidate set, which is reranked before context is sent to the model.

This separates:

```text
candidate retrieval
```

from:

```text
final evidence selection
```

and significantly improved ranking quality during evaluation.

### Grounded Answer Generation

The generation layer receives only selected evidence and is instructed to answer from that context.

Answers include source references such as:

```text
[Source 1]
[Source 2]
```

Only sources actually referenced by the generated answer are returned through the API.

### Abstention

When retrieved evidence does not support the question, the system can explicitly decline to answer.

Example:

```text
Question:
What is the company's parental leave policy?

Answer:
The provided context does not include information about the company's
parental leave policy.

Grounded: false
Sources: []
```

This prevents semantically nearby but irrelevant documents from being presented as supporting evidence.

### Provider Abstraction

The model provider is separated from retrieval and API concerns through a provider interface.

This allows model implementations to evolve without rewriting the rest of the application architecture.

---

## Evaluation

Evaluation was treated as part of the architecture rather than an afterthought.

The project includes evaluation suites for:

- retrieval quality
- long-document retrieval
- chunk-level retrieval
- reranked retrieval
- grounding behavior
- citation presence
- citation validity
- abstention behavior

### Chunk-Level Retrieval Results

Current long-document chunk evaluation:

| Retrieval Strategy |      Top-1 |  Recall@3 |       MRR |
| ------------------ | ---------: | --------: | --------: |
| Vector Retrieval   |     100.0% |     90.0% |     1.000 |
| Vector + Reranking | **100.0%** | **96.7%** | **1.000** |

Reranking preserved perfect Top-1 performance while increasing Recall@3 from 90.0% to 96.7%.

### Generation Evaluation

Current generation evaluation:

| Metric              |         Result |
| ------------------- | -------------: |
| Grounding Accuracy  | **100% (6/6)** |
| Citation Presence   | **100% (4/4)** |
| Citation Validity   | **100% (4/4)** |
| Abstention Accuracy | **100% (2/2)** |

These results apply to the current curated evaluation datasets and are intended as regression baselines rather than claims of general production accuracy.

---

## Engineering Evolution

The system was intentionally developed incrementally.

### 1. Lexical Retrieval Baseline

The initial MVP used lightweight lexical retrieval.

This established the complete application flow before introducing infrastructure complexity:

```text
Question
→ Retrieval
→ Context
→ LLM
→ Answer
```

### 2. Vector Retrieval

The lexical baseline was replaced with embedding-based semantic retrieval backed by PostgreSQL and pgvector.

This allowed conceptually similar questions to retrieve relevant documentation even when wording differed.

### 3. Retrieval Evaluation

A repeatable evaluation dataset was introduced to measure retrieval behavior instead of relying on manually selected demos.

Metrics included:

- Top-1 accuracy
- Recall@K
- Mean Reciprocal Rank (MRR)

### 4. Reranking

Vector retrieval was expanded into candidate retrieval followed by reranking.

This improved final evidence ordering and separated broad semantic recall from final relevance selection.

### 5. Long-Document Stress Testing

Longer handbook-style documents exposed a limitation in whole-document embeddings: a single vector had to represent many unrelated concepts.

### 6. Section-Aware Chunking

Long documents were split along semantic section boundaries.

Chunk metadata preserves both document and section identity:

```text
Engineering Production Handbook > Database Migrations
Engineering Production Handbook > Rollback
Engineering Quality Guide > Logging
AI Engineering Standards > Prompt Management
```

This produced a substantial improvement in chunk-level retrieval quality.

### 7. Grounded Generation

Retrieved evidence was connected to a dedicated grounded answer layer that:

- assembles structured context
- generates answers from retrieved evidence
- preserves source identities
- filters unused citations
- distinguishes supported from unsupported questions

### 8. API Contract

The complete pipeline is exposed through FastAPI with Pydantic request and response models.

### 9. Automated Evaluation and Tests

API tests verify:

- health endpoint behavior
- grounded answers
- abstention
- citation/source response mapping
- invalid input handling

Generation evals verify system behavior beyond retrieval alone.

---

## Technology Stack

**Application**

- Python
- FastAPI
- Pydantic

**AI**

- OpenAI embeddings
- LLM provider abstraction
- Retrieval-Augmented Generation

**Retrieval**

- PostgreSQL
- pgvector
- vector similarity search
- reranking
- section-aware chunking

**Infrastructure**

- Docker
- Docker Compose
- reproducible database initialization

**Quality**

- pytest
- retrieval evaluation datasets
- generation evaluation datasets
- ranking metrics
- grounding and citation checks

---

## Project Structure

```text
app/
├── chunking.py
├── config.py
├── context.py
├── database.py
├── embeddings.py
├── grounded_answer.py
├── main.py
├── models.py
├── providers/
├── reranked_retrieval.py
├── reranker.py
├── retrieval.py
├── service.py
└── vector_retrieval.py

db/
└── init.sql

evals/
├── generation_cases.json
├── long_doc_cases.json
├── long_doc_chunk_cases.json
├── retrieval_cases.json
├── run_chunk_eval.py
├── run_generation_eval.py
├── run_long_doc_eval.py
└── run_retrieval_eval.py

knowledge/
├── docs.json
└── long_docs.json

scripts/
├── ingest.py
├── ingest_long_docs.py
├── test_chunking.py
├── test_context.py
├── test_grounded_answer.py
├── test_reranking.py
└── test_retrieval.py

tests/
└── test_api.py
```

---

## Running Locally

### 1. Clone and configure the project

```bash
git clone <repository-url>
cd engineering-onboarding-copilot

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
```

Add the required API credentials to `.env`.

### 2. Start PostgreSQL

```bash
docker compose up -d
```

The database initialization script automatically creates the required pgvector extension and schema for a fresh database.

### 3. Ingest the knowledge base

```bash
python -m scripts.ingest
python -m scripts.ingest_long_docs
```

### 4. Start the API

```bash
uvicorn app.main:app --reload
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

Health endpoint:

```text
http://127.0.0.1:8000/health
```

---

## API Example

Request:

```bash
curl -X POST http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "My deployment is affecting customers. What should the team do?"
  }'
```

Example response:

```json
{
  "answer": "Notify the incident channel, assign an incident lead, and prioritize mitigation before root-cause analysis. [Source 1]",
  "grounded": true,
  "sources": [
    {
      "id": 1,
      "title": "Incident Escalation",
      "section": null,
      "excerpt": "If a production issue affects customers..."
    }
  ]
}
```

---

## Running Tests

Run the API test suite:

```bash
pytest tests/test_api.py -v
```

Run the retrieval evaluations:

```bash
python -m evals.run_retrieval_eval
python -m evals.run_long_doc_eval
python -m evals.run_chunk_eval --mode global
python -m evals.run_chunk_eval --mode isolated
```

Run generation evaluation:

```bash
python -m evals.run_generation_eval
```

---

## Design Principles

**Measure before optimizing.** Architectural changes are evaluated against repeatable datasets rather than judged from individual demonstrations.

**Separate retrieval from generation.** Poor answers may originate from evidence retrieval or answer synthesis. Evaluating them independently makes failures easier to diagnose.

**Retrieve broadly, select carefully.** Vector retrieval provides candidate recall; reranking determines which evidence should reach generation.

**Chunk around meaning.** Section-aware chunks preserve semantic boundaries and make retrieved evidence easier to understand and cite.

**Ground or abstain.** The system should distinguish between having relevant evidence and merely finding the nearest available document.

**Preserve provenance.** Document and section metadata survive retrieval so answers can identify where evidence originated.

**Keep boundaries replaceable.** Retrieval, model providers, generation, and HTTP concerns remain separated so individual components can evolve independently.

---

## Current Scope

This repository focuses on the RAG and evaluation architecture.

Potential future extensions include document upload pipelines, authentication and RBAC, observability, cost and latency tracking, feedback capture, model routing, additional providers, Slack integration, and a user-facing interface.

These are intentionally outside the current core rather than being required for the retrieval system to demonstrate its architecture.

---

## APP Story

This project started as a simple engineering onboarding assistant and evolved through measured failure modes.

The initial lexical baseline established the application flow. Semantic retrieval improved matching across paraphrased questions, but evaluation showed that retrieval quality could be improved further. Reranking improved evidence ordering.

Long-document testing then exposed a deeper architectural problem: whole-document embeddings were too coarse for documents containing multiple unrelated concepts. Section-aware chunking addressed that problem and materially improved retrieval metrics.

The final system adds grounded generation, citation filtering, abstention, API validation, reproducible infrastructure, and evaluation across both retrieval and answer behavior.

The result is not simply an LLM wrapper. It is an evaluated RAG system designed around retrieval quality, evidence provenance, failure handling, and measurable iteration.
