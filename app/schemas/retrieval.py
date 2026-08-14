"""Retrieval schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class RetrievedChunk(BaseModel):
    """A single retrieved chunk."""

    chunk_id: str
    document_id: str
    content: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    dense_rank: int | None = None
    dense_score: float | None = None
    sparse_rank: int | None = None
    sparse_score: float | None = None
    rrf_score: float | None = None
    rerank_score: float | None = None


class RetrievalResult(BaseModel):
    """Output from the retrieval engine."""

    query_id: str
    strategy: str
    candidates: list[RetrievedChunk]


class RetrievalDecision(BaseModel):
    """Output from the retrieval guard."""

    decision: str  # "allow" | "abstain"
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    evidence_ids: list[str] = Field(default_factory=list)
