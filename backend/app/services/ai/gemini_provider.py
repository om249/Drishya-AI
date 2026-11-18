
# import logging
# import time

# from google import genai
# from google.genai import types
# from google.genai import errors

# from app.core.config import get_settings
# from app.schemas.nova import Evaluation, GeneratedQuestion

# logger = logging.getLogger(__name__)


# class GeminiProvider:
#     def __init__(self) -> None:
#         settings = get_settings()

#         if not settings.gemini_api_key:
#             raise RuntimeError("GEMINI_API_KEY is not configured.")

#         self.client = genai.Client(
#             api_key=settings.gemini_api_key
#         )
#         self.model = settings.gemini_model

#     def _generate_with_retry(self, prompt: str, schema, temperature: float):
#         """Retry temporary Gemini API failures."""

#         max_attempts = 3
#         retryable_status_codes = {429, 500, 502, 503, 504}

#         for attempt in range(1, max_attempts + 1):
#             try:
#                 response = self.client.models.generate_content(
#                     model=self.model,
#                     contents=prompt,
#                     config=types.GenerateContentConfig(
#                         response_mime_type="application/json",
#                         response_schema=schema,
#                         temperature=temperature,
#                     ),
#                 )

#                 if response.parsed is not None:
#                     return response.parsed

#                 if not response.text:
#                     raise RuntimeError(
#                         "Gemini returned an empty response."
#                     )

#                 return schema.model_validate_json(response.text)

#             except errors.APIError as exc:
#                 status_code = getattr(exc, "code", None)

#                 if (
#                     status_code not in retryable_status_codes
#                     or attempt == max_attempts
#                 ):
#                     logger.exception(
#                         "Gemini API request failed. Status: %s",
#                         status_code,
#                     )
#                     raise

#                 delay = 2 ** attempt

#                 logger.warning(
#                     "Gemini temporarily unavailable. "
#                     "Retrying attempt %s/%s in %s seconds. Status: %s",
#                     attempt,
#                     max_attempts,
#                     delay,
#                     status_code,
#                 )

#                 time.sleep(delay)

#         raise RuntimeError("Gemini request failed after all retry attempts.")

#     def generate_question(self, prompt: str) -> GeneratedQuestion:
#         return self._generate_with_retry(
#             prompt=prompt,
#             schema=GeneratedQuestion,
#             temperature=0.9,
#         )

#     def evaluate_answer(self, prompt: str) -> Evaluation:
#         return self._generate_with_retry(
#             prompt=prompt,
#             schema=Evaluation,
#             temperature=0.2,
#         )






import logging
import time

from google import genai
from google.genai import types, errors

from app.core.config import get_settings
from app.schemas.nova import Evaluation, GeneratedQuestion
from app.services.ai.openai_compatible_provider import (
    OpenAICompatibleProvider,
)

logger = logging.getLogger(__name__)


class GeminiProvider:
    """
    Multi-provider manager for Nova.

    Provider priority:
    1. Gemini
    2. Groq
    3. OpenRouter
    """

    RETRYABLE_STATUS_CODES = {
        408, 425, 429, 500, 502, 503, 504
    }

    def __init__(self) -> None:
        settings = get_settings()

        self.providers = []

        self.model = settings.gemini_model

        # -------------------------------------------------
        # 1. Gemini - Primary provider
        # -------------------------------------------------

        if settings.gemini_api_key:
            self.gemini_client = genai.Client(
                api_key=settings.gemini_api_key
            )

            self.providers.append({
                "name": "Gemini",
                "generate": self._generate_gemini,
            })

        else:
            self.gemini_client = None
            logger.warning(
                "Gemini API key not configured. Skipping Gemini."
            )

        # -------------------------------------------------
        # 2. Groq - First fallback
        # -------------------------------------------------

        if settings.groq_api_key:
            groq = OpenAICompatibleProvider(
                name="Groq",
                api_key=settings.groq_api_key,
                model=settings.groq_model,
                base_url="https://api.groq.com/openai/v1",
            )

            self.providers.append({
                "name": "Groq",
                "generate": groq.generate,
            })

        # -------------------------------------------------
        # 3. OpenRouter - Second fallback
        # -------------------------------------------------

        if settings.openrouter_api_key:
            openrouter = OpenAICompatibleProvider(
                name="OpenRouter",
                api_key=settings.openrouter_api_key,
                model=settings.openrouter_model,
                base_url="https://openrouter.ai/api/v1",
                extra_headers={
                    "X-Title": "Drishya AI Interview Platform",
                },
            )

            self.providers.append({
                "name": "OpenRouter",
                "generate": openrouter.generate,
            })

        if not self.providers:
            raise RuntimeError(
                "No AI provider configured. Configure at least "
                "one of GEMINI_API_KEY, GROQ_API_KEY, "
                "or OPENROUTER_API_KEY."
            )

        logger.info(
            "Nova AI providers initialized: %s",
            ", ".join(p["name"] for p in self.providers),
        )

    # -----------------------------------------------------
    # Gemini generation
    # -----------------------------------------------------

    def _generate_gemini(
        self,
        prompt: str,
        schema,
        temperature: float,
    ):
        settings = get_settings()

        for attempt in range(1, 3):
            try:
                response = self.gemini_client.models.generate_content(
                    model=settings.gemini_model,
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
                    status_code not in self.RETRYABLE_STATUS_CODES
                    or attempt == 2
                ):
                    logger.warning(
                        "Gemini request failed. Status: %s",
                        status_code,
                    )
                    raise

                delay = 2 ** (attempt - 1)

                logger.warning(
                    "Gemini temporarily unavailable. "
                    "Retrying attempt %s/2 in %s seconds.",
                    attempt,
                    delay,
                )

                time.sleep(delay)

    # -----------------------------------------------------
    # Central provider selection and fallback
    # -----------------------------------------------------

    def _generate_with_retry(
        self,
        prompt: str,
        schema,
        temperature: float,
    ):
        failures = []

        for index, provider in enumerate(self.providers):
            name = provider["name"]

            try:
                if index == 0:
                    logger.info(
                        "Nova using primary provider: %s",
                        name,
                    )
                else:
                    logger.warning(
                        "Nova switching to fallback provider: %s",
                        name,
                    )

                result = provider["generate"](
                    prompt=prompt,
                    schema=schema,
                    temperature=temperature,
                )

                logger.info(
                    "Nova successfully generated response using %s.",
                    name,
                )

                return result

            except Exception as exc:
                failures.append(name)

                logger.exception(
                    "Nova provider %s failed. Error type: %s",
                    name,
                    type(exc).__name__,
                )

                if index < len(self.providers) - 1:
                    logger.warning(
                        "Attempting next configured AI provider."
                    )

        logger.error(
            "All Nova providers failed: %s",
            ", ".join(failures),
        )

        raise RuntimeError(
            "Nova is temporarily unable to generate a response. "
            "All configured AI providers are currently unavailable. "
            "Please try again shortly."
        )

    # -----------------------------------------------------
    # Public methods - existing service compatibility
    # -----------------------------------------------------

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
