from typing import Annotated
from datetime import datetime, timedelta, timezone
from secrets import randbelow

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.database.connection import get_db
from app.models.email_verification import EmailVerification
from app.models.user import User
from app.schemas.auth import EmailRequest, LoginRequest, MessageResponse, RegisterRequest, TokenResponse, VerifyRegistrationRequest
from app.schemas.user import UserResponse
from app.services.email import send_registration_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])
DbSession = Annotated[Session, Depends(get_db)]


def create_otp() -> str:
    return f"{randbelow(1_000_000):06d}"


def dispatch_verification(name: str, email: str, password_hash: str, db: Session) -> None:
    pending = db.scalar(select(EmailVerification).where(EmailVerification.email == email))
    code = create_otp()
    if pending:
        pending.name, pending.password_hash, pending.otp_hash = name, password_hash, hash_password(code)
        pending.expires_at, pending.attempts = datetime.now(timezone.utc) + timedelta(minutes=10), 0
    else:
        db.add(EmailVerification(name=name, email=email, password_hash=password_hash, otp_hash=hash_password(code), expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)))
    send_registration_otp(email, code)


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_202_ACCEPTED)
def register_user(payload: RegisterRequest, db: DbSession) -> MessageResponse:
    email = str(payload.email).lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    try:
        dispatch_verification(payload.name.strip(), email, hash_password(payload.password), db)
        db.commit()
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Email verification failed: {error}",
        ) from error
    return MessageResponse(message="Verification code sent to your email")


@router.post("/verify-registration", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def verify_registration(payload: VerifyRegistrationRequest, db: DbSession) -> User:
    email = str(payload.email).lower()
    pending = db.scalar(select(EmailVerification).where(EmailVerification.email == email))
    if pending is None or pending.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification code has expired")
    if pending.attempts >= 5:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many invalid attempts")
    if not verify_password(payload.code, pending.otp_hash):
        pending.attempts += 1
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
    user = User(name=pending.name, email=pending.email, password_hash=pending.password_hash)
    db.delete(pending)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/resend-verification", response_model=MessageResponse, status_code=status.HTTP_202_ACCEPTED)
def resend_verification(payload: EmailRequest, db: DbSession) -> MessageResponse:
    pending = db.scalar(select(EmailVerification).where(EmailVerification.email == str(payload.email).lower()))
    if pending is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No pending registration found")
    try:
        dispatch_verification(pending.name, pending.email, pending.password_hash, db)
        db.commit()
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Email verification failed: {error}",
        ) from error
    return MessageResponse(message="Verification code sent to your email")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(access_token=create_access_token(str(user.id)))
