"""Document parser — extracts text from various formats."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def parse_document(file_path: str | Path) -> dict[str, Any]:
    """Parse a document and extract its text content."""
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".txt" or extension == ".md":
        text = path.read_text(encoding="utf-8")
    elif extension == ".json":
        data = json.loads(path.read_text(encoding="utf-8"))
        text = json.dumps(data, indent=2)
    elif extension == ".jsonl":
        lines = path.read_text(encoding="utf-8").strip().split("\n")
        text = "\n".join(lines)
    else:
        # Fallback: try reading as text
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = f"[binary file: {path.name}]"

    return {
        "file_path": str(path),
        "text": text,
        "extension": extension,
    }
