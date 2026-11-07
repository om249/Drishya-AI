# Drishya — Phase 1 backend update

## Included changes
- Nova now receives up to 40 recent questions from the candidate's matching interview track (same user, role, interview type, and subject).
- Question generation explicitly prohibits repeating or lightly paraphrasing previous questions.
- Generated questions are checked for exact/near-duplicate wording; generation retries up to three times before returning a controlled API error.
- Question difficulty adapts one level at a time using the candidate's three most recent scores in the matching interview track.
- Evaluation prompts now define the scoring dimensions and request specific, actionable feedback.
- Gemini provider checks for a configured API key and handles empty model responses.
- API errors no longer expose raw provider exception text.
- Added unit tests for adaptive difficulty and duplicate-question retry behavior.

## Validation
- Python compile check: passed.
- Backend test suite: 5 passed.
- Live PostgreSQL/Gemini integration: not run in this environment.

## Setup and security
- This archive intentionally excludes `.env`, `.git`, virtual environments, `node_modules`, and frontend build output.
- Create `backend/.env` from `backend/.env.example` and supply your own credentials locally.
- The previously uploaded archive contained `backend/.env`. If its credentials were real, rotate the Gemini API key, Gmail App Password, database password, and application secret before using the project again.

## Next phase
Refactor the frontend into maintainable pages/components, improve API state/error handling and responsive interview flows, then complete full-stack integration and deployment checks.
