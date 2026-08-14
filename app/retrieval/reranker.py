"""Reranker interface and cross-encoder implementation."""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from app.schemas.retrieval import RetrievedChunk

from app.config.settings import settings

logger = logging.getLogger(__name__)


class Reranker(Protocol):
    """Protocol for reranking providers."""

    async def rerank(
        self, query: str, candidates: list[RetrievedChunk], top_k: int
    ) -> list[RetrievedChunk]: ...


class CrossEncoderReranker:
    """Cross-encoder reranker using sentence-transformers."""

    def __init__(self, model_name: str | None = None) -> None:
        self.model_name = model_name or settings.reranker_model
        self._model: object | None = None

    def _load_model(self) -> object:
        """Lazy-load the cross-encoder model."""
        if self._model is None:
            from sentence_transformers import CrossEncoder

            self._model = CrossEncoder(self.model_name)
        return self._model

    def _predict_sync(self, pairs: list[tuple[str, str]]) -> list[float]:
        """Synchronous prediction for use in executor."""
        model = self._load_model()
        return model.predict(pairs).tolist()

    async def rerank(
        self, query: str, candidates: list[RetrievedChunk], top_k: int = 5
    ) -> list[RetrievedChunk]:
        """Rerank candidates using a cross-encoder model."""
        if not candidates:
            return []

        try:
            pairs = [(query, chunk.content) for chunk in candidates]

            loop = asyncio.get_event_loop()
            scores = await loop.run_in_executor(None, self._predict_sync, pairs)

            for chunk, score in zip(candidates, scores):
                chunk.rerank_score = float(score)

            candidates.sort(key=lambda c: c.rerank_score or 0.0, reverse=True)

            logger.info(
                "Reranked %d candidates with %s, returning top %d",
                len(candidates),
                self.model_name,
                top_k,
            )
            return candidates[:top_k]

        except Exception as e:
            logger.warning(
                "Cross-encoder reranking failed (%s), falling back to RRF sort: %s",
                type(e).__name__,
                e,
            )
            candidates.sort(key=lambda c: c.rrf_score or 0.0, reverse=True)
            return candidates[:top_k]