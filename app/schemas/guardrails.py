"""Guardrail schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GuardrailDecision(BaseModel):
    """A guardrail gate decision."""

    decision: str  # "allow" | "abstain"
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    stage: str  # "retrieval_guard" | "answer_guard"
