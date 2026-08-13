"""Query difficulty scoring with retrieval-aware routing."""

from __future__ import annotations

from app.schemas.query import DifficultyClass, QueryAnalysis


def needs_reranking(analysis: QueryAnalysis, retrieval_confidence: float | None = None) -> bool:
    """Decide whether to use the deep path (reranker) based on query and retrieval signals."""
    # Hard queries always get reranking
    if analysis.difficulty_class == DifficultyClass.HARD:
        return True

    # Low retrieval confidence triggers reranking
    if retrieval_confidence is not None and retrieval_confidence < 0.5:
        return True

    # Multi-hop always reranks
    if analysis.multi_hop:
        return True

    return False
