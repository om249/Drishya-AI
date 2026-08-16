from collections import Counter, defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.connection import get_db
from app.models.answer import Answer
from app.models.interview import Interview
from app.models.question import Question
from app.schemas.dashboard import DashboardResponse, InterviewHistoryItem, TopicPerformance

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(current_user: CurrentUser, db: Session = Depends(get_db)) -> DashboardResponse:
    interviews = list(
        db.scalars(
            select(Interview)
            .where(Interview.user_id == current_user.id)
            .order_by(Interview.created_at.desc())
        )
    )
    completed = [item for item in interviews if item.status == "completed"]
    rows = db.execute(
        select(Interview.subject, Answer)
        .join(Question, Question.interview_id == Interview.id)
        .join(Answer, Answer.question_id == Question.id)
        .where(Interview.user_id == current_user.id)
    ).all()
    scores: dict[str, list[int]] = defaultdict(list)
    strengths, weaknesses, missing = Counter(), Counter(), Counter()
    for subject, answer in rows:
        scores[subject].append(answer.score)
        strengths.update(answer.strengths)
        weaknesses.update(answer.weaknesses)
        missing.update(answer.missing_concepts)
    readiness = round(sum(item.overall_score for item in completed if item.overall_score is not None) / len(completed) * 10) if completed else 0
    topics = [TopicPerformance(topic=topic, score=round(sum(values) / len(values) * 10), attempts=len(values)) for topic, values in scores.items()]
    topics.sort(key=lambda item: item.score)
    weakest_topics = [item.topic for item in topics[:3] if item.score < 70]
    recommendations = [f"Practice {topic} through another focused interview." for topic in weakest_topics]
    recommendations.extend(f"Review: {concept}." for concept, _ in missing.most_common(3) if concept)
    if not recommendations and completed:
        recommendations.append("Maintain momentum with a higher-difficulty practice interview.")
    return DashboardResponse(
        overall_readiness=readiness,
        completed_interviews=len(completed),
        interview_history=[InterviewHistoryItem.model_validate(item, from_attributes=True) for item in completed[:10]],
        topic_performance=topics,
        strengths=[item for item, _ in strengths.most_common(5)],
        weaknesses=[item for item, _ in weaknesses.most_common(5)],
        recommendations=recommendations[:5],
    )
