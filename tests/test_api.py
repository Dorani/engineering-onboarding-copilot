from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@patch("app.main.GroundedAnswerService")
def test_ask_returns_grounded_answer(mock_service):
    mock_service.return_value.answer.return_value = {
        "answer": (
            "Stop further rollout and prioritize mitigation "
            "before root-cause analysis. [Source 1]"
        ),
        "grounded": True,
        "sources": [
            {
                "id": 1,
                "title": "Incident Escalation",
                "section": None,
                "content": (
                    "If a production issue affects customers, "
                    "prioritize mitigation before root-cause analysis."
                ),
            }
        ],
    }

    response = client.post(
        "/ask",
        json={
            "question": (
                "My deployment is affecting customers. "
                "What should I do?"
            )
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["grounded"] is True
    assert "[Source 1]" in body["answer"]
    assert len(body["sources"]) == 1
    assert body["sources"][0]["id"] == 1
    assert body["sources"][0]["title"] == "Incident Escalation"
    assert body["sources"][0]["section"] is None


@patch("app.main.GroundedAnswerService")
def test_ask_abstains_when_context_is_insufficient(mock_service):
    mock_service.return_value.answer.return_value = {
        "answer": (
            "The provided documentation does not contain "
            "enough information about the company’s parental leave policy."
        ),
        "grounded": False,
        "sources": [],
    }

    response = client.post(
        "/ask",
        json={
            "question": (
                "What is the company's parental leave policy?"
            )
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert body["grounded"] is False
    assert body["sources"] == []
    assert "does not contain enough information" in body["answer"]


def test_ask_rejects_question_that_is_too_short():
    response = client.post(
        "/ask",
        json={"question": "hi"},
    )

    assert response.status_code == 422


def test_ask_rejects_missing_question():
    response = client.post(
        "/ask",
        json={},
    )

    assert response.status_code == 422