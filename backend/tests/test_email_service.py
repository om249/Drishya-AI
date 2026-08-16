import smtplib

import pytest

from app.services.email import _send


class FakeSMTP:
    def __init__(self, *args, **kwargs):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def starttls(self):
        return None

    def login(self, username, password):
        raise smtplib.SMTPAuthenticationError(535, b"Authentication Failed")

    def send_message(self, message):
        return None


def test_send_raises_clear_error_for_smtp_auth_failure(monkeypatch):
    class Settings:
        smtp_host = "smtp.gmail.com"
        smtp_port = 587
        smtp_username = "user@gmail.com"
        smtp_password = "wrong-password"
        smtp_from_email = "user@gmail.com"

    monkeypatch.setattr("app.services.email.get_settings", lambda: Settings())
    monkeypatch.setattr("app.services.email.smtplib.SMTP", FakeSMTP)

    with pytest.raises(RuntimeError, match="Email delivery failed.*Authentication Failed"):
        _send("test@example.com", "Subject", "Body")
