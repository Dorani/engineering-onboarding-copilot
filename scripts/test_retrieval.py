from app.vector_retrieval import VectorRetriever


retriever = VectorRetriever()

question = "What is the process for releasing code?"

results = retriever.retrieve(question)

print(f"\nQuestion: {question}\n")

for result in results:
    print(
        f"{result['title']} "
        f"(distance={result['distance']:.4f})"
    )
    print(result["content"])
    print("-" * 80)