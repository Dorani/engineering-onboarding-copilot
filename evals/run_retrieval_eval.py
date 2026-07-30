import json
from collections import defaultdict
from pathlib import Path

from app.retrieval import retrieve as keyword_retrieve
from app.vector_retrieval import VectorRetriever


EVAL_PATH = (
    Path(__file__).resolve().parent
    / "retrieval_cases.json"
)


def load_cases() -> list[dict]:
    return json.loads(EVAL_PATH.read_text())


def keyword_top_result(question: str) -> str:
    results = keyword_retrieve(question, limit=1)

    if not results:
        return ""

    return results[0]["title"]


def vector_top_result(
    retriever: VectorRetriever,
    question: str,
) -> tuple[str, float | None]:

    results = retriever.retrieve(question, limit=1)

    if not results:
        return "", None

    return (
        results[0]["title"],
        results[0]["distance"],
    )


def run_eval():
    cases = load_cases()
    vector_retriever = VectorRetriever()

    keyword_correct = 0
    vector_correct = 0

    keyword_by_category = defaultdict(
        lambda: {"correct": 0, "total": 0}
    )

    vector_by_category = defaultdict(
        lambda: {"correct": 0, "total": 0}
    )

    print("\nRETRIEVAL EVALUATION")
    print("=" * 80)

    for case in cases:
        question = case["question"]
        expected = case["expected_document"]
        category = case["category"]

        keyword_result = keyword_top_result(question)

        vector_result, distance = vector_top_result(
            vector_retriever,
            question,
        )

        keyword_hit = keyword_result == expected
        vector_hit = vector_result == expected

        keyword_correct += int(keyword_hit)
        vector_correct += int(vector_hit)

        keyword_by_category[category]["total"] += 1
        vector_by_category[category]["total"] += 1

        keyword_by_category[category]["correct"] += int(
            keyword_hit
        )

        vector_by_category[category]["correct"] += int(
            vector_hit
        )

        print(f"\n[{case['id']}] {question}")
        print(f"Category : {category}")
        print(f"Expected : {expected}")

        print(
            f"Keyword  : {keyword_result} "
            f"{'✅' if keyword_hit else '❌'}"
        )

        distance_text = (
            f"{distance:.4f}"
            if distance is not None
            else "N/A"
        )

        print(
            f"Vector   : {vector_result} "
            f"{'✅' if vector_hit else '❌'} "
            f"(distance={distance_text})"
        )

    total = len(cases)

    keyword_accuracy = (
        keyword_correct / total
        if total
        else 0
    )

    vector_accuracy = (
        vector_correct / total
        if total
        else 0
    )

    print("\n")
    print("=" * 80)
    print("OVERALL RESULTS")
    print("=" * 80)

    print(
        f"Keyword Top-1 Accuracy: "
        f"{keyword_correct}/{total} "
        f"({keyword_accuracy:.1%})"
    )

    print(
        f"Vector Top-1 Accuracy : "
        f"{vector_correct}/{total} "
        f"({vector_accuracy:.1%})"
    )

    print("\nBY CATEGORY")
    print("-" * 80)

    categories = sorted(
        set(keyword_by_category)
        | set(vector_by_category)
    )

    for category in categories:
        keyword_stats = keyword_by_category[category]
        vector_stats = vector_by_category[category]

        keyword_category_accuracy = (
            keyword_stats["correct"]
            / keyword_stats["total"]
        )

        vector_category_accuracy = (
            vector_stats["correct"]
            / vector_stats["total"]
        )

        print(
            f"{category:12} "
            f"keyword={keyword_category_accuracy:.1%} "
            f"vector={vector_category_accuracy:.1%}"
        )


if __name__ == "__main__":
    run_eval()