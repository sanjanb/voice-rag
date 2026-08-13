"""Reciprocal Rank Fusion (RRF) for combining retrieval results."""

from __future__ import annotations

from app.schemas.retrieval import RetrievedChunk


def reciprocal_rank_fusion(
    dense_results: list[RetrievedChunk],
    sparse_results: list[RetrievedChunk],
    k: int = 60,
    top_n: int = 20,
) -> list[RetrievedChunk]:
    """Combine dense and sparse results using RRF.

    RRF(d) = Σ 1 / (k + rank(d))
    """
    scores: dict[str, float] = {}
    chunk_map: dict[str, RetrievedChunk] = {}

    # Score dense results
    for rank, chunk in enumerate(dense_results, start=1):
        scores[chunk.chunk_id] = scores.get(chunk.chunk_id, 0) + 1 / (k + rank)
        chunk_map[chunk.chunk_id] = chunk

    # Score sparse results
    for rank, chunk in enumerate(sparse_results, start=1):
        scores[chunk.chunk_id] = scores.get(chunk.chunk_id, 0) + 1 / (k + rank)
        chunk_map[chunk.chunk_id] = chunk

    # Sort by RRF score
    sorted_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)[:top_n]

    results: list[RetrievedChunk] = []
    for rank, chunk_id in enumerate(sorted_ids, start=1):
        chunk = chunk_map[chunk_id].model_copy()
        chunk.rrf_score = scores[chunk_id]
        results.append(chunk)

    return results
