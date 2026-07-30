from app.context import ContextBuilder
from app.reranked_retrieval import RerankedRetriever


retriever = RerankedRetriever()
context_builder = ContextBuilder()

question = (
    "My deployment is already live and customers suddenly "
    "cannot use the product. What should the team do now?"
)

chunks = retriever.retrieve(
    question=question,
    candidate_limit=8,
    limit=3,
)

context, sources = context_builder.build(chunks)

print(f"\nQuestion:\n{question}\n")
print("Context:")
print("=" * 80)
print(context)

print("\nStructured Sources:")
print("=" * 80)

for source in sources:
    print(source)