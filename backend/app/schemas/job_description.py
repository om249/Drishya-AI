
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class JobDescriptionCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    company: str | None = Field(default=None, max_length=150)
    description: str = Field(min_length=50, max_length=30000)
    resume_id: int | None = Field(default=None, gt=0)

    @field_validator("title", "description")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty.")
        return value

    @field_validator("company")
    @classmethod
    def strip_company(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class JobDescriptionUpdate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    company: str | None = Field(default=None, max_length=150)
    description: str = Field(min_length=50, max_length=30000)
    resume_id: int | None = Field(default=None, gt=0)

    @field_validator("title", "description")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be empty.")
        return value

    @field_validator("company")
    @classmethod
    def strip_company(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None


class JobDescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    resume_id: int | None
    title: str
    company: str | None
    description: str
    created_at: datetime
    updated_at: datetime
