from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: str = Field(min_length=1, max_length=10000)


class AnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    score: int
    technical_accuracy: int
    relevance: int
    completeness: int
    clarity: int
    strengths: list[str]
    weaknesses: list[str]
    missing_concepts: list[str]
    improvement_suggestions: list[str]
    feedback: str
    created_at: datetime
