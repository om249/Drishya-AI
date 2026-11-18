
# from functools import lru_cache

# from pydantic import PostgresDsn
# from pydantic_settings import BaseSettings, SettingsConfigDict


# class Settings(BaseSettings):
#     """Application settings loaded from environment variables or backend/.env."""

#     database_url: PostgresDsn
#     secret_key: str

#     # Gemini AI configuration
#     gemini_model: str = "gemini-3.5-flash"
#     gemini_fallback_model: str | None = None
#     gemini_api_key: str | None = None

#     # Authentication
#     access_token_expire_minutes: int = 60 * 24

#     # Email / OTP configuration
#     smtp_host: str | None = None
#     smtp_port: int = 587
#     smtp_username: str | None = None
#     smtp_password: str | None = None
#     smtp_from_email: str | None = None

#     model_config = SettingsConfigDict(
#         env_file=".env",
#         env_file_encoding="utf-8",
#         case_sensitive=False,
#         extra="ignore",
#     )


# @lru_cache
# def get_settings() -> Settings:
#     return Settings()





from functools import lru_cache

from pydantic import PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or backend/.env."""

    database_url: PostgresDsn
    secret_key: str

    # Gemini - Primary AI provider
    gemini_model: str = "gemini-3.5-flash"
    gemini_api_key: str | None = None

    # Groq - First fallback
    groq_api_key: str | None = None
    groq_model: str = "openai/gpt-oss-20b"

    # OpenRouter - Second fallback
    openrouter_api_key: str | None = None
    openrouter_model: str = "openrouter/free"

    # Authentication
    access_token_expire_minutes: int = 60 * 24

    # Email / OTP
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

