"""Base chunking interface."""

from __future__ import annotations

from typing import Any, Protocol

from pydantic import BaseModel, Field


class Chunk(BaseModel):
    """A single document chunk."""

    chunk_id: str
    document_id: str
    parent_id: str | None = None
    content: str
    document_type: str = "unknown"
    heading_path: list[str] = Field(default_factory=list)
    page_number: int | None = None
    source_uri: str | None = None
    chunk_strategy: str = "unknown"
    chunk_version: str = "1.0"
    token_count: int = 0
    char_count: int = 0
    metadata: dict[str, Any] = Field(default_factory=dict)


class Chunker(Protocol):
    """Protocol for chunking strategies."""

    def chunk(
        self, text: str, document_id: str, metadata: dict[str, Any] | None = None
    ) -> list[Chunk]: ...
