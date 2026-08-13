"""Document loader — reads raw documents from disk."""

from __future__ import annotations

from pathlib import Path
from typing import Any


def load_documents(data_dir: str | Path) -> list[dict[str, Any]]:
    """Load all documents from a directory."""
    data_path = Path(data_dir)
    if not data_path.exists():
        raise FileNotFoundError(f"Data directory not found: {data_path}")

    documents = []
    for file_path in data_path.rglob("*"):
        if file_path.is_file():
            documents.append(
                {
                    "file_path": str(file_path),
                    "file_name": file_path.name,
                    "extension": file_path.suffix.lower(),
                    "size_bytes": file_path.stat().st_size,
                }
            )
    return documents
