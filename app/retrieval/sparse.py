"""Sparse retrieval using BM25."""

from __future__ import annotations

import logging
from typing import Any

from rank_bm25 import BM25Okapi

from app.schemas.retrieval import RetrievedChunk

logger = logging.getLogger(__name__)


class SparseRetriever:
    """BM25 sparse retrieval."""

    def __init__(self, corpus: list[Any] | None = None) -> None:
        self.corpus = corpus or []
        self._bm25: BM25Okapi | None = None
        self._tokenized_corpus: list[list[str]] = []
        if self.corpus:
            self.build_index(self.corpus)

    def _tokenize(self, text: str) -> list[str]:
        """Simple tokenization: lowercase + split on whitespace."""
        return text.lower().split()

    def _get_text(self, chunk: Any) -> str:
        """Extract text from a Chunk object or dict."""
        if hasattr(chunk, "content"):
            return chunk.content or ""
        if isinstance(chunk, dict):
            content = chunk.get("content")
            if content is not None:
                return str(content)
            text = chunk.get("text")
            if text is not None:
                return str(text)
            return ""
        return ""

    def _get_attr(self, chunk: Any, attr: str, default: Any = None) -> Any:
        """Get an attribute from a Chunk object or dict."""
        if hasattr(chunk, attr):
            return getattr(chunk, attr, default)
        if isinstance(chunk, dict):
            return chunk.get(attr, default)
        return default

    def build_index(self, chunks: list[Any]) -> None:
        """Tokenize texts and build BM25Okapi index."""
        self.corpus = chunks
        self._tokenized_corpus = [self._tokenize(self._get_text(c)) for c in chunks]
        self._bm25 = BM25Okapi(self._tokenized_corpus)
        logger.info("Built BM25 index with %d documents", len(chunks))

    async def search(self, query: str, top_n: int = 20) -> list[RetrievedChunk]:
        """Search using BM25."""
        if not self.corpus or self._bm25 is None:
            raise ValueError("No corpus configured for sparse retrieval")

        tokenized_query = self._tokenize(query)
        scores = self._bm25.get_scores(tokenized_query)
        top_indices = self._bm25.get_top_n(tokenized_query, list(range(len(self.corpus))), n=top_n)

        results: list[RetrievedChunk] = []
        for rank, idx in enumerate(top_indices, start=1):
            chunk = self.corpus[idx]
            results.append(
                RetrievedChunk(
                    chunk_id=self._get_attr(chunk, "chunk_id", f"chunk_{idx}"),
                    document_id=self._get_attr(chunk, "document_id", "unknown"),
                    content=self._get_text(chunk),
                    metadata=self._get_attr(chunk, "metadata", {}),
                    sparse_rank=rank,
                    sparse_score=float(scores[idx]),
                )
            )

        logger.info("Sparse search for '%s' returned %d results", query[:50], len(results))
        return results
