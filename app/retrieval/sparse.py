"""Sparse retrieval using BM25."""

from __future__ import annotations

import logging
from typing import Any

from rank_bm25 import BM25Okapi

from app.schemas.retrieval import RetrievedChunk

logger = logging.getLogger(__name__)


class SparseRetriever:
    """BM25 sparse retrieval."""

    def __init__(self, corpus: list[dict[str, Any]] | None = None) -> None:
        self.corpus: list[dict[str, Any]] = corpus or []
        self._bm25: BM25Okapi | None = None
        self._tokenized_corpus: list[list[str]] = []
        if self.corpus:
            self.build_index(self.corpus)

    def _tokenize(self, text: str) -> list[str]:
        """Simple tokenization: lowercase + split on whitespace."""
        return text.lower().split()

    def build_index(self, chunks: list[dict[str, Any]]) -> None:
        """Tokenize texts and build BM25Okapi index."""
        self.corpus = chunks
        self._tokenized_corpus = [self._tokenize(chunk.get("content") or chunk.get("text", "")) for chunk in chunks]
        self._bm25 = BM25Okapi(self._tokenized_corpus)
        logger.info("Built BM25 index with %d documents", len(chunks))

    async def search(self, query: str, top_n: int = 20) -> list[RetrievedChunk]:
        """Search using BM25."""
        if not self.corpus or self._bm25 is None:
            logger.warning("No corpus configured for sparse retrieval")
            return []

        tokenized_query = self._tokenize(query)
        scores = self._bm25.get_scores(tokenized_query)
        top_indices = self._bm25.get_top_n(tokenized_query, list(range(len(self.corpus))), n=top_n)

        results: list[RetrievedChunk] = []
        for rank, idx in enumerate(top_indices, start=1):
            chunk = self.corpus[idx]
            results.append(
                RetrievedChunk(
                    chunk_id=chunk.get("chunk_id", f"chunk_{idx}"),
                    document_id=chunk.get("document_id", "unknown"),
                    content=chunk.get("content") or chunk.get("text", ""),
                    metadata=chunk.get("metadata", {}),
                    sparse_rank=rank,
                    sparse_score=float(scores[idx]),
                )
            )

        logger.info("Sparse search for '%s' returned %d results", query[:50], len(results))
        return results