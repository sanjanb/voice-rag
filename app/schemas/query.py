"""Query analysis schemas."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class DifficultyClass(str, Enum):
    """Query difficulty classification."""

    EASY = "easy"
    HARD = "hard"


class QueryAnalysis(BaseModel):
    """Result of query processing."""

    normalized_query: str
    original_query: str
    intent: str | None = None
    difficulty_score: float = Field(ge=0.0, le=1.0)
    difficulty_class: DifficultyClass
    multi_hop: bool = False
    ambiguity: float = Field(ge=0.0, le=1.0, default=0.0)
