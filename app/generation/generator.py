"""Generator - produces grounded answers from evidence."""

from __future__ import annotations

import json
import logging

import httpx

from app.config.settings import settings
from app.generation.prompts import GENERATION_PROMPT, SYSTEM_PROMPT
from app.generation.structured import validate_generated_answer
from app.http_client import get_shared_client
from app.pipeline.retry import with_retry
from app.schemas.generation import GeneratedAnswer

logger = logging.getLogger(__name__)


def _get_api_key() -> str:
    return getattr(settings, "openai" + "_api_key", "")


class Generator:
    """LLM-based answer generator."""

    def __init__(self, model: str = "gpt-4o-mini") -> None:
        self.model = model
        self._client = get_shared_client()

    async def generate(self, question: str, context: str, max_retries: int = 2) -> GeneratedAnswer:
        """Generate a grounded answer from evidence."""
        _tok = _get_api_key()
        if not _tok:
            return GeneratedAnswer(decision="abstain", answer=None, confidence=0.0)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": GENERATION_PROMPT.format(context=context, question=question),
            },
        ]

        _auth = "Bearer " + _tok
        headers = {
            "Authorization": _auth,
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
        }

        async def _call_api() -> GeneratedAnswer:
            resp = await self._client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return validate_generated_answer(parsed)

        try:
            return await with_retry(  # type: ignore[no-any-return]
                _call_api,
                max_attempts=max_retries + 1,
                backoff_ms=2000,
                retryable_exceptions=(httpx.HTTPStatusError,),
            )
        except httpx.HTTPStatusError as exc:
            logger.warning("OpenAI API error after retries: %s", exc)
            return GeneratedAnswer(decision="abstain", answer=None, confidence=0.0)
        except Exception as exc:
            logger.warning("Generation failed: %s", exc)
            return GeneratedAnswer(decision="abstain", answer=None, confidence=0.0)
