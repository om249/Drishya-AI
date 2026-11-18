
import json
import logging
import time
from typing import Type

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class OpenAICompatibleProvider:
    """Shared client for Groq and OpenRouter APIs."""

    RETRYABLE_STATUS_CODES = {
        408, 425, 429, 500, 502, 503, 504
    }

    def __init__(
        self,
        name: str,
        api_key: str,
        model: str,
        base_url: str,
        extra_headers: dict | None = None,
    ):
        self.name = name
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.extra_headers = extra_headers or {}

    def generate(
        self,
        prompt: str,
        schema: Type[BaseModel],
        temperature: float,
    ):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            **self.extra_headers,
        }

        schema_description = json.dumps(
            schema.model_json_schema(),
            ensure_ascii=False,
        )

        messages = [
            {
                "role": "system",
                "content": (
                    "You are Nova, an AI interview assistant. "
                    "Return only a valid JSON object matching "
                    "the supplied response schema. Do not include "
                    "Markdown, code fences, or additional text.\n\n"
                    f"Required JSON schema:\n{schema_description}"
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ]

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "response_format": {
                "type": "json_object"
            },
        }

        for attempt in range(1, 3):
            try:
                response = httpx.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0,
                )

                response.raise_for_status()

                data = response.json()

                content = (
                    data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content")
                )

                if isinstance(content, list):
                    content = "".join(
                        item.get("text", "")
                        for item in content
                        if isinstance(item, dict)
                    )

                if not content:
                    raise ValueError(
                        f"{self.name} returned an empty response."
                    )

                # Validate model output against the existing
                # Drishya Pydantic schema.
                return schema.model_validate_json(content)

            except httpx.HTTPStatusError as exc:
                status_code = exc.response.status_code

                if (
                    status_code not in self.RETRYABLE_STATUS_CODES
                    or attempt == 2
                ):
                    logger.warning(
                        "%s API request failed. HTTP status: %s",
                        self.name,
                        status_code,
                    )
                    raise

                delay = 2 ** (attempt - 1)

                logger.warning(
                    "%s temporarily unavailable. "
                    "Retrying attempt %s/2 in %s seconds.",
                    self.name,
                    attempt,
                    delay,
                )

                time.sleep(delay)

            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                if attempt == 2:
                    logger.warning(
                        "%s network request failed after retries: %s",
                        self.name,
                        type(exc).__name__,
                    )
                    raise

                time.sleep(2 ** (attempt - 1))

        raise RuntimeError(
            f"{self.name} failed after all retry attempts."
        )
