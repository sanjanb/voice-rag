"""Generation schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class Claim(BaseModel):
    """A single claim extracted from the answer."""

    claim_id: str
    text: str
    citation_ids: list[str] = Field(default_factory=list)


class GeneratedAnswer(BaseModel):
    """Output from the generator."""

    decision: str  # "answer" | "abstain"
    answer: str | None = None
    citations: list[str] = Field(default_factory=list)
    claims: list[Claim] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0, default=0.0)


class ClaimVerification(BaseModel):
    """Result of verifying a single claim."""

    claim_id: str
    claim: str
    supported: bool
    evidence_ids: list[str] = Field(default_factory=list)
    reason: str
