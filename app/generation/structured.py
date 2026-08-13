"""Structured output validation for generation."""

from __future__ import annotations

from pydantic import ValidationError

from app.schemas.generation import GeneratedAnswer


def validate_generated_answer(data: dict) -> GeneratedAnswer:
    """Validate and parse a generated answer. Raises on invalid schema."""
    try:
        return GeneratedAnswer(**data)
    except ValidationError as exc:
        raise ValueError(f"Invalid generated answer schema: {exc}") from exc
