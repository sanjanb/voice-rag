"""Context compression — reduces context size when needed."""

from __future__ import annotations

from app.schemas.retrieval import RetrievedChunk


def compress_context(chunks: list[RetrievedChunk], max_chunks: int = 5) -> list[RetrievedChunk]:
    """Keep only the top N chunks by score."""
    sorted_chunks = sorted(
        chunks,
        key=lambda c: c.rerank_score or c.rrf_score or 0,
        reverse=True,
    )
    return sorted_chunks[:max_chunks]
