import json
from collections import defaultdict
from pathlib import Path

from app.retrieval import retrieve as keyword_retrieve
from app.vector_retrieval import VectorRetriever
from app.reranked_retrieval import RerankedRetriever


EVAL_PATH = (
    Path(__file__).resolve().parent
    / "retrieval_cases.json"
)

TOP_K = 3


def load_cases() -> list[dict]:
    return json.loads(EVAL_PATH.read_text())


def keyword_results(question: str) -> list[str]:
    results = keyword_retrieve(
        question,
        limit=TOP_K,
    )

    return [
        result["title"]
        for result in results
    ]


def vector_results(
    retriever: VectorRetriever,
    question: str,
) -> list[dict]:

    return retriever.retrieve(
        question,
        limit=TOP_K,
    )


def reranked_results(
    retriever: RerankedRetriever,
    question: str,
) -> list[dict]:

    return retriever.retrieve(
        question,
        candidate_limit=8,
        limit=TOP_K,
    )


def top1_hit(
    results: list[str],
    relevant: list[str],
) -> bool:

    if not results:
        return False

    return results[0] in relevant


def recall_at_k(
    results: list[str],
    relevant: list[str],
) -> float:

    if not relevant:
        return 0.0

    retrieved_relevant = (
        set(results)
        & set(relevant)
    )

    return (
        len(retrieved_relevant)
        / len(set(relevant))
    )


def reciprocal_rank(
    results: list[str],
    relevant: list[str],
) -> float:

    for rank, result in enumerate(
        results,
        start=1,
    ):
        if result in relevant:
            return 1 / rank

    return 0.0


def run_eval():
    cases = load_cases()

    vector_retriever = VectorRetriever()
    reranked_retriever = RerankedRetriever()

    metrics = {
        "keyword": {
            "top1": 0,
            "recall": 0.0,
            "rr": 0.0,
        },
        "vector": {
            "top1": 0,
            "recall": 0.0,
            "rr": 0.0,
        },
        "reranked": {
            "top1": 0,
            "recall": 0.0,
            "rr": 0.0,
        },
    }

    by_category = defaultdict(
        lambda: {
            "count": 0,
            "keyword_top1": 0,
            "vector_top1": 0,
            "reranked_top1": 0,
        }
    )

    print("\nRETRIEVAL EVALUATION")
    print("=" * 100)

    for case in cases:
        question = case["question"]
        relevant = case["relevant_documents"]
        category = case["category"]

        keyword = keyword_results(question)

        vector_raw = vector_results(
            vector_retriever,
            question,
        )

        vector = [
            result["title"]
            for result in vector_raw
        ]

        reranked_raw = reranked_results(
            reranked_retriever,
            question,
        )

        reranked = [
            result["title"]
            for result in reranked_raw
        ]

        keyword_top1 = top1_hit(
            keyword,
            relevant,
        )

        vector_top1 = top1_hit(
            vector,
            relevant,
        )

        reranked_top1 = top1_hit(
            reranked,
            relevant,
        )

        keyword_recall = recall_at_k(
            keyword,
            relevant,
        )

        vector_recall = recall_at_k(
            vector,
            relevant,
        )

        reranked_recall = recall_at_k(
            reranked,
            relevant,
        )

        keyword_rr = reciprocal_rank(
            keyword,
            relevant,
        )

        vector_rr = reciprocal_rank(
            vector,
            relevant,
        )

        reranked_rr = reciprocal_rank(
            reranked,
            relevant,
        )

        metrics["keyword"]["top1"] += int(
            keyword_top1
        )

        metrics["vector"]["top1"] += int(
            vector_top1
        )

        metrics["reranked"]["top1"] += int(
            reranked_top1
        )

        metrics["keyword"]["recall"] += (
            keyword_recall
        )

        metrics["vector"]["recall"] += (
            vector_recall
        )

        metrics["reranked"]["recall"] += (
            reranked_recall
        )

        metrics["keyword"]["rr"] += (
            keyword_rr
        )

        metrics["vector"]["rr"] += (
            vector_rr
        )

        metrics["reranked"]["rr"] += (
            reranked_rr
        )

        by_category[category]["count"] += 1

        by_category[category][
            "keyword_top1"
        ] += int(keyword_top1)

        by_category[category][
            "vector_top1"
        ] += int(vector_top1)

        by_category[category][
            "reranked_top1"
        ] += int(reranked_top1)

        print(f"\n[{case['id']}] {question}")
        print(f"Category : {category}")

        print(
            "Relevant : "
            + ", ".join(relevant)
        )

        print(
            "Keyword  : "
            + " | ".join(keyword)
        )

        print(
            "Vector   : "
            + " | ".join(
                f"{result['title']} "
                f"({result['distance']:.4f})"
                for result in vector_raw
            )
        )

        print(
            "Reranked : "
            + " | ".join(reranked)
        )

        print(
            f"Keyword  Top1={keyword_top1} "
            f"Recall@{TOP_K}={keyword_recall:.2f} "
            f"RR={keyword_rr:.2f}"
        )

        print(
            f"Vector   Top1={vector_top1} "
            f"Recall@{TOP_K}={vector_recall:.2f} "
            f"RR={vector_rr:.2f}"
        )

        print(
            f"Reranked Top1={reranked_top1} "
            f"Recall@{TOP_K}={reranked_recall:.2f} "
            f"RR={reranked_rr:.2f}"
        )

    total = len(cases)

    print("\n")
    print("=" * 100)
    print("OVERALL RESULTS")
    print("=" * 100)

    for system in (
        "keyword",
        "vector",
        "reranked",
    ):
        top1 = (
            metrics[system]["top1"]
            / total
        )

        avg_recall = (
            metrics[system]["recall"]
            / total
        )

        mrr = (
            metrics[system]["rr"]
            / total
        )

        print(
            f"{system.capitalize():10} "
            f"Top-1={top1:.1%} "
            f"Recall@{TOP_K}={avg_recall:.1%} "
            f"MRR={mrr:.3f}"
        )

    print("\nBY CATEGORY — TOP-1")
    print("-" * 100)

    for category in sorted(
        by_category
    ):
        stats = by_category[category]

        keyword_accuracy = (
            stats["keyword_top1"]
            / stats["count"]
        )

        vector_accuracy = (
            stats["vector_top1"]
            / stats["count"]
        )

        reranked_accuracy = (
            stats["reranked_top1"]
            / stats["count"]
        )

        print(
            f"{category:12} "
            f"keyword={keyword_accuracy:.1%} "
            f"vector={vector_accuracy:.1%} "
            f"reranked={reranked_accuracy:.1%}"
        )


if __name__ == "__main__":
    run_eval()