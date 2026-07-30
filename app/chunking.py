import re


class SectionChunker:
    """
    Splits structured documents into section-aware chunks.

    Expected structure:

        Document Title

        Section Heading
        Section body...

        Another Heading
        Another body...
    """

    def chunk(self, content: str) -> list[dict]:
        blocks = [
            block.strip()
            for block in re.split(r"\n\s*\n", content)
            if block.strip()
        ]

        if not blocks:
            return []

        document_title = blocks[0]
        chunks = []

        for block in blocks[1:]:
            lines = block.splitlines()

            if not lines:
                continue

            heading = lines[0].strip()
            body = "\n".join(lines[1:]).strip()

            chunk_content = (
                f"{document_title}\n\n"
                f"{heading}\n"
                f"{body}"
            )

            chunks.append(
                {
                    "section": heading,
                    "content": chunk_content,
                }
            )

        return chunks