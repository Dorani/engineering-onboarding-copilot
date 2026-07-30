from pgvector import Vector

from app.database import get_connection
from app.embeddings import EmbeddingService


class VectorRetriever:
    def __init__(self):
        self.embedding_service = EmbeddingService()

    def retrieve(self, question: str, limit: int = 3) -> list[dict]:
        query_embedding = Vector(
            self.embedding_service.embed(question)
        )

        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        d.title,
                        c.section,
                        c.content,
                        c.chunk_index,
                        c.embedding <=> %s AS distance
                    FROM chunks c
                    JOIN documents d
                        ON d.id = c.document_id
                    ORDER BY c.embedding <=> %s
                    LIMIT %s
                    """,
                    (
                        query_embedding,
                        query_embedding,
                        limit,
                    ),
                )

                rows = cursor.fetchall()

        return [
            {
                "title": row[0],
                "section": row[1],
                "content": row[2],
                "chunk_index": row[3],
                "distance": float(row[4]),
            }
            for row in rows
        ]