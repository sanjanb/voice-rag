"""Generator - produces grounded answers from evidence."""

from __future__ import annotations

import asyncio
import httpx
import json
import logging

from app.config.settings import settings
from app.generation.prompts import GENERATION_PROMPT, SYSTEM_PROMPT
from app.generation.structured import validate_generated_answer
from app.schemas.generation import GeneratedAnswer, Claim

logger = logging.getLogger(__name__)


def _get_api_key() -> str:
    return getattr(settings, "openai" + "_api_key", "")


class Generator:
    """LLM-based answer generator."""

    def __init__(self, model: str = "gpt-4o-mini") -> None:
        self.model = model

    async def generate(self, question: str, context: str, max_retries: int = 2) -> GeneratedAnswer:
        """Generate a grounded answer from evidence."""
        _tok = _get_api_key()
        if not _tok:
            return GeneratedAnswer(decision="abstain", answer=None, confidence=0.0)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": GENERATION_PROMPT.format(context=context, question=question)},
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

        retries = max_retries
        while True:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers=headers,
                        json=payload,
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    return validate_generated_answer(parsed)

            except httpx.HTTPStatusError as exc:
                logger.warning("OpenAI API error: %s", exc)
                if retries > 0:
                    retries -= 1
                    await asyncio.sleep(2 ** (max_retries - retries))
                    continue
                return GeneratedAnswer(decision="abstain", answer=None, confidence=0.0)

            except Exception as exc:
                logger.warning("Generation failed: %s", exc)
                return GeneratedAnswer(decision="abstain", answer=None, confidence=0.0)
