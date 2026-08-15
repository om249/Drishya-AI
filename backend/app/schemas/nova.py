from pydantic import BaseModel, Field


class GeneratedQuestion(BaseModel):
    question_text: str = Field(min_length=10)
    question_type: str = Field(min_length=2, max_length=50)


class Evaluation(BaseModel):
    score: int = Field(ge=0, le=10)
    technical_accuracy: int = Field(ge=0, le=10)
    relevance: int = Field(ge=0, le=10)
    completeness: int = Field(ge=0, le=10)
    clarity: int = Field(ge=0, le=10)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_concepts: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    feedback: str = Field(min_length=1)
