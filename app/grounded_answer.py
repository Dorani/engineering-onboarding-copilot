import re

from openai import OpenAI

from app.config import settings
from app.context import ContextBuilder
from app.reranked_retrieval import RerankedRetriever


class GroundedAnswerService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

        self.retriever = RerankedRetriever()
        self.context_builder = ContextBuilder()

    def answer(
        self,
        question: str,
        source: str | None = None,
    ) -> dict:
        chunks = self.retriever.retrieve(
            question=question,
            candidate_limit=8,
            limit=3,
            source=source,
        )

        context, sources = self.context_builder.build(chunks)

        response = self.client.responses.create(
            model=self.model,
            instructions=(
                "You are an engineering onboarding copilot. "
                "Answer only using the provided context. "
                "If the context does not contain enough information to answer "
                "the question, begin your response with exactly "
                "'INSUFFICIENT_CONTEXT:' followed by a concise explanation. "
                "Otherwise, begin your response with exactly "
                "'GROUNDED:' followed by the answer. "
                "For grounded answers, cite factual claims using the exact "
                "format [Source N], where N corresponds to the supplied context. "
                "Do not invent facts, procedures, policies, or source references. "
                "Use only source numbers that actually exist. "
                "Prefer concise, actionable answers."
            ),
            input=(
                f"Question:\n{question}\n\n"
                f"Context:\n{context}"
            ),
        )

        raw_answer = response.output_text.strip()

        if raw_answer.startswith("INSUFFICIENT_CONTEXT:"):
            answer = raw_answer.removeprefix(
                "INSUFFICIENT_CONTEXT:"
            ).strip()

            return {
                "answer": answer,
                "grounded": False,
                "sources": [],
            }

        if raw_answer.startswith("GROUNDED:"):
            answer = raw_answer.removeprefix(
                "GROUNDED:"
            ).strip()
        else:
            # Fail closed if the model violates the response contract.
            return {
                "answer": (
                    "The provided documentation does not contain "
                    "enough information to answer that question."
                ),
                "grounded": False,
                "sources": [],
            }

        cited_ids = {
            int(match)
            for match in re.findall(
                r"\[Source (\d+)\]",
                answer,
            )
        }

        valid_source_ids = {
            source_item["id"]
            for source_item in sources
        }

        cited_ids &= valid_source_ids

        cited_sources = [
            source_item
            for source_item in sources
            if source_item["id"] in cited_ids
        ]

        return {
            "answer": answer,
            "grounded": True,
            "sources": cited_sources,
        }