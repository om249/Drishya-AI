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
from app.schemas import interview

router = APIRouter(prefix="/interviews", tags=["Interviews"])
DbSession = Annotated[Session, Depends(get_db)]
interview_service = InterviewService()
logger = logging.getLogger(__name__)


def get_owned_interview(interview_id: int, user_id: int, db: Session) -> Interview:
    interview = db.scalar(select(Interview).where(Interview.id == interview_id, Interview.user_id == user_id))
    if interview is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview


def get_candidate_question_history(interview: Interview, db: Session) -> list[str]:
    """Return recent questions from this candidate's matching interview track."""
    statement = (
        select(Question.question_text)
        .join(Interview, Interview.id == Question.interview_id)
        .where(
            Interview.user_id == interview.user_id,
            Interview.type == interview.type,
            Interview.role == interview.role,
            Interview.subject == interview.subject,
        )
        .order_by(Question.created_at.desc())
        .limit(40)
    )
    return list(db.scalars(statement))


def get_recent_candidate_scores(interview: Interview, db: Session) -> list[int]:
    statement = (
        select(Answer.score)
        .join(Question, Question.id == Answer.question_id)
        .join(Interview, Interview.id == Question.interview_id)
        .where(
            Interview.user_id == interview.user_id,
            Interview.type == interview.type,
            Interview.role == interview.role,
            Interview.subject == interview.subject,
        )
        .order_by(Answer.created_at.desc())
        .limit(3)
    )
    return list(db.scalars(statement))



def get_candidate_learning_context(
    interview: Interview,
    db: Session,
    limit: int = 8,
) -> str:
    """
    Build a compact learning profile from the candidate's
    recent answers in matching interview tracks.
    """
    statement = (
        select(
            Question.question_text,
            Question.difficulty,
            Answer.answer_text,
            Answer.score,
            Answer.technical_accuracy,
            Answer.relevance,
            Answer.completeness,
            Answer.clarity,
            Answer.strengths,
            Answer.weaknesses,
            Answer.missing_concepts,
            Answer.improvement_suggestions,
            Answer.feedback,
        )
        .join(Answer, Answer.question_id == Question.id)
        .join(Interview, Interview.id == Question.interview_id)
        .where(
            Interview.user_id == interview.user_id,
            Interview.type == interview.type,
            Interview.role == interview.role,
            Interview.subject == interview.subject,
        )
        .order_by(Answer.created_at.desc())
        .limit(limit)
    )

    records = list(db.execute(statement).all())

    if not records:
        return (
            "No previous evaluated answers are available. "
            "Use the current interview configuration to assess the candidate."
        )

    # Reverse so the context reads from oldest to newest.
    records.reverse()

    lines = [
        "CANDIDATE LEARNING HISTORY",
        "The following records are previous evaluated interview responses.",
    ]

    for index, record in enumerate(records, start=1):
        lines.extend([
            f"\nPrevious response {index}:",
            f"Question: {record.question_text[:700]}",
            f"Difficulty: {record.difficulty}",
            f"Candidate answer: {record.answer_text[:1000]}",
            (
                "Scores: "
                f"overall={record.score}/10, "
                f"accuracy={record.technical_accuracy}/10, "
                f"relevance={record.relevance}/10, "
                f"completeness={record.completeness}/10, "
                f"clarity={record.clarity}/10"
            ),
            f"Feedback: {record.feedback[:500]}",
            f"Strengths: {', '.join(record.strengths or [])}",
            f"Weaknesses: {', '.join(record.weaknesses or [])}",
            f"Missing concepts: {', '.join(record.missing_concepts or [])}",
            (
                "Improvement suggestions: "
                f"{', '.join(record.improvement_suggestions or [])}"
            ),
        ])

    lines.extend([
        "",
        "Use this history to identify recurring weaknesses, "
        "improvements, and concepts that need further assessment.",
    ])

    return "\n".join(lines)


def get_follow_up_context(
    question: Question,
    db: Session,
) -> str:
    """
    Prepare immediate previous-answer evidence for Nova.
    """
    answer = db.scalar(
        select(Answer).where(Answer.question_id == question.id)
    )

    if answer is None:
        return ""

    return "\n".join([
        f"Previous question: {question.question_text[:700]}",
        f"Previous answer: {answer.answer_text[:1200]}",
        f"Overall score: {answer.score}/10",
        f"Technical accuracy: {answer.technical_accuracy}/10",
        f"Relevance: {answer.relevance}/10",
        f"Completeness: {answer.completeness}/10",
        f"Clarity: {answer.clarity}/10",
        f"Strengths: {', '.join(answer.strengths or [])}",
        f"Weaknesses: {', '.join(answer.weaknesses or [])}",
        f"Missing concepts: {', '.join(answer.missing_concepts or [])}",
        (
            "Improvement suggestions: "
            f"{', '.join(answer.improvement_suggestions or [])}"
        ),
        f"Evaluator feedback: {answer.feedback[:700]}",
    ])

@router.post(
    "",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    payload: InterviewCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> Interview:
    interview = Interview(
        user_id=current_user.id,
        type=payload.type,
        role=payload.role,
        subject=payload.subject,
        difficulty=payload.difficulty,
        experience_level=payload.experience_level,
        target_company=payload.target_company,
        focus_areas=payload.focus_areas,
        question_count=payload.question_count,
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
    previous_questions = get_candidate_question_history(interview, db)
    target_difficulty = interview_service.adaptive_difficulty(
    interview.difficulty, get_recent_candidate_scores(interview, db),
    )
    try:
        generated = interview_service.question(
            interview, sequence=1, previous_questions=previous_questions,
            history=get_candidate_learning_context(interview, db),difficulty=target_difficulty,
        )
    except Exception as error:
        logger.exception("Nova question generation failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Nova could not generate a question. Please try again.",
        ) from error
    question = Question(interview_id=interview.id, question_text=generated.question_text, question_type=generated.question_type, difficulty=target_difficulty, sequence_number=1)
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
        evaluation = interview_service.evaluate(
                     interview=interview,
                     question=question.question_text,
                     answer=payload.answer_text,
                     difficulty=question.difficulty,
                    )
    except Exception as error:
        logger.exception("Nova answer evaluation failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Nova could not evaluate this answer. Please try again.",
        ) from error
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
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Answer the current question before continuing"
        )
    if len(questions) >= interview.question_count:
        raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="The selected interview question limit has been reached. Complete the interview.",
    )
    previous_questions = get_candidate_question_history(interview, db)
    recent_scores = get_recent_candidate_scores(interview, db)
    target_difficulty = interview_service.adaptive_difficulty(
                        questions[-1].difficulty,
                        recent_scores,
                        )
    history = get_candidate_learning_context(interview, db)
    try:

        follow_up_context = get_follow_up_context(
                        questions[-1],
                        db,
        )

        generated = interview_service.question(
            interview, sequence=len(questions) + 1, history=history,
            previous_questions=previous_questions, difficulty=target_difficulty,
            follow_up_context=follow_up_context,
        )
    except Exception as error:
        logger.exception("Nova question generation failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Nova could not generate a question. Please try again.",
        ) from error
    question = Question(interview_id=interview.id, question_text=generated.question_text, question_type=generated.question_type, difficulty=target_difficulty, sequence_number=len(questions) + 1)
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
