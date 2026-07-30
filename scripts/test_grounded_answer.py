from app.grounded_answer import GroundedAnswerService


service = GroundedAnswerService()

questions = [
    (
        "My deployment is already live and customers suddenly "
        "cannot use the product. What should the team do now?"
    ),
    "What is the company's parental leave policy?",
]


for question in questions:
    result = service.answer(question)

    print("\n" + "=" * 100)
    print("Question:")
    print(question)

    print("\nGrounded:")
    print(result["grounded"])

    print("\nAnswer:")
    print(result["answer"])

    print("\nSources:")

    if not result["sources"]:
        print("None")

    for source in result["sources"]:
        section = source["section"]

        if section:
            label = f"{source['title']} > {section}"
        else:
            label = source["title"]

        print(f"[Source {source['id']}] {label}")