"""Adaptive chunking strategy selector."""

from __future__ import annotations

import re
from typing import Any

from app.ingestion.chunking.base import Chunk, Chunker
from app.ingestion.chunking.fixed import fixed_chunk
from app.ingestion.chunking.structural import structural_chunk
from app.ingestion.chunking.semantic import semantic_chunk
from app.ingestion.chunking.parent_child import parent_child_chunk


def _compute_heading_density(text: str) -> float:
    """Compute the ratio of heading lines to total lines."""
    lines = text.split("\n")
    if not lines:
        return 0.0
    heading_lines = sum(1 for line in lines if re.match(r"^#{1,6}\s", line))
    return heading_lines / len(lines)


def _compute_structure_quality(text: str) -> float:
    """Heuristic for how structured a document is."""
    heading_density = _compute_heading_density(text)
    has_lists = bool(re.search(r"^[\-\*\d]+[\.\)]\s", text, re.MULTILINE))
    has_code_blocks = "```" in text
    score = heading_density * 0.6
    if has_lists:
        score += 0.2
    if has_code_blocks:
        score += 0.2
    return min(score, 1.0)


def select_strategy(text: str, document_type: str = "unknown") -> str:
    """Select the best chunking strategy based on document signals."""
    heading_density = _compute_heading_density(text)
    structure_quality = _compute_structure_quality(text)

    if heading_density > 0.05:
        return "structural"
    if structure_quality < 0.3:
        return "semantic"
    if len(text.split()) > 2000:
        return "parent_child"
    return "fixed"


def adaptive_chunk(
    text: str,
    document_id: str,
    document_type: str = "unknown",
    metadata: dict | None = None,
) -> list[Chunk]:
    """Chunk a document using the adaptive strategy selector."""
    strategy = select_strategy(text, document_type)
    meta = {**(metadata or {}), "selected_strategy": strategy}

    if strategy == "structural":
        return structural_chunk(text, document_id, meta)
    elif strategy == "semantic":
        return semantic_chunk(text, document_id, metadata=meta)
    elif strategy == "parent_child":
        return parent_child_chunk(text, document_id, metadata=meta)
    else:
        return fixed_chunk(text, document_id, metadata=meta)
