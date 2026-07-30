from pgvector import Vector

from app.database import get_connection
from app.embeddings import EmbeddingService


class VectorRetriever:
    def __init__(self):
        self.embedding_service = EmbeddingService()

    def retrieve(
        self,
        question: str,
        limit: int = 3,
        source: str | None = None,
    ) -> list[dict]:
        query_embedding = Vector(
            self.embedding_service.embed(question)
        )

        with get_connection() as connection:
            with connection.cursor() as cursor:
                if source:
                    cursor.execute(
                        """
                        SELECT
                            d.title,
                            d.source,
                            c.section,
                            c.content,
                            c.chunk_index,
                            c.embedding <=> %s AS distance
                        FROM chunks c
                        JOIN documents d
                            ON d.id = c.document_id
                        WHERE d.source = %s
                        ORDER BY c.embedding <=> %s
                        LIMIT %s
                        """,
                        (
                            query_embedding,
                            source,
                            query_embedding,
                            limit,
                        ),
                    )
                else:
                    cursor.execute(
                        """
                        SELECT
                            d.title,
                            d.source,
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
                "source": row[1],
                "section": row[2],
                "content": row[3],
                "chunk_index": row[4],
                "distance": float(row[5]),
            }
            for row in rows
        ]