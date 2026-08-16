from datetime import datetime, timezone
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.connection import get_db
from app.models.answer import Answer
from app.models.interview import Interview
from app.models.question import Question
from app.schemas.answer import AnswerResponse, AnswerSubmit
from app.schemas.interview import InterviewCreate, InterviewResponse
from app.schemas.question import QuestionResponse
from app.services.interview.service import InterviewService
from app.services.email import send_interview_summary

router = APIRouter(prefix="/interviews", tags=["Interviews"])
DbSession = Annotated[Session, Depends(get_db)]
interview_service = InterviewService()
logger = logging.getLogger(__name__)


def get_owned_interview(interview_id: int, user_id: int, db: Session) -> Interview:
    interview = db.scalar(select(Interview).where(Interview.id == interview_id, Interview.user_id == user_id))
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview


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
    return get_owned_interview(interview_id, current_user.id, db)


@router.post("/{interview_id}/start", response_model=QuestionResponse)
def start_interview(interview_id: int, current_user: CurrentUser, db: DbSession) -> Question:
    interview = get_owned_interview(interview_id, current_user.id, db)
    if interview.status != "created":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Interview has already started")
    try:
        generated = interview_service.question(interview, sequence=1)
    except Exception as error:
        logger.exception("Nova question generation failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Nova could not generate a question: {error}"
        ) from error
    question = Question(interview_id=interview.id, question_text=generated.question_text, question_type=generated.question_type, difficulty=interview.difficulty, sequence_number=1)
    interview.status = "in_progress"
    interview.started_at = datetime.now(timezone.utc)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.post("/{interview_id}/answer", response_model=AnswerResponse)
def submit_answer(interview_id: int, payload: AnswerSubmit, current_user: CurrentUser, db: DbSession) -> Answer:
    interview = get_owned_interview(interview_id, current_user.id, db)
    if interview.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Interview is not in progress")
    question = db.scalar(select(Question).where(Question.id == payload.question_id, Question.interview_id == interview.id))
    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if db.scalar(select(Answer).where(Answer.question_id == question.id)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Question has already been answered")
    try:
        evaluation = interview_service.evaluate(interview, question.question_text, payload.answer_text)
    except Exception as error:
        logger.exception("Nova answer evaluation failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Nova could not evaluate the answer{error}") from error
    answer = Answer(question_id=question.id, user_id=current_user.id, answer_text=payload.answer_text.strip(), **evaluation.model_dump())
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer


@router.post("/{interview_id}/next-question", response_model=QuestionResponse)
def next_question(interview_id: int, current_user: CurrentUser, db: DbSession) -> Question:
    interview = get_owned_interview(interview_id, current_user.id, db)
    if interview.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Interview is not in progress")
    questions = list(db.scalars(select(Question).where(Question.interview_id == interview.id).order_by(Question.sequence_number)))
    if not questions or db.scalar(select(Answer).where(Answer.question_id == questions[-1].id)) is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Answer the current question before continuing")
    history = " | ".join(question.question_text for question in questions[-3:])
    try:
        generated = interview_service.question(interview, sequence=len(questions) + 1, history=history)
    except Exception as error:
        logger.exception("Nova question generation failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Nova could not generate a question{error}") from error
    question = Question(interview_id=interview.id, question_text=generated.question_text, question_type=generated.question_type, difficulty=interview.difficulty, sequence_number=len(questions) + 1)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.post("/{interview_id}/complete", response_model=InterviewResponse)
def complete_interview(interview_id: int, current_user: CurrentUser, db: DbSession) -> Interview:
    interview = get_owned_interview(interview_id, current_user.id, db)
    if interview.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Interview is not in progress")
    scores = list(db.scalars(select(Answer.score).join(Question).where(Question.interview_id == interview.id)))
    if not scores:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Answer at least one question before completing")
    interview.status = "completed"
    interview.completed_at = datetime.now(timezone.utc)
    interview.overall_score = round(sum(scores) / len(scores))
    db.commit()
    db.refresh(interview)
    answers = list(db.scalars(select(Answer).join(Question).where(Question.interview_id == interview.id)))
    feedback = [answer.feedback for answer in answers[-3:]]
    try:
        send_interview_summary(
            current_user.email,
            current_user.name,
            interview.type,
            interview.role,
            interview.subject,
            interview.overall_score,
            feedback,
        )
    except Exception:
        logger.exception("Interview summary email could not be delivered")
    return interview
