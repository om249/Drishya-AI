
from io import BytesIO
import logging

import os
import uuid
from pathlib import Path

from fastapi.responses import FileResponse

from sqlalchemy import delete
from docx import Document
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from pypdf import PdfReader
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Annotated

from app.api.dependencies import CurrentUser
from app.database.connection import get_db
from app.models.resume import ResumeProfile
from app.schemas.resume import (
    ResumeDetailResponse,
    ResumeResponse,
    ResumeUploadResponse,
)

RESUME_STORAGE_DIR = (
    Path(__file__).resolve().parents[3]
    / "private_uploads"
    / "resumes"
)

router = APIRouter(prefix="/resumes", tags=["Resumes"])

DbSession = Annotated[Session, Depends(get_db)]

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
}


def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(file_bytes))

        if reader.is_encrypted:
            raise ValueError("Password-protected PDFs are not supported.")

        extracted = []

        for page in reader.pages:
            extracted.append(page.extract_text() or "")

        return "\n".join(extracted).strip()

    except ValueError:
        raise
    except Exception as error:
        raise ValueError("Could not read this PDF file.") from error


def extract_docx_text(file_bytes: bytes) -> str:
    try:
        document = Document(BytesIO(file_bytes))

        paragraphs = [
            paragraph.text.strip()
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        ]

        table_text = []

        for table in document.tables:
            for row in table.rows:
                cells = [
                    cell.text.strip()
                    for cell in row.cells
                    if cell.text.strip()
                ]

                if cells:
                    table_text.append(" | ".join(cells))

        return "\n".join(paragraphs + table_text).strip()

    except Exception as error:
        raise ValueError("Could not read this DOCX file.") from error


def validate_file_signature(
    extension: str,
    file_bytes: bytes,
) -> bool:
    if extension == ".pdf":
        return file_bytes.startswith(b"%PDF-")

    if extension == ".docx":
        return file_bytes.startswith(b"PK\x03\x04")

    return False


@router.post(
    "/upload",
    response_model=ResumeUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    current_user: CurrentUser,
    db: DbSession,
    file: Annotated[UploadFile, File(...)],
):
    filename = (file.filename or "").replace("\\", "/").split("/")[-1]
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF and DOCX resumes are supported.",
        )

    file_bytes = await file.read(MAX_FILE_SIZE + 1)

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Resume file must not exceed 5 MB.",
        )

    if not validate_file_signature(extension, file_bytes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file does not match its file extension.",
        )

    try:
        if extension == ".pdf":
            extracted_text = extract_pdf_text(file_bytes)
        else:
            extracted_text = extract_docx_text(file_bytes)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    if len(extracted_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Could not extract enough text from this resume. "
                "Please upload a text-based PDF or DOCX file."
            ),
        )

    
    user_directory = RESUME_STORAGE_DIR / str(current_user.id)
    user_directory.mkdir(parents=True, exist_ok=True)

    safe_filename = f"{uuid.uuid4().hex}{extension}"
    file_path = user_directory / safe_filename

    try:
        file_path.write_bytes(file_bytes)

        resume = ResumeProfile(
            user_id=current_user.id,
            filename=filename[:255],
            file_type=ALLOWED_EXTENSIONS[extension],
            extracted_text=extracted_text,
            storage_path=str(file_path),
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

    except Exception as error:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        logger.exception("Resume upload storage failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save the resume.",
        ) from error

    response = ResumeResponse(
        id=resume.id,
        filename=resume.filename,
        file_type=resume.file_type,
        character_count=len(resume.extracted_text),
        created_at=resume.created_at,
    )

    return ResumeUploadResponse(
        message="Resume uploaded successfully.",
        resume=response,
    )


    resume = ResumeProfile(
        user_id=current_user.id,
        filename=filename[:255],
        file_type=ALLOWED_EXTENSIONS[extension],
        extracted_text=extracted_text,
    )

    try:
        db.add(resume)
        db.commit()
        db.refresh(resume)

    except Exception as error:
        db.rollback()
        logger.exception("Resume database save failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save the resume.",
        ) from error

    response = ResumeResponse(
        id=resume.id,
        filename=resume.filename,
        file_type=resume.file_type,
        character_count=len(resume.extracted_text),
        created_at=resume.created_at,
    )

    return ResumeUploadResponse(
        message="Resume uploaded and text extracted successfully.",
        resume=response,
    )


@router.get(
    "",
    response_model=list[ResumeResponse],
)
def list_resumes(
    current_user: CurrentUser,
    db: DbSession,
):
    statement = (
        select(ResumeProfile)
        .where(ResumeProfile.user_id == current_user.id)
        .order_by(ResumeProfile.created_at.desc())
    )

    resumes = list(db.scalars(statement))

    return [
        ResumeResponse(
            id=resume.id,
            filename=resume.filename,
            file_type=resume.file_type,
            character_count=len(resume.extracted_text),
            created_at=resume.created_at,
        )
        for resume in resumes
    ]


@router.get(
    "/{resume_id}",
    response_model=ResumeDetailResponse,
)
def get_resume(
    resume_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    resume = db.scalar(
        select(ResumeProfile).where(
            ResumeProfile.id == resume_id,
            ResumeProfile.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    return ResumeDetailResponse(
        id=resume.id,
        filename=resume.filename,
        file_type=resume.file_type,
        character_count=len(resume.extracted_text),
        created_at=resume.created_at,
        extracted_text=resume.extracted_text,
    )

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    resume = db.scalar(
        select(ResumeProfile).where(
            ResumeProfile.id == resume_id,
            ResumeProfile.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    storage_path = (
        Path(resume.storage_path)
        if resume.storage_path
        else None
    )

    db.delete(resume)
    db.commit()

    if storage_path:
        try:
            storage_path.unlink(missing_ok=True)
        except OSError:
            logger.exception("Could not delete original resume file")

    return {"message": "Resume deleted successfully."}


@router.get("/{resume_id}/file")
def get_resume_file(
    resume_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    resume = db.scalar(
        select(ResumeProfile).where(
            ResumeProfile.id == resume_id,
            ResumeProfile.user_id == current_user.id,
        )
    )

    if resume is None or not resume.storage_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original resume file not found.",
        )

    file_path = Path(resume.storage_path).resolve()

    if not file_path.is_relative_to(RESUME_STORAGE_DIR.resolve()):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid resume storage location.",
        )

    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original resume file is missing.",
        )

    media_type = (
        "application/pdf"
        if resume.file_type == "pdf"
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=resume.filename,
        content_disposition_type="inline",
    )