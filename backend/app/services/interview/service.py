from app.models.interview import Interview
from app.schemas.nova import Evaluation, GeneratedQuestion
from app.services.ai.gemini_provider import GeminiProvider


class InterviewService:
    def __init__(self, provider: GeminiProvider | None = None) -> None:
        self.provider = provider or GeminiProvider()

    def question(self, interview: Interview, sequence: int, history: str = "") -> GeneratedQuestion:
        return self.provider.generate_question(
            f"You are Nova, a precise placement interviewer. Ask exactly one {interview.difficulty} "
            f"{interview.type} interview question for a {interview.role} candidate about {interview.subject}. "
            f"Do not reveal an answer. This is question {sequence}. Previous context: {history or 'none'}."
        )

    def evaluate(self, interview: Interview, question: str, answer: str) -> Evaluation:
        return self.provider.evaluate_answer(
            f"You are Nova, an exacting placement coach. Evaluate the candidate's {interview.type} answer "
            f"for {interview.subject}. Question: {question}\nAnswer: {answer}\nBe specific, fair, and concise."
        )
