"""Sparse retrieval using BM25."""

from __future__ import annotations

import logging
from typing import Any

from app.schemas.retrieval import RetrievedChunk

logger = logging.getLogger(__name__)


class SparseRetriever:
    """BM25 sparse retrieval."""

    def __init__(self, corpus: list[dict[str, Any]] | None = None) -> None:
        self.corpus = corpus or []

    async def search(self, query: str, top_n: int = 20) -> list[RetrievedChunk]:
        """Search using BM25."""
        if not self.corpus:
            logger.warning("No corpus configured for sparse retrieval")
            return []

        # TODO: implement actual BM25 search
        logger.info("Sparse search for '%s' (placeholder)", query[:50])
        return []
