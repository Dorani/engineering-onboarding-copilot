import json

from openai import OpenAI

from app.config import settings


class Reranker:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    def rerank(
        self,
        question: str,
        candidates: list[dict],
        top_k: int = 3,
    ) -> list[dict]:

        numbered = "\n\n".join(
            (
                f"Candidate {index}\n"
                f"Title: {candidate['title']}\n"
                f"Content: {candidate['content']}"
            )
            for index, candidate in enumerate(candidates)
        )

        response = self.client.responses.create(
            model=self.model,
            instructions=(
                "You are a retrieval reranker. "
                "Rank candidate passages by how directly and completely "
                "they answer the user's question. "
                "Return only valid JSON as an array of candidate indexes, "
                "best first. Example: [2, 0, 1]."
            ),
            input=(
                f"Question:\n{question}\n\n"
                f"Candidates:\n{numbered}"
            ),
        )

        ranking = json.loads(response.output_text)

        ranked = [
            candidates[index]
            for index in ranking
            if 0 <= index < len(candidates)
        ]

        return ranked[:top_k]