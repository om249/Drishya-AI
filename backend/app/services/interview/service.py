
import re
from difflib import SequenceMatcher
from typing import TYPE_CHECKING

from app.models.interview import Interview
from app.schemas.nova import Evaluation, GeneratedQuestion

if TYPE_CHECKING:
    from app.services.ai.gemini_provider import GeminiProvider


DIFFICULTY_LEVELS = ("beginner", "intermediate", "advanced")

DIFFICULTY_ALIASES = {
    "easy": "beginner",
    "beginner": "beginner",
    "medium": "intermediate",
    "intermediate": "intermediate",
    "hard": "advanced",
    "advanced": "advanced",
}


def normalize_difficulty(value: str | None) -> str:
    """Convert old and current difficulty labels to one consistent scale."""
    return DIFFICULTY_ALIASES.get(
        (value or "").strip().lower(),
        "intermediate",
    )


def _normalize_question(value: str) -> str:
    return re.sub(
        r"\s+",
        " ",
        re.sub(r"[^a-z0-9 ]", " ", value.lower()),
    ).strip()


def _is_duplicate(candidate: str, previous: list[str]) -> bool:
    normalized = _normalize_question(candidate)

    if not normalized:
        return True

    for old in previous:
        other = _normalize_question(old)

        if (
            normalized == other
            or SequenceMatcher(None, normalized, other).ratio() >= 0.86
        ):
            return True

    return False


class InterviewService:
    def __init__(self, provider: "GeminiProvider | None" = None) -> None:
        if provider is None:
            from app.services.ai.gemini_provider import GeminiProvider

            provider = GeminiProvider()

        self.provider = provider

    @staticmethod
    def adaptive_difficulty(
        base: str,
        recent_scores: list[int],
    ) -> str:
        """
        Adapt one level at a time using the three most recent answer scores.
        Scores are on a 0-10 scale.
        """
        level = normalize_difficulty(base)

        if not recent_scores:
            return level

        scores = recent_scores[:3]
        average = sum(scores) / len(scores)

        index = DIFFICULTY_LEVELS.index(level)

        if average >= 8 and index < len(DIFFICULTY_LEVELS) - 1:
            index += 1
        elif average <= 4 and index > 0:
            index -= 1

        return DIFFICULTY_LEVELS[index]

    def question(
        self,
        interview: Interview,
        sequence: int,
        history: str = "",
        previous_questions: list[str] | None = None,
        difficulty: str | None = None,
    ) -> GeneratedQuestion:
        excluded = list(previous_questions or [])
        selected_difficulty = normalize_difficulty(
            difficulty or interview.difficulty
        )

        context = history or "No previous interview context is available."

        interview_guidance = {
            "technical": (
                "Focus on technical concepts, implementation, debugging, "
                "architecture, or practical engineering scenarios."
            ),
            "hr": (
                "Focus on behavioral situations, communication, teamwork, "
                "decision-making, and professional experiences."
            ),
            "aptitude": (
                "Focus on logical reasoning, quantitative aptitude, "
                "analytical thinking, or verbal reasoning."
            ),
            "coding": (
                "Focus on programming problems, algorithms, data structures, "
                "complexity, or code analysis. Ask one coding problem only."
            ),
        }

        guidance = interview_guidance.get(
            interview.type,
            "Ask one relevant placement interview question.",
        )

        for _ in range(3):
            prompt = f"""
You are Nova, an expert AI placement interviewer.

Generate exactly ONE original interview question.

CANDIDATE PROFILE
Role: {interview.role}
Interview type: {interview.type}
Subject/domain: {interview.subject}
Required difficulty: {selected_difficulty}
Question number: {sequence}

INTERVIEW GUIDANCE
{guidance}

PREVIOUS PERFORMANCE CONTEXT
{context}

PREVIOUSLY ASKED QUESTIONS
{chr(10).join(f"- {item}" for item in excluded[-40:]) or "- None"}

QUESTION GENERATION RULES
1. Match the requested role, subject, interview type, and difficulty.
2. Ask one clear and specific question.
3. Test a different concept or problem-solving angle from previous questions.
4. Do not repeat or lightly rephrase an earlier question.
5. Avoid unnecessarily vague or generic questions.
6. Do not include the answer, hints, or explanation.
7. Do not ask multiple questions in one response.
8. Return only the fields required by the response schema.

The question must be appropriate for a real placement interview.
"""

            generated = self.provider.generate_question(prompt)

            if not _is_duplicate(generated.question_text, excluded):
                return generated

            excluded.append(generated.question_text)

        raise RuntimeError(
            "Nova generated a repeated question after multiple attempts. "
            "Please try again."
        )

    def evaluate(
        self,
        interview: Interview,
        question: str,
        answer: str,
        difficulty: str | None = None,
    ) -> Evaluation:
        question_difficulty = normalize_difficulty(
            difficulty or interview.difficulty
        )

        prompt = f"""
You are Nova, a rigorous, fair, and constructive AI placement interviewer.

Evaluate the candidate's answer against the exact question asked.

INTERVIEW CONTEXT
Interview type: {interview.type}
Candidate role: {interview.role}
Subject: {interview.subject}
Question difficulty: {question_difficulty}

QUESTION
{question}

CANDIDATE ANSWER
{answer}

SCORING RUBRIC

Give each score as an integer from 0 to 10.

1. technical_accuracy:
   Factual correctness and technical understanding.

2. relevance:
   How directly the answer addresses the question.

3. completeness:
   Coverage of the important concepts expected at this difficulty.

4. clarity:
   Logical structure and understandable communication.

5. score:
   Overall quality of the answer, considering all four dimensions.

EVALUATION RULES

- Be fair and evidence-based.
- Do not reward answer length over correctness.
- Do not penalize concise answers when they are complete.
- Do not invent facts about the candidate's answer.
- Do not claim the candidate mentioned something they did not mention.
- Consider the expected knowledge level for the question difficulty.
- If the answer is blank or says "I don't know", score it accordingly.
- Explain important mistakes or missing concepts specifically.
- Give practical, actionable improvement suggestions.
- Keep feedback constructive and professional.

Return only the response schema.
"""

        return self.provider.evaluate_answer(prompt)
