import json
import re
from pathlib import Path

from app.grounded_answer import GroundedAnswerService


EVAL_PATH = (
    Path(__file__).resolve().parent
    / "generation_cases.json"
)


def load_cases() -> list[dict]:
    return json.loads(EVAL_PATH.read_text())


def extract_citation_ids(answer: str) -> set[int]:
    return {
        int(match)
        for match in re.findall(
            r"\[Source (\d+)\]",
            answer,
        )
    }


def run_eval():
    cases = load_cases()
    service = GroundedAnswerService()

    grounding_correct = 0

    supported_total = 0
    supported_with_citations = 0
    supported_with_valid_citations = 0

    unsupported_total = 0
    unsupported_abstained = 0

    print("\nGENERATION EVALUATION")
    print("=" * 100)

    for case in cases:
        question = case["question"]
        expected_grounded = case["expected_grounded"]
        category = case["category"]

        result = service.answer(question)

        actual_grounded = result["grounded"]
        answer = result["answer"]
        sources = result["sources"]

        grounding_match = (
            actual_grounded == expected_grounded
        )

        grounding_correct += int(
            grounding_match
        )

        citation_ids = extract_citation_ids(
            answer
        )

        returned_source_ids = {
            source["id"]
            for source in sources
        }

        citations_present = bool(
            citation_ids
        )

        citations_valid = (
            citation_ids
            <= returned_source_ids
        )

        if expected_grounded:
            supported_total += 1

            supported_with_citations += int(
                citations_present
            )

            supported_with_valid_citations += int(
                citations_present
                and citations_valid
            )

        else:
            unsupported_total += 1

            unsupported_abstained += int(
                actual_grounded is False
                and sources == []
            )

        print(f"\n[{case['id']}] {question}")
        print(f"Category           : {category}")
        print(f"Expected grounded  : {expected_grounded}")
        print(f"Actual grounded    : {actual_grounded}")
        print(f"Grounding correct  : {grounding_match}")

        print(
            "Citations          : "
            + (
                ", ".join(
                    str(item)
                    for item in sorted(citation_ids)
                )
                if citation_ids
                else "None"
            )
        )

        print(
            "Returned source IDs: "
            + (
                ", ".join(
                    str(item)
                    for item in sorted(returned_source_ids)
                )
                if returned_source_ids
                else "None"
            )
        )

        print(
            f"Citations valid    : "
            f"{citations_valid}"
        )

        print("\nAnswer:")
        print(answer)

    total = len(cases)

    grounding_accuracy = (
        grounding_correct / total
        if total
        else 0
    )

    citation_presence = (
        supported_with_citations
        / supported_total
        if supported_total
        else 0
    )

    citation_validity = (
        supported_with_valid_citations
        / supported_total
        if supported_total
        else 0
    )

    abstention_accuracy = (
        unsupported_abstained
        / unsupported_total
        if unsupported_total
        else 0
    )

    print("\n")
    print("=" * 100)
    print("OVERALL RESULTS")
    print("=" * 100)

    print(
        f"Grounding Accuracy : "
        f"{grounding_correct}/{total} "
        f"({grounding_accuracy:.1%})"
    )

    print(
        f"Citation Presence  : "
        f"{supported_with_citations}/{supported_total} "
        f"({citation_presence:.1%})"
    )

    print(
        f"Citation Validity  : "
        f"{supported_with_valid_citations}/{supported_total} "
        f"({citation_validity:.1%})"
    )

    print(
        f"Abstention Accuracy: "
        f"{unsupported_abstained}/{unsupported_total} "
        f"({abstention_accuracy:.1%})"
    )


if __name__ == "__main__":
    run_eval()