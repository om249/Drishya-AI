from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.connection import get_db
from app.models.interview import Interview
from app.schemas.interview import InterviewCreate, InterviewResponse

router = APIRouter(prefix="/interviews", tags=["Interviews"])
DbSession = Annotated[Session, Depends(get_db)]


@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(payload: InterviewCreate, current_user: CurrentUser, db: DbSession) -> Interview:
    interview = Interview(
        user_id=current_user.id,
        type=payload.type,
        role=payload.role.strip(),
        subject=payload.subject.strip(),
        difficulty=payload.difficulty,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.get("", response_model=list[InterviewResponse])
def list_interviews(current_user: CurrentUser, db: DbSession) -> list[Interview]:
    return list(
        db.scalars(
            select(Interview)
            .where(Interview.user_id == current_user.id)
            .order_by(Interview.created_at.desc())
        )
    )


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: int, current_user: CurrentUser, db: DbSession) -> Interview:
    interview = db.scalar(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == current_user.id)
    )
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview
