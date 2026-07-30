import json
from pathlib import Path

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

    with get_connection() as connection:
        with connection.cursor() as cursor:
            for document in documents:
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

                cursor.execute(
                    """
                    DELETE FROM chunks
                    WHERE document_id = %s
                    """,
                    (document_id,),
                )

                content = document["content"]

                embedding = embedding_service.embed(content)

                cursor.execute(
                    """
                    INSERT INTO chunks (
                        document_id,
                        content,
                        chunk_index,
                        embedding
                    )
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        document_id,
                        content,
                        0,
                        embedding,
                    ),
                )

                print(f"Ingested: {document['title']}")

        connection.commit()


if __name__ == "__main__":
    ingest()