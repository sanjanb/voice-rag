"""Guardrail evaluation metrics."""

from __future__ import annotations


def unsupported_answer_rate(
    answers: list[dict], unanswerable_ids: set[str]
) -> float:
    """Fraction of unanswerable queries that got an unsupported answer."""
    if not unanswerable_ids:
        return 0.0
    unsupported = sum(
        1 for a in answers
        if a.get("id") in unanswerable_ids and a.get("decision") == "answer"
    )
    return unsupported / len(unanswerable_ids)


def false_abstention_rate(
    answers: list[dict], answerable_ids: set[str]
) -> float:
    """Fraction of answerable queries that were incorrectly abstained."""
    if not answerable_ids:
        return 0.0
    false_abstentions = sum(
        1 for a in answers
        if a.get("id") in answerable_ids and a.get("decision") == "abstain"
    )
    return false_abstentions / len(answerable_ids)
