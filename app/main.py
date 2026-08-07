from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.documents import (
    DocumentNotFoundError,
    DocumentService,
)
from app.grounded_answer import GroundedAnswerService
from app.ingestion import (
    DocumentIngestionService,
    EmptyDocumentError,
    IngestionError,
    UnsupportedFileTypeError,
)
from app.models import (
    AskRequest,
    AskResponse,
    DocumentDetail,
    DeleteDocumentResponse,
    DocumentSummary,
    DocumentUploadResponse,
    Source,
)

app = FastAPI(
    title="Engineering Onboarding Copilot",
    version="0.4.0",
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


@app.post(
    "/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=201,
)
def upload_document(
    file: UploadFile = File(...),
):
    try:
        file_bytes = file.file.read()

        result = DocumentIngestionService().ingest(
            file_name=file.filename or "",
            content_type=file.content_type,
            file_bytes=file_bytes,
        )

        return DocumentUploadResponse(**result)

    except UnsupportedFileTypeError as exc:
        raise HTTPException(
            status_code=415,
            detail=str(exc),
        ) from exc

    except EmptyDocumentError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except IngestionError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Document ingestion failed.",
        ) from exc

    finally:
        file.file.close()


@app.get(
    "/documents",
    response_model=list[DocumentSummary],
)
def list_documents():
    try:
        documents = DocumentService().list_documents()

        return [
            DocumentSummary(**document)
            for document in documents
        ]

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Documents could not be loaded.",
        ) from exc


@app.get(
    "/documents/{document_id}",
    response_model=DocumentDetail,
)
def get_document(document_id: int):
    try:
        document = DocumentService().get_document(document_id)

        return DocumentDetail(**document)

    except DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Document details could not be loaded.",
        ) from exc


@app.post(
    "/ask",
    response_model=AskResponse,
)
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
        
@app.delete(
    "/documents/{document_id}",
    response_model=DeleteDocumentResponse,
)
def delete_document(document_id: int):
    try:
        DocumentService().delete_document(document_id)

        return DeleteDocumentResponse(
            document_id=document_id,
            deleted=True,
        )

    except DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Document could not be deleted.",
        ) from exc