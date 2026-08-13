"""Retrieval evaluation metrics."""

from __future__ import annotations

import math
from typing import Any


def recall_at_k(retrieved: list[str], relevant: list[str], k: int) -> float:
    """Compute Recall@K."""
    if not relevant:
        return 0.0
    retrieved_set = set(retrieved[:k])
    relevant_set = set(relevant)
    return len(retrieved_set & relevant_set) / len(relevant_set)


def mrr(retrieved: list[str], relevant: list[str]) -> float:
    """Compute Mean Reciprocal Rank."""
    for i, doc_id in enumerate(retrieved, start=1):
        if doc_id in relevant:
            return 1.0 / i
    return 0.0


def ndcg(retrieved: list[str], relevant: list[str], k: int = 10) -> float:
    """Compute nDCG@K."""
    def _dcg(scores: list[float]) -> float:
        return sum(s / math.log2(i + 2) for i, s in enumerate(scores))

    relevant_set = set(relevant)
    ideal_scores = sorted([1.0 if r in relevant_set else 0.0 for r in retrieved[:k]], reverse=True)
    actual_scores = [1.0 if r in relevant_set else 0.0 for r in retrieved[:k]]

    ideal_dcg = _dcg(ideal_scores)
    if ideal_dcg == 0:
        return 0.0
    return _dcg(actual_scores) / ideal_dcg
