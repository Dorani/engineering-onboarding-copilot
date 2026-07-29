from app.providers.base import AIProvider
from app.providers.openai_provider import OpenAIProvider
from app.vector_retrieval import VectorRetriever


class OnboardingService:
    def __init__(self, provider: AIProvider | None = None):
        self.provider = provider or OpenAIProvider()
        self.retriever = VectorRetriever()

    def ask(self, question: str) -> tuple[str, list[dict]]:
        docs = self.retriever.retrieve(question)

        context = "\n\n".join(
            f"[{doc['title']}]\n{doc['content']}"
            for doc in docs
        )

        answer = self.provider.answer(
            question=question,
            context=context,
        )

        return answer, docs