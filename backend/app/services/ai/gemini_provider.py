# from google import genai
# from google.genai import types

# from app.core.config import get_settings
# from app.schemas.nova import Evaluation, GeneratedQuestion


# class GeminiProvider:
#     model = "gemini-2.5-flash"

#     def __init__(self) -> None:
#         key = get_settings().gemini_api_key
#         if not key:
#             raise RuntimeError("GEMINI_API_KEY is not configured")
#         self.client = genai.Client(api_key=key)

#     def generate_question(self, prompt: str) -> GeneratedQuestion:
#         response = self.client.models.generate_content(
#             model=self.model, contents=prompt,
#             config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=GeneratedQuestion),
#         )
#         return response.parsed or GeneratedQuestion.model_validate_json(response.text)

#     def evaluate_answer(self, prompt: str) -> Evaluation:
#         response = self.client.models.generate_content(
#             model=self.model, contents=prompt,
#             config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=Evaluation),
#         )
#         return response.parsed or Evaluation.model_validate_json(response.text)


from urllib import response

from google import genai
from google.genai import types

from app.core.config import get_settings
from app.schemas.nova import Evaluation, GeneratedQuestion


class GeminiProvider:
    def __init__(self):
        settings = get_settings()

        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

        self.model = settings.gemini_model

    def generate_question(self, prompt: str) -> GeneratedQuestion:
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeneratedQuestion,
            ),
        )

        if response.parsed:
            return response.parsed

        return GeneratedQuestion.model_validate_json(
            response.text
        )

    def evaluate_answer(self, prompt: str) -> Evaluation:
        response = self.client.models.generate_content(
        model=self.model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Evaluation,
        ),
    )

        if response.parsed:
            return response.parsed

        return Evaluation.model_validate_json(response.text)