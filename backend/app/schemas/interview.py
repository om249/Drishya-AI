from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

InterviewType = Literal["technical", "hr", "aptitude", "coding"]
Difficulty = Literal["beginner", "intermediate", "advanced"]


class InterviewCreate(BaseModel):
    type: InterviewType
    role: str = Field(min_length=2, max_length=100)
    subject: str = Field(min_length=2, max_length=100)
    difficulty: Difficulty


class InterviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: InterviewType
    role: str
    subject: str
    difficulty: Difficulty
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    overall_score: int | None
    created_at: datetime
    updated_at: datetime
