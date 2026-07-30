class ContextBuilder:
    def build(self, chunks: list[dict]) -> tuple[str, list[dict]]:
        blocks = []
        sources = []

        for index, chunk in enumerate(chunks, start=1):
            title = chunk["title"]
            section = chunk.get("section")
            content = chunk["content"]

            source_id = index
            source_label = f"[Source {source_id}]"

            metadata = f"Document: {title}"

            if section:
                metadata += f"\nSection: {section}"

            block = (
                f"{source_label}\n"
                f"{metadata}\n"
                f"Content:\n"
                f"{content}"
            )

            blocks.append(block)

            sources.append(
                {
                    "id": source_id,
                    "title": title,
                    "section": section,
                    "content": content,
                }
            )

        return "\n\n".join(blocks), sources