
import logging
import time

from google import genai
from google.genai import types
from google.genai import errors

from app.core.config import get_settings
from app.schemas.nova import Evaluation, GeneratedQuestion

logger = logging.getLogger(__name__)


class GeminiProvider:
    def __init__(self) -> None:
        settings = get_settings()

        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured.")

        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )
        self.model = settings.gemini_model

    def _generate_with_retry(self, prompt: str, schema, temperature: float):
        """Retry temporary Gemini API failures."""

        max_attempts = 3
        retryable_status_codes = {429, 500, 502, 503, 504}

        for attempt in range(1, max_attempts + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=schema,
                        temperature=temperature,
                    ),
                )

                if response.parsed is not None:
                    return response.parsed

                if not response.text:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                return schema.model_validate_json(response.text)

            except errors.APIError as exc:
                status_code = getattr(exc, "code", None)

                if (
                    status_code not in retryable_status_codes
                    or attempt == max_attempts
                ):
                    logger.exception(
                        "Gemini API request failed. Status: %s",
                        status_code,
                    )
                    raise

                delay = 2 ** attempt

                logger.warning(
                    "Gemini temporarily unavailable. "
                    "Retrying attempt %s/%s in %s seconds. Status: %s",
                    attempt,
                    max_attempts,
                    delay,
                    status_code,
                )

                time.sleep(delay)

        raise RuntimeError("Gemini request failed after all retry attempts.")

    def generate_question(self, prompt: str) -> GeneratedQuestion:
        return self._generate_with_retry(
            prompt=prompt,
            schema=GeneratedQuestion,
            temperature=0.9,
        )

    def evaluate_answer(self, prompt: str) -> Evaluation:
        return self._generate_with_retry(
            prompt=prompt,
            schema=Evaluation,
            temperature=0.2,
        )
