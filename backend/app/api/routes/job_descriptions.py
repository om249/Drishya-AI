
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.connection import get_db
from app.models.job_description import JobDescription
from app.models.resume import ResumeProfile
from app.schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    JobDescriptionUpdate,
)

router = APIRouter(
    prefix="/job-descriptions",
    tags=["Job Descriptions"],
)

DbSession = Annotated[Session, Depends(get_db)]


def validate_resume_ownership(
    resume_id: int | None,
    user_id: int,
    db: Session,
) -> None:
    if resume_id is None:
        return

    resume = db.scalar(
        select(ResumeProfile).where(
            ResumeProfile.id == resume_id,
            ResumeProfile.user_id == user_id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The selected resume was not found.",
        )


@router.post(
    "",
    response_model=JobDescriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_description(
    payload: JobDescriptionCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    validate_resume_ownership(
        payload.resume_id,
        current_user.id,
        db,
    )

    job_description = JobDescription(
        user_id=current_user.id,
        resume_id=payload.resume_id,
        title=payload.title,
        company=payload.company,
        description=payload.description,
    )

    db.add(job_description)
    db.commit()
    db.refresh(job_description)

    return job_description


@router.get(
    "",
    response_model=list[JobDescriptionResponse],
)
def list_job_descriptions(
    current_user: CurrentUser,
    db: DbSession,
):
    statement = (
        select(JobDescription)
        .where(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
    )

    return list(db.scalars(statement))


@router.get(
    "/{job_description_id}",
    response_model=JobDescriptionResponse,
)
def get_job_description(
    job_description_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    job_description = db.scalar(
        select(JobDescription).where(
            JobDescription.id == job_description_id,
            JobDescription.user_id == current_user.id,
        )
    )

    if job_description is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found.",
        )

    return job_description


@router.put(
    "/{job_description_id}",
    response_model=JobDescriptionResponse,
)
def update_job_description(
    job_description_id: int,
    payload: JobDescriptionUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    job_description = db.scalar(
        select(JobDescription).where(
            JobDescription.id == job_description_id,
            JobDescription.user_id == current_user.id,
        )
    )

    if job_description is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found.",
        )

    validate_resume_ownership(
        payload.resume_id,
        current_user.id,
        db,
    )

    job_description.title = payload.title
    job_description.company = payload.company
    job_description.description = payload.description
    job_description.resume_id = payload.resume_id

    db.commit()
    db.refresh(job_description)

    return job_description


@router.delete(
    "/{job_description_id}",
)
def delete_job_description(
    job_description_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    job_description = db.scalar(
        select(JobDescription).where(
            JobDescription.id == job_description_id,
            JobDescription.user_id == current_user.id,
        )
    )

    if job_description is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found.",
        )

    db.delete(job_description)
    db.commit()

    return {"message": "Job description deleted successfully."}
