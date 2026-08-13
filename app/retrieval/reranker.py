"""Reranker interface and placeholder implementation."""

from __future__ import annotations

import logging
from typing import Any, Protocol

from app.schemas.retrieval import RetrievedChunk

logger = logging.getLogger(__name__)


class Reranker(Protocol):
    """Protocol for reranking providers."""

    async def rerank(
        self, query: str, candidates: list[RetrievedChunk], top_k: int
    ) -> list[RetrievedChunk]: ...


class CrossEncoderReranker:
    """Cross-encoder reranker (placeholder)."""

    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2") -> None:
        self.model_name = model_name

    async def rerank(
        self, query: str, candidates: list[RetrievedChunk], top_k: int = 5
    ) -> list[RetrievedChunk]:
        """Rerank candidates using a cross-encoder model."""
        # TODO: implement actual cross-encoder reranking
        logger.info("Reranking %d candidates with %s (placeholder)", len(candidates), self.model_name)
        return candidates[:top_k]
