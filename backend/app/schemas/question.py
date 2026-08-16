from datetime import datetime

from pydantic import BaseModel, ConfigDict


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_text: str
    question_type: str
    difficulty: str
    sequence_number: int
    created_at: datetime
