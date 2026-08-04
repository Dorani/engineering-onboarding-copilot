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