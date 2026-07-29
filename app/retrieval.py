import json
import re
from pathlib import Path

KNOWLEDGE_PATH = Path(__file__).resolve().parent.parent / "knowledge" / "docs.json"

def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))

def retrieve(question: str, limit: int = 3) -> list[dict]:
    docs = json.loads(KNOWLEDGE_PATH.read_text())
    q = _tokens(question)

    scored = []
    for doc in docs:
        haystack = _tokens(doc["title"] + " " + doc["content"])
        score = len(q & haystack)
        scored.append((score, doc))

    scored.sort(key=lambda item: item[0], reverse=True)
    matches = [doc for score, doc in scored if score > 0][:limit]
    return matches or docs[:limit]
