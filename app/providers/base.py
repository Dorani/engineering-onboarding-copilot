from abc import ABC, abstractmethod

class AIProvider(ABC):
    @abstractmethod
    def answer(self, question: str, context: str) -> str:
        raise NotImplementedError
