"""Deduplication of retrieved chunks."""

from __future__ import annotations

from app.schemas.retrieval import RetrievedChunk


def deduplicate_chunks(chunks: list[RetrievedChunk]) -> list[RetrievedChunk]:
    """Remove duplicate chunks by chunk_id, preserving order."""
    seen: set[str] = set()
    result: list[RetrievedChunk] = []
    for chunk in chunks:
        if chunk.chunk_id not in seen:
            seen.add(chunk.chunk_id)
            result.append(chunk)
    return result
