"""Metadata filters for retrieval."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class RetrievalFilters:
    """Filters to apply during retrieval."""

    document_id: str | None = None
    document_type: str | None = None
    version: str | None = None
    language: str | None = None
    source: str | None = None
    tenant: str | None = None
    date_from: str | None = None
    date_to: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to filter dict, excluding None values."""
        return {k: v for k, v in self.__dict__.items() if v is not None}
