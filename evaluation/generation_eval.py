"""Generation evaluation metrics."""

from __future__ import annotations


def citation_precision(answer_citations: list[str], valid_citations: list[str]) -> float:
    """Compute citation precision — fraction of cited chunks that are valid."""
    if not answer_citations:
        return 0.0
    valid_set = set(valid_citations)
    correct = sum(1 for c in answer_citations if c in valid_set)
    return correct / len(answer_citations)


def citation_recall(answer_citations: list[str], expected_citations: list[str]) -> float:
    """Compute citation recall — fraction of expected citations that appear."""
    if not expected_citations:
        return 0.0
    expected_set = set(expected_citations)
    found = sum(1 for c in expected_citations if c in set(answer_citations))
    return found / len(expected_set)
