from app.reranked_retrieval import RerankedRetriever


retriever = RerankedRetriever()

question = (
    "My deployment is already live and customers suddenly "
    "cannot use the product. What should the team do now?"
)

results = retriever.retrieve(question)

print(f"\nQuestion: {question}\n")

for result in results:
    print(result["title"])
    print(result["content"])
    print("-" * 80)