import json
from pathlib import Path

from app.vector_retrieval import VectorRetriever
from app.reranked_retrieval import RerankedRetriever


EVAL_PATH = (
    Path(__file__).resolve().parent
    / "long_doc_chunk_cases.json"
)

TOP_K = 3
SOURCE = "knowledge/long_docs.json"


def load_cases() -> list[dict]:
    return json.loads(EVAL_PATH.read_text())


def chunk_id(result: dict) -> str:
    section = result.get("section")

    if section:
        return f"{result['title']} > {section}"

    return result["title"]


def top1_hit(results: list[str], relevant: list[str]) -> bool:
    return bool(results) and results[0] in relevant


def recall_at_k(results: list[str], relevant: list[str]) -> float:
    if not relevant:
        return 0.0

    return len(set(results) & set(relevant)) / len(set(relevant))


def reciprocal_rank(results: list[str], relevant: list[str]) -> float:
    for rank, result in enumerate(results, start=1):
        if result in relevant:
            return 1 / rank

    return 0.0


def run_eval():
    cases = load_cases()

    vector_retriever = VectorRetriever()
    reranked_retriever = RerankedRetriever()

    metrics = {
        "vector": {"top1": 0, "recall": 0.0, "rr": 0.0},
        "reranked": {"top1": 0, "recall": 0.0, "rr": 0.0},
    }

    print("\nCHUNK-LEVEL RETRIEVAL EVALUATION")
    print("=" * 100)

    for case in cases:
        question = case["question"]
        relevant = case["relevant_chunks"]

        vector_raw = vector_retriever.retrieve(
            question,
            limit=TOP_K,
            source=SOURCE,
        )

        reranked_raw = reranked_retriever.retrieve(
            question,
            candidate_limit=8,
            limit=TOP_K,
            source=SOURCE,
        )

        vector = [chunk_id(result) for result in vector_raw]
        reranked = [chunk_id(result) for result in reranked_raw]

        for name, results in (
            ("vector", vector),
            ("reranked", reranked),
        ):
            metrics[name]["top1"] += int(
                top1_hit(results, relevant)
            )

            metrics[name]["recall"] += recall_at_k(
                results,
                relevant,
            )

            metrics[name]["rr"] += reciprocal_rank(
                results,
                relevant,
            )

        print(f"\n[{case['id']}] {question}")
        print("Relevant :", " | ".join(relevant))
        print("Vector   :", " | ".join(vector))
        print("Reranked :", " | ".join(reranked))

    total = len(cases)

    print("\n" + "=" * 100)
    print("OVERALL RESULTS")
    print("=" * 100)

    for name in ("vector", "reranked"):
        print(
            f"{name.capitalize():10} "
            f"Top-1={metrics[name]['top1'] / total:.1%} "
            f"Recall@{TOP_K}={metrics[name]['recall'] / total:.1%} "
            f"MRR={metrics[name]['rr'] / total:.3f}"
        )


if __name__ == "__main__":
    run_eval()