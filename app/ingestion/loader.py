"""Document loader — reads raw documents from disk."""

from __future__ import annotations

from pathlib import Path
from typing import Any

TEXT_EXTENSIONS = {
    ".txt",
    ".md",
    ".py",
    ".json",
    ".yaml",
    ".yml",
    ".csv",
}
MAX_FILE_SIZE = 1_048_576  # 1MB


def load_documents(data_dir: str | Path) -> list[dict[str, Any]]:
    """Load all documents from a directory with their text content."""
    data_path = Path(data_dir)
    if not data_path.exists():
        raise FileNotFoundError(f"Data directory not found: {data_path}")

    documents = []
    for file_path in data_path.rglob("*"):
        if not file_path.is_file():
            continue

        stat = file_path.stat()
        size_bytes = stat.st_size
        ext = file_path.suffix.lower()

        doc: dict[str, Any] = {
            "file_path": str(file_path),
            "file_name": file_path.name,
            "extension": ext,
            "size_bytes": size_bytes,
            "content": "",
            "skipped": False,
        }

        if size_bytes > MAX_FILE_SIZE:
            doc["skipped"] = True
            documents.append(doc)
            continue

        if ext not in TEXT_EXTENSIONS:
            doc["skipped"] = True
            documents.append(doc)
            continue

        try:
            content = file_path.read_text(encoding="utf-8", errors="replace")
            doc["content"] = content
        except Exception:
            doc["skipped"] = True

        documents.append(doc)

    return documents