from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.connection import get_db
from app.models.job_description import JobDescription
from app.models.resume import ResumeProfile
from app.models.resume_job_matches import ResumeJobMatch
from app.schemas.resume_analysis import ResumeAnalysis
from app.schemas.resume_matching import (
    ResumeJobMatchRequest,
    ResumeJobMatchResponse,
)
from app.services.resume.matcher import ResumeJobMatcher
from app.services.resume.analyzer import ResumeAnalyzer


router = APIRouter(
    prefix="/job-descriptions",
    tags=["Resume Matching"],
)

DbSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/{job_description_id}/match",
    response_model=ResumeJobMatchResponse,
)
def match_resume_with_job(
    job_description_id: int,
    payload: ResumeJobMatchRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    job = db.scalar(
        select(JobDescription).where(
            JobDescription.id == job_description_id,
            JobDescription.user_id == current_user.id,
        )
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found.",
        )

    resume = db.scalar(
        select(ResumeProfile).where(
            ResumeProfile.id == payload.resume_id,
            ResumeProfile.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    if not resume.extracted_text or len(resume.extracted_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The selected resume does not contain enough extracted text.",
        )

    try:
        # Generate resume analysis if it has not been generated yet.
        if not resume.analysis_json:
            analysis = ResumeAnalyzer().analyze(resume.extracted_text)
            resume.analysis_json = analysis.model_dump(mode="json")
            resume.analyzed_at = datetime.now(timezone.utc)
        else:
            analysis = ResumeAnalysis.model_validate(resume.analysis_json)

        matcher = ResumeJobMatcher()

        requirements = matcher.extract_requirements(
            job.description
        )

        report = matcher.evaluate_match(
            resume=analysis,
            requirements=requirements,
            resume_text=resume.extracted_text,
        )

        # Persist or update the report for this resume/JD pair.
        existing_match = db.scalar(
            select(ResumeJobMatch).where(
                ResumeJobMatch.user_id == current_user.id,
                ResumeJobMatch.resume_id == resume.id,
                ResumeJobMatch.job_description_id == job.id,
            )
        )

        matched_at = datetime.now(timezone.utc)

        if existing_match:
            existing_match.report_json = report.model_dump(mode="json")
            existing_match.matched_at = matched_at
        else:
            db.add(
                ResumeJobMatch(
                    user_id=current_user.id,
                    resume_id=resume.id,
                    job_description_id=job.id,
                    report_json=report.model_dump(mode="json"),
                    matched_at=matched_at,
                )
            )

        db.commit()

        return ResumeJobMatchResponse(
            resume_id=resume.id,
            resume_filename=resume.filename,
            job_description_id=job.id,
            job_title=job.title,
            company=job.company,
            report=report,
            matched_at=matched_at,
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        import logging

        logging.exception(
            "Resume matching failed",
            exc_info=True,
        )

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Resume matching failed: {str(error)}",
        ) from error