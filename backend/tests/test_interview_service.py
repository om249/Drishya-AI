
import pytest

from app.schemas.nova import GeneratedQuestion
from app.services.interview.service import (
    InterviewService,
    normalize_difficulty,
)


class FakeProvider:
    def __init__(self, questions):
        self.questions = iter(questions)
        self.prompts = []

    def generate_question(self, prompt):
        self.prompts.append(prompt)

        return GeneratedQuestion(
            question_text=next(self.questions),
            question_type="technical",
        )


def make_interview(difficulty="intermediate"):
    return type(
        "InterviewStub",
        (),
        {
            "role": "Python Developer",
            "type": "technical",
            "subject": "Python",
            "difficulty": difficulty,
        },
    )()


def test_difficulty_normalization():
    assert normalize_difficulty("easy") == "beginner"
    assert normalize_difficulty("beginner") == "beginner"
    assert normalize_difficulty("medium") == "intermediate"
    assert normalize_difficulty("hard") == "advanced"


def test_adaptive_difficulty_moves_one_level_at_a_time():
    assert (
        InterviewService.adaptive_difficulty("intermediate", [9, 8, 9])
        == "advanced"
    )

    assert (
        InterviewService.adaptive_difficulty("intermediate", [2, 4, 3])
        == "beginner"
    )

    assert (
        InterviewService.adaptive_difficulty("advanced", [2, 3, 4])
        == "intermediate"
    )

    assert (
        InterviewService.adaptive_difficulty("beginner", [9, 9, 9])
        == "intermediate"
    )


def test_adaptive_difficulty_preserves_level_without_scores():
    assert (
        InterviewService.adaptive_difficulty("beginner", [])
        == "beginner"
    )


def test_adaptive_difficulty_supports_legacy_values():
    assert (
        InterviewService.adaptive_difficulty("easy", [9, 9, 9])
        == "intermediate"
    )

    assert (
        InterviewService.adaptive_difficulty("hard", [])
        == "advanced"
    )


def test_question_retries_when_generated_question_is_duplicate():
    provider = FakeProvider([
        "Explain Python decorators with an example.",
        "What is a Python generator and when would you use it?",
    ])

    service = InterviewService(provider)

    result = service.question(
        make_interview(),
        sequence=2,
        previous_questions=[
            "Explain Python decorators with an example."
        ],
    )

    assert "generator" in result.question_text.lower()
    assert len(provider.prompts) == 2
    assert "never repeat" not in provider.prompts[0].lower() or (
        "Do not repeat" in provider.prompts[0]
    )


def test_question_fails_after_three_duplicate_generations():
    repeated = "Explain Python decorators with an example."

    provider = FakeProvider([
        repeated,
        repeated,
        repeated,
    ])

    service = InterviewService(provider)

    with pytest.raises(RuntimeError, match="repeated question"):
        service.question(
            make_interview(),
            sequence=2,
            previous_questions=[repeated],
        )


def test_question_prompt_uses_normalized_difficulty():
    provider = FakeProvider([
        "Explain Python generators and their practical applications."
    ])

    service = InterviewService(provider)

    service.question(
        make_interview("medium"),
        sequence=1,
    )

    assert "Required difficulty: intermediate" in provider.prompts[0]


def test_question_prompt_includes_candidate_learning_context():
    provider = FakeProvider([
        "How would you use a Python generator to process a large file?"
    ])

    service = InterviewService(provider)

    history = """
    Previous response:
    Question: Explain Python generators.
    Score: 4/10
    Weaknesses: Could not explain lazy evaluation.
    Missing concepts: yield keyword, iterator protocol.
    """

    service.question(
        make_interview(),
        sequence=3,
        history=history,
    )

    prompt = provider.prompts[0]

    assert "Python generators" in prompt
    assert "lazy evaluation" in prompt
    assert "iterator protocol" in prompt

def test_question_prompt_includes_follow_up_context():
    provider = FakeProvider([
        "How would you use generators to process a large CSV file?"
    ])

    service = InterviewService(provider)

    follow_up = """
    Previous question: Explain Python generators.
    Weaknesses: Could not explain lazy evaluation.
    Missing concepts: yield keyword and iterator protocol.
    """

    service.question(
        make_interview(),
        sequence=2,
        follow_up_context=follow_up,
    )

    prompt = provider.prompts[0]

    assert "FOLLOW-UP QUESTION CONTEXT" in prompt
    assert "lazy evaluation" in prompt
    assert "iterator protocol" in prompt


def test_question_without_follow_up_context_still_works():
    provider = FakeProvider([
        "Explain the difference between a list and a tuple."
    ])

    service = InterviewService(provider)

    result = service.question(
        make_interview(),
        sequence=1,
    )

    assert result.question_text
    assert "No immediate follow-up is required." in provider.prompts[0]