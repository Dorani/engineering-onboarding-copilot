from openai import OpenAI

from app.config import settings
from app.providers.base import AIProvider

SYSTEM_INSTRUCTIONS = '''
You are an engineering onboarding copilot.
Answer only from the supplied internal context.
If the context is insufficient, say what is missing rather than inventing an answer.
Be concise, practical, and explain unfamiliar internal terms.
'''

class OpenAIProvider(AIProvider):
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    def answer(self, question: str, context: str) -> str:
        response = self.client.responses.create(
            model=self.model,
            instructions=SYSTEM_INSTRUCTIONS,
            input=f'''Internal context:
{context}

New engineer question:
{question}
'''
        )
        return response.output_text
