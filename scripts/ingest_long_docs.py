import json
from pathlib import Path

from app.chunking import SectionChunker
from app.database import get_connection
from app.embeddings import EmbeddingService


KNOWLEDGE_PATH = (
    Path(__file__).resolve().parent.parent
    / "knowledge"
    / "long_docs.json"
)

SOURCE_NAME = "knowledge/long_docs.json"


def load_documents() -> list[dict]:
    return json.loads(KNOWLEDGE_PATH.read_text())


def ingest():
    documents = load_documents()

    embedding_service = EmbeddingService()
    chunker = SectionChunker()

    with get_connection() as connection:
        with connection.cursor() as cursor:
            for document in documents:
                # Create or update the parent document.
                cursor.execute(
                    """
                    INSERT INTO documents (title, source)
                    VALUES (%s, %s)
                    ON CONFLICT (title)
                    DO UPDATE SET source = EXCLUDED.source
                    RETURNING id
                    """,
                    (
                        document["title"],
                        SOURCE_NAME,
                    ),
                )

                document_id = cursor.fetchone()[0]

                # Remove previously ingested chunks for this document.
                # This keeps ingestion idempotent.
                cursor.execute(
                    """
                    DELETE FROM chunks
                    WHERE document_id = %s
                    """,
                    (document_id,),
                )

                # Split the document along semantic section boundaries.
                chunks = chunker.chunk(
                    document["content"]
                )

                for chunk_index, chunk in enumerate(chunks):
                    # Each section gets its own embedding.
                    embedding = embedding_service.embed(
                        chunk["content"]
                    )

                    cursor.execute(
                        """
                        INSERT INTO chunks (
                            document_id,
                            section,
                            content,
                            chunk_index,
                            embedding
                        )
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            document_id,
                            chunk["section"],
                            chunk["content"],
                            chunk_index,
                            embedding,
                        ),
                    )

                print(
                    f"Ingested: {document['title']} "
                    f"({len(chunks)} chunks)"
                )

        connection.commit()


if __name__ == "__main__":
    ingest()