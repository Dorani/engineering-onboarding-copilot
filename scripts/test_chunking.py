import json
from pathlib import Path

from app.chunking import SectionChunker


KNOWLEDGE_PATH = (
    Path(__file__).resolve().parent.parent
    / "knowledge"
    / "long_docs.json"
)


def main():
    documents = json.loads(
        KNOWLEDGE_PATH.read_text()
    )

    chunker = SectionChunker()

    for document in documents:
        chunks = chunker.chunk(
            document["content"]
        )

        print("\n" + "=" * 80)
        print(document["title"])
        print(f"Chunks: {len(chunks)}")
        print("=" * 80)

        for index, chunk in enumerate(chunks):
            print(
                f"{index}: "
                f"{chunk['section']}"
            )


if __name__ == "__main__":
    main()