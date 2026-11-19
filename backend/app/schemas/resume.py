
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    character_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeDetailResponse(ResumeResponse):
    extracted_text: str


class ResumeUploadResponse(BaseModel):
    message: str
    resume: ResumeResponse
