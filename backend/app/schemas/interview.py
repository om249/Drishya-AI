from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

InterviewType = Literal["technical", "hr", "aptitude", "coding"]
Difficulty = Literal["beginner", "intermediate", "advanced"]

ExperienceLevel = Literal[
    "fresher",
    "0-1 years",
    "1-3 years",
    "3+ years",
]


class InterviewCreate(BaseModel):
    type: InterviewType
    role: str = Field(min_length=2, max_length=100)
    subject: str = Field(min_length=2, max_length=100)
    difficulty: Difficulty

    experience_level: ExperienceLevel = "fresher"
    target_company: str | None = Field(default=None, max_length=120)
    focus_areas: str | None = Field(default=None, max_length=500)
    question_count: int = Field(default=5, ge=3, le=15)

    @field_validator("role", "subject")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Must contain at least 2 characters.")
        return value

    @field_validator("target_company", "focus_areas")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None


class InterviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: InterviewType
    role: str
    subject: str
    difficulty: Difficulty

    experience_level: ExperienceLevel
    target_company: str | None
    focus_areas: str | None
    question_count: int

    status: str
    started_at: datetime | None
    completed_at: datetime | None
    overall_score: int | None
    created_at: datetime
    updated_at: datetime