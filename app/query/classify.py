"""Query difficulty classification."""

from __future__ import annotations

import re

from app.schemas.query import DifficultyClass, QueryAnalysis


def classify_difficulty(query: str) -> QueryAnalysis:
    """Classify query difficulty using deterministic signals."""
    score = 0.0
    multi_hop = False
    ambiguity = 0.0

    # Linguistic complexity signals
    if "?" in query:
        question_count = query.count("?")
        if question_count > 1:
            score += 0.2
            multi_hop = True

    # Comparison indicators
    comparison_words = re.compile(
        r"\b(compare|versus|vs\.?|difference|better|worse)\b", re.IGNORECASE
    )
    if comparison_words.search(query):
        score += 0.15

    # Conditional language
    conditional_words = re.compile(r"\b(if|when|unless|provided|assuming)\b", re.IGNORECASE)
    if conditional_words.search(query):
        score += 0.1

    # Multi-hop indicators
    multi_hop_words = re.compile(
        r"\b(and how|along with|in addition|as well as|combined with)\b",
        re.IGNORECASE,
    )
    if multi_hop_words.search(query):
        score += 0.15
        multi_hop = True

    # Query length (longer queries tend to be harder)
    word_count = len(query.split())
    if word_count > 15:
        score += 0.1

    # Entity ambiguity (very short, vague queries)
    if word_count < 5:
        ambiguity = 0.3

    score = min(score, 1.0)
    difficulty_class = DifficultyClass.HARD if score >= 0.4 else DifficultyClass.EASY

    return QueryAnalysis(
        normalized_query=query,
        original_query=query,
        difficulty_score=score,
        difficulty_class=difficulty_class,
        multi_hop=multi_hop,
        ambiguity=ambiguity,
    )
