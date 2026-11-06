import pytest

from app.schemas.nova import GeneratedQuestion
from app.services.interview.service import InterviewService


class FakeProvider:
    def __init__(self, questions):
        self.questions = iter(questions)
        self.prompts = []

    def generate_question(self, prompt):
        self.prompts.append(prompt)
        return GeneratedQuestion(question_text=next(self.questions), question_type="technical")


def make_interview(difficulty="medium"):
    return type("InterviewStub", (), {
        "role": "Python Developer",
        "type": "technical",
        "subject": "Python",
        "difficulty": difficulty,
    })()


def test_adaptive_difficulty_moves_one_level_at_a_time():
    assert InterviewService.adaptive_difficulty("medium", [9, 8, 9]) == "hard"
    assert InterviewService.adaptive_difficulty("medium", [2, 4, 3]) == "easy"
    assert InterviewService.adaptive_difficulty("hard", [2, 3, 4]) == "medium"
    assert InterviewService.adaptive_difficulty("easy", [9, 9, 9]) == "medium"


def test_question_retries_when_generated_question_is_duplicate():
    provider = FakeProvider([
        "Explain Python decorators with an example.",
        "What is a Python generator and when would you use it?",
    ])
    service = InterviewService(provider)
    result = service.question(
        make_interview(), 2,
        previous_questions=["Explain Python decorators with an example"],
    )
    assert "generator" in result.question_text.lower()
    assert len(provider.prompts) == 2
    assert "never repeat" in provider.prompts[0].lower()


def test_question_fails_after_three_duplicate_generations():
    repeated = "Explain Python decorators with an example."
    provider = FakeProvider([repeated, repeated, repeated])
    service = InterviewService(provider)
    with pytest.raises(RuntimeError, match="repeated question"):
        service.question(make_interview(), 2, previous_questions=[repeated])
