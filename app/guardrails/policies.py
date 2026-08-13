"""Guardrail configuration policies."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GuardrailPolicy(BaseModel):
    """Configurable guardrail thresholds."""

    retrieval_min_confidence: float | None = None
    retrieval_min_candidates: int = 1
    retrieval_max_conflict: float | None = None
    answer_max_unsupported_claims: int = 0


DEFAULT_POLICY = GuardrailPolicy()
