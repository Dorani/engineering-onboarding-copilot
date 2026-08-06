from app.database import get_connection


class DocumentNotFoundError(Exception):
    """Raised when a requested document does not exist."""


class DocumentService:
    def list_documents(self) -> list[dict]:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        d.id,
                        d.title,
                        d.source,
                        d.file_name,
                        d.content_type,
                        d.status,
                        COUNT(c.id) AS chunk_count,
                        d.created_at
                    FROM documents d
                    LEFT JOIN chunks c
                        ON c.document_id = d.id
                    GROUP BY
                        d.id,
                        d.title,
                        d.source,
                        d.file_name,
                        d.content_type,
                        d.status,
                        d.created_at
                    ORDER BY d.created_at DESC
                    """
                )

                rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "title": row[1],
                "source": row[2],
                "file_name": row[3],
                "content_type": row[4],
                "status": row[5],
                "chunk_count": row[6],
                "created_at": row[7],
            }
            for row in rows
        ]

    def get_document(self, document_id: int) -> dict:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        d.id,
                        d.title,
                        d.source,
                        d.file_name,
                        d.content_type,
                        d.status,
                        d.created_at
                    FROM documents d
                    WHERE d.id = %s
                    """,
                    (document_id,),
                )

                document_row = cursor.fetchone()

                if document_row is None:
                    raise DocumentNotFoundError(
                        f"Document {document_id} was not found."
                    )

                cursor.execute(
                    """
                    SELECT
                        c.id,
                        c.section,
                        c.content,
                        c.chunk_index,
                        CASE
                            WHEN c.embedding IS NULL THEN NULL
                            ELSE vector_dims(c.embedding)
                        END AS embedding_dimensions
                    FROM chunks c
                    WHERE c.document_id = %s
                    ORDER BY c.chunk_index
                    """,
                    (document_id,),
                )

                chunk_rows = cursor.fetchall()

        chunks = [
            {
                "id": row[0],
                "section": row[1],
                "content": row[2],
                "chunk_index": row[3],
                "embedding_dimensions": row[4],
            }
            for row in chunk_rows
        ]

        return {
            "id": document_row[0],
            "title": document_row[1],
            "source": document_row[2],
            "file_name": document_row[3],
            "content_type": document_row[4],
            "status": document_row[5],
            "chunk_count": len(chunks),
            "created_at": document_row[6],
            "chunks": chunks,
        }

    def delete_document(self, document_id: int) -> None:
        with get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM documents
                    WHERE id = %s
                    RETURNING id
                    """,
                    (document_id,),
                )

                deleted = cursor.fetchone()

            connection.commit()

        if deleted is None:
            raise DocumentNotFoundError(
                f"Document {document_id} was not found."
            )