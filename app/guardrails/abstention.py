"""Abstention response generation."""

from __future__ import annotations

from app.schemas.generation import GeneratedAnswer


def generate_abstention_response(reason: str | None = None) -> GeneratedAnswer:
    """Generate a standardized abstention response."""
    message = "I don't have enough information in the provided sources to answer that reliably."
    if reason:
        message += f" ({reason})"

    return GeneratedAnswer(
        decision="abstain",
        answer=message,
        citations=[],
        claims=[],
        confidence=0.0,
    )
