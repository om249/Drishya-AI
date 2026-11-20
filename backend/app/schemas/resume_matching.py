from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


MatchStatus = Literal["matched", "partial", "missing"]


class JobRequirementAnalysis(BaseModel):
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    required_experience_years: float | None = None
    education_requirements: list[str] = Field(default_factory=list)
    key_responsibilities: list[str] = Field(default_factory=list)


class SkillMatch(BaseModel):
    skill: str
    category: Literal["required", "preferred"]
    status: MatchStatus
    evidence: str = ""


class ResumeJobMatchReport(BaseModel):
    match_score: float = Field(default=0, ge=0, le=100)
    skill_score: float = Field(default=0, ge=0, le=100)
    experience_score: float = Field(default=0, ge=0, le=100)
    education_score: float = Field(default=0, ge=0, le=100)

    matched_skills: list[SkillMatch] = Field(default_factory=list)
    partial_skills: list[SkillMatch] = Field(default_factory=list)
    missing_skills: list[SkillMatch] = Field(default_factory=list)

    experience_status: MatchStatus | None = None
    experience_evidence: str = ""
    experience_analysis: str = ""

    education_status: MatchStatus | None = None
    education_evidence: str = ""
    education_analysis: str = ""

    strengths: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class ResumeJobMatchResponse(BaseModel):
    resume_id: int
    resume_filename: str
    job_description_id: int
    job_title: str
    company: str | None = None
    report: ResumeJobMatchReport
    matched_at: datetime


class ResumeJobMatchRequest(BaseModel):
    resume_id: int = Field(gt=0)
    force_refresh: bool = False