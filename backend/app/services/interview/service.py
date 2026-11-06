import re
from difflib import SequenceMatcher

from app.models.interview import Interview
from app.schemas.nova import Evaluation, GeneratedQuestion
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.services.ai.gemini_provider import GeminiProvider


DIFFICULTY_LEVELS = ("easy", "medium", "hard")


def _normalize_question(value: str) -> str:
    """Normalize wording so punctuation/case changes do not bypass duplicate checks."""
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", value.lower())).strip()


def _is_duplicate(candidate: str, previous: list[str]) -> bool:
    normalized = _normalize_question(candidate)
    if not normalized:
        return True
    for old in previous:
        other = _normalize_question(old)
        if normalized == other or SequenceMatcher(None, normalized, other).ratio() >= 0.86:
            return True
    return False


class InterviewService:
    def __init__(self, provider: "GeminiProvider | None" = None) -> None:
        if provider is None:
            from app.services.ai.gemini_provider import GeminiProvider

            provider = GeminiProvider()
        self.provider = provider

    @staticmethod
    def adaptive_difficulty(base: str, recent_scores: list[int]) -> str:
        """Move one level at a time based on the last three evaluated answers."""
        level = base.lower() if base.lower() in DIFFICULTY_LEVELS else "medium"
        if not recent_scores:
            return level
        average = sum(recent_scores[:3]) / min(len(recent_scores), 3)
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
        selected_difficulty = difficulty or interview.difficulty
        context = history or "No previous interview context is available."

        for attempt in range(3):
            prompt = f"""You are Nova, an expert technical placement interviewer.
Generate exactly ONE original interview question as structured JSON.
Candidate role: {interview.role}
Interview type: {interview.type}
Subject/domain: {interview.subject}
Required difficulty: {selected_difficulty}
Question number in this session: {sequence}

Interview context and previous performance:
{context}

Questions already asked to this candidate in relevant sessions (never repeat or lightly rephrase these):
{chr(10).join(f'- {item}' for item in excluded[-40:]) or '- None'}

Rules:
- Ask a clear, specific, technically relevant question suitable for the stated role and subject.
- Select a different concept, scenario, or problem-solving angle from the previous questions.
- Do not repeat, paraphrase, or ask the same underlying question with changed wording.
- Avoid generic questions unless they are appropriate to the selected subject.
- Do not include an answer, hints, explanation, or multiple questions.
- Return only the fields required by the response schema.
"""
            generated = self.provider.generate_question(prompt)
            if not _is_duplicate(generated.question_text, excluded):
                return generated
            excluded.append(generated.question_text)

        raise RuntimeError("Nova generated a repeated question after multiple attempts. Please try again.")

    def evaluate(self, interview: Interview, question: str, answer: str) -> Evaluation:
        prompt = f"""You are Nova, a rigorous but constructive placement interview evaluator.
Evaluate the candidate's answer against the question. Be fair: do not reward length over correctness, and do not penalize concise answers when they are complete.
Interview type: {interview.type}
Candidate role: {interview.role}
Subject: {interview.subject}
Difficulty: {interview.difficulty}
Question: {question}
Candidate answer: {answer}

Scoring rubric (each dimension and overall score must be an integer from 0 to 10):
- technical_accuracy: factual and technical correctness
- relevance: directly addresses what was asked
- completeness: covers the important points expected at this difficulty
- clarity: logical, understandable communication
- score: holistic assessment; do not simply inflate the score

Provide actionable, question-specific feedback. Populate strengths, weaknesses, missing_concepts, and improvement_suggestions with concise, concrete points. If the answer is blank or says 'I don't know', score it accordingly. Return only the response schema.
"""
        return self.provider.evaluate_answer(prompt)
