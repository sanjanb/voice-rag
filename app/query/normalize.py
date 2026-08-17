"""Query normalization."""

from __future__ import annotations

import re


def normalize_query(text: str) -> str:
    """Normalize a spoken query: trim, collapse whitespace, remove filler words."""
    text = text.strip()
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text)
    # Remove common filler words (conservative — do not rewrite intent)
    fillers = re.compile(r"\b(um|uh|you know|basically)\b", re.IGNORECASE)
    text = fillers.sub("", text)
    return re.sub(r"\s+", " ", text).strip()
