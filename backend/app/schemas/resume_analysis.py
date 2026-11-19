
from datetime import datetime
from pydantic import BaseModel, Field


class ResumeContact(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None


class EducationItem(BaseModel):
    degree: str | None = None
    institution: str | None = None
    graduation_year: str | None = None
    details: str | None = None


class ExperienceItem(BaseModel):
    role: str | None = None
    company: str | None = None
    duration: str | None = None
    responsibilities: list[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str | None = None
    description: str | None = None
    technologies: list[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    name: str | None = None
    issuer: str | None = None
    year: str | None = None


class ResumeAnalysis(BaseModel):
    contact: ResumeContact = Field(default_factory=ResumeContact)
    professional_summary: str = ""
    technical_skills: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)


class ResumeAnalysisResponse(BaseModel):
    resume_id: int
    filename: str
    analysis: ResumeAnalysis
    analyzed_at: datetime


class ResumeAnalyzeRequest(BaseModel):
    force_refresh: bool = False
