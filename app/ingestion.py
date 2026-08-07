from pathlib import Path

from app.chunking import SectionChunker
from app.database import get_connection
from app.embeddings import EmbeddingService


class IngestionError(Exception):
    """Raised when an uploaded document cannot be ingested."""


class UnsupportedFileTypeError(IngestionError):
    """Raised when the uploaded file type is not supported."""


class EmptyDocumentError(IngestionError):
    """Raised when the uploaded document contains no usable text."""


class DocumentIngestionService:
    """
    Validates, chunks, embeds, and persists uploaded knowledge documents.

    The initial v0.4 implementation supports Markdown and plain-text files.
    Ingestion runs synchronously so a successful response means the document
    is immediately searchable.
    """

    ALLOWED_EXTENSIONS = {".md", ".markdown", ".txt"}
    ALLOWED_CONTENT_TYPES = {
        "text/markdown",
        "text/plain",
        "application/octet-stream",
    }
    MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

    def __init__(
        self,
        chunker: SectionChunker | None = None,
        embedding_service: EmbeddingService | None = None,
    ):
        self.chunker = chunker or SectionChunker()
        self.embedding_service = (
            embedding_service or EmbeddingService()
        )

    def ingest(
        self,
        *,
        file_name: str,
        content_type: str | None,
        file_bytes: bytes,
    ) -> dict:
        """
        Ingest one uploaded Markdown or text document.

        Existing documents with the same derived title are replaced so
        re-uploading a document refreshes its indexed content.
        """

        self._validate_file(
            file_name=file_name,
            content_type=content_type,
            file_bytes=file_bytes,
        )

        content = self._decode_content(file_bytes)
        title = self._derive_title(
            content=content,
            file_name=file_name,
        )
        chunks = self._build_chunks(
            content=content,
            title=title,
        )

        with get_connection() as connection:
            try:
                with connection.cursor() as cursor:
                    document_id = self._upsert_document(
                        cursor=cursor,
                        title=title,
                        file_name=file_name,
                        content_type=content_type,
                    )

                    cursor.execute(
                        """
                        DELETE FROM chunks
                        WHERE document_id = %s
                        """,
                        (document_id,),
                    )

                    for chunk_index, chunk in enumerate(chunks):
                        embedding = self.embedding_service.embed(
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

                    cursor.execute(
                        """
                        UPDATE documents
                        SET status = 'indexed'
                        WHERE id = %s
                        """,
                        (document_id,),
                    )

                connection.commit()

            except Exception:
                connection.rollback()
                raise

        return {
            "document_id": document_id,
            "title": title,
            "file_name": file_name,
            "content_type": (
                content_type or "application/octet-stream"
            ),
            "status": "indexed",
            "chunks_created": len(chunks),
        }

    def _validate_file(
        self,
        *,
        file_name: str,
        content_type: str | None,
        file_bytes: bytes,
    ) -> None:
        if not file_name.strip():
            raise IngestionError(
                "The uploaded file must have a filename."
            )

        extension = Path(file_name).suffix.lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            allowed = ", ".join(
                sorted(self.ALLOWED_EXTENSIONS)
            )
            raise UnsupportedFileTypeError(
                f"Unsupported file type '{extension}'. "
                f"Allowed extensions: {allowed}."
            )

        if (
            content_type
            and content_type not in self.ALLOWED_CONTENT_TYPES
        ):
            raise UnsupportedFileTypeError(
                f"Unsupported content type '{content_type}'."
            )

        if not file_bytes:
            raise EmptyDocumentError(
                "The uploaded document is empty."
            )

        if len(file_bytes) > self.MAX_FILE_SIZE_BYTES:
            raise IngestionError(
                "The uploaded document exceeds the 2 MB limit."
            )

    def _decode_content(self, file_bytes: bytes) -> str:
        try:
            content = file_bytes.decode("utf-8").strip()
        except UnicodeDecodeError as exc:
            raise IngestionError(
                "The uploaded document must use UTF-8 encoding."
            ) from exc

        if not content:
            raise EmptyDocumentError(
                "The uploaded document contains no usable text."
            )

        return content

    def _derive_title(
        self,
        *,
        content: str,
        file_name: str,
    ) -> str:
        first_nonempty_line = next(
            (
                line.strip()
                for line in content.splitlines()
                if line.strip()
            ),
            "",
        )

        title = first_nonempty_line.lstrip("#").strip()

        if not title:
            title = Path(file_name).stem.replace(
                "-", " "
            ).replace("_", " ").strip()

        if not title:
            raise IngestionError(
                "A document title could not be determined."
            )

        return title[:255]

    def _build_chunks(
        self,
        *,
        content: str,
        title: str,
    ) -> list[dict]:
        chunks = self.chunker.chunk(content)

        if chunks:
            return chunks

        return [
            {
                "section": None,
                "content": f"{title}\n\n{content}",
            }
        ]

    def _upsert_document(
        self,
        *,
        cursor,
        title: str,
        file_name: str,
        content_type: str | None,
    ) -> int:
        cursor.execute(
            """
            INSERT INTO documents (
                title,
                source,
                file_name,
                content_type,
                status
            )
            VALUES (%s, %s, %s, %s, 'processing')
            ON CONFLICT (title)
            DO UPDATE SET
                source = EXCLUDED.source,
                file_name = EXCLUDED.file_name,
                content_type = EXCLUDED.content_type,
                status = 'processing'
            RETURNING id
            """,
            (
                title,
                "upload",
                file_name,
                content_type or "application/octet-stream",
            ),
        )

        row = cursor.fetchone()

        if row is None:
            raise IngestionError(
                "The document record could not be created."
            )

        return row[0]