"""Final response schemas."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class LatencyMetrics(BaseModel):
    """Latency breakdown for a request."""

    stt_ms: float | None = None
    query_ms: float | None = None
    embedding_ms: float | None = None
    dense_retrieval_ms: float | None = None
    sparse_retrieval_ms: float | None = None
    rrf_ms: float | None = None
    rerank_ms: float | None = None
    context_build_ms: float | None = None
    generation_ms: float | None = None
    verification_ms: float | None = None
    total_ms: float | None = None


class FinalResponse(BaseModel):
    """The final response returned to the client."""

    request_id: str
    schema_version: str = "1.0"
    decision: str  # "answer" | "abstain" | "error"
    answer: str | None = None
    citations: list[dict[str, Any]] = Field(default_factory=list)
    transcript: str | None = None
    metrics: LatencyMetrics = Field(default_factory=LatencyMetrics)
    errors: list[dict[str, Any]] = Field(default_factory=list)
