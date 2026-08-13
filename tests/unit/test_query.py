"""Unit tests for query difficulty classification and routing."""

from __future__ import annotations

from app.query.classify import classify_difficulty
from app.query.difficulty import needs_reranking
from app.schemas.query import DifficultyClass


def test_classify_easy_query() -> None:
    """Test standard simple query classification."""
    analysis = classify_difficulty("What is RAG?")
    assert analysis.difficulty_class == DifficultyClass.EASY
    assert analysis.multi_hop is False


def test_classify_hard_multi_question_query() -> None:
    """Test multi-question comparison query classification."""
    analysis = classify_difficulty(
        "What is RAG? And how does vector search work? Compare versus BM25."
    )
    assert analysis.difficulty_class == DifficultyClass.HARD
    assert analysis.multi_hop is True


def test_needs_reranking_for_hard_query() -> None:
    """Test hard queries always require reranking."""
    analysis = classify_difficulty("Compare vector DB vs relational DB and how to scale?")
    assert needs_reranking(analysis) is True


def test_needs_reranking_for_low_confidence() -> None:
    """Test low retrieval confidence triggers reranking."""
    analysis = classify_difficulty("What is RAG?")
    assert needs_reranking(analysis, retrieval_confidence=0.3) is True
    assert needs_reranking(analysis, retrieval_confidence=0.8) is False
