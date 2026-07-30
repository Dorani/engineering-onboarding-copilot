from app.reranker import Reranker
from app.vector_retrieval import VectorRetriever


class RerankedRetriever:
    def __init__(self):
        self.vector_retriever = VectorRetriever()
        self.reranker = Reranker()

    def retrieve(
        self,
        question: str,
        candidate_limit: int = 8,
        limit: int = 3,
    ) -> list[dict]:

        candidates = self.vector_retriever.retrieve(
            question,
            limit=candidate_limit,
        )

        return self.reranker.rerank(
            question=question,
            candidates=candidates,
            top_k=limit,
        )