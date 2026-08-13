"""Generator — produces grounded answers from evidence."""

from __future__ import annotations

import logging
from typing import Any

from app.generation.prompts import GENERATION_PROMPT
from app.schemas.generation import GeneratedAnswer

logger = logging.getLogger(__name__)


class Generator:
    """LLM-based answer generator."""

    def __init__(self, client: Any = None, model: str = "gpt-4o-mini") -> None:
        self.client = client
        self.model = model

    async def generate(self, question: str, context: str, max_retries: int = 2) -> GeneratedAnswer:
        """Generate a grounded answer from evidence."""
        if self.client is None:
            logger.warning("No LLM client configured")
            return GeneratedAnswer(
                decision="abstain",
                answer=None,
                confidence=0.0,
            )

        prompt = GENERATION_PROMPT.format(context=context, question=question)

        # TODO: implement actual LLM call with structured output
        logger.info("Generating answer (%d chars prompt) (placeholder)", len(prompt))
        return GeneratedAnswer(
            decision="answer",
            answer="[placeholder answer]",
            citations=[],
            confidence=0.0,
        )
