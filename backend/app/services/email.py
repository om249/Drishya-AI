import smtplib
from email.message import EmailMessage
from typing import Iterable

from app.core.config import get_settings


def _smtp_error_message(error: Exception) -> str:
    detail = str(error)
    if hasattr(error, "smtp_code") and getattr(error, "smtp_code", None):
        detail = f"SMTP {error.smtp_code}: {detail}"
    return detail


def send_registration_otp(recipient: str, code: str) -> None:
    _send(
        recipient,
        "Your Drishya verification code",
        f"Your Drishya verification code is {code}. It expires in 10 minutes. Do not share this code.",
    )


def send_interview_summary(
    recipient: str,
    name: str,
    interview_type: str,
    role: str,
    subject: str,
    score: int,
    feedback: Iterable[str],
) -> None:
    feedback_lines = "\n".join(f"• {item}" for item in feedback) or "• Keep practicing consistently."
    _send(
        recipient,
        f"Your Drishya {subject} interview results",
        f"Hi {name},\n\nNova has completed your {interview_type} interview for {role}.\n\n"
        f"Subject: {subject}\nOverall score: {score}/10\n\nNova's feedback:\n{feedback_lines}\n\n"
        "Return to Drishya to review your detailed feedback and continue preparing.\n\n— Nova, Drishya AI Coach",
    )


def _send(recipient: str, subject: str, content: str) -> None:
    settings = get_settings()
    if not all([settings.smtp_host, settings.smtp_username, settings.smtp_password, settings.smtp_from_email]):
        raise RuntimeError("Email delivery is not configured")
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.smtp_from_email
    message["To"] = recipient
    message.set_content(content)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except smtplib.SMTPAuthenticationError as error:
        raise RuntimeError(f"Email delivery failed: Gmail authentication failed. Check your SMTP app password and 2-step verification. Details: {_smtp_error_message(error)}") from error
    except (smtplib.SMTPException, OSError, TimeoutError) as error:
        raise RuntimeError(f"Email delivery failed: {_smtp_error_message(error)}") from error
