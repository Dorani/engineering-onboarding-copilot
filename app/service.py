from app.providers.base import AIProvider
from app.providers.openai_provider import OpenAIProvider
from app.retrieval import retrieve

class OnboardingService:
    def __init__(self, provider: AIProvider | None = None):
        self.provider = provider or OpenAIProvider()

    def ask(self, question: str) -> tuple[str, list[dict]]:
        docs = retrieve(question)

        context = "\n\n".join(
            f"[{doc['title']}]\n{doc['content']}" for doc in docs
        )

        answer = self.provider.answer(question=question, context=context)
        return answer, docs
