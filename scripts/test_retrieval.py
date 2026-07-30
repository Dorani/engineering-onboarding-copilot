from app.vector_retrieval import VectorRetriever

retriever = VectorRetriever()

question = "Why can a destructive database migration make rollback impossible?"

results = retriever.retrieve(question, limit=5)

for result in results:
    print(
        f"{result['title']} > "
        f"{result['section']} "
        f"(distance={result['distance']:.4f})"
    )