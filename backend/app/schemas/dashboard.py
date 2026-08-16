from datetime import datetime

from pydantic import BaseModel


class TopicPerformance(BaseModel):
    topic: str
    score: int
    attempts: int


class InterviewHistoryItem(BaseModel):
    id: int
    type: str
    role: str
    subject: str
    difficulty: str
    overall_score: int | None
    completed_at: datetime | None


class DashboardResponse(BaseModel):
    overall_readiness: int
    completed_interviews: int
    interview_history: list[InterviewHistoryItem]
    topic_performance: list[TopicPerformance]
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
