"""Metadata extraction from documents."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any


def extract_metadata(file_path: str | Path, text: str) -> dict[str, Any]:
    """Extract metadata from a parsed document."""
    path = Path(file_path)
    return {
        "document_id": hashlib.sha256(str(path).encode()).hexdigest()[:16],
        "file_name": path.name,
        "file_path": str(path),
        "extension": path.suffix.lower(),
        "char_count": len(text),
        "word_count": len(text.split()),
    }
