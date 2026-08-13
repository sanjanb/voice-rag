"""Structural chunking — splits by document headings."""

from __future__ import annotations

import hashlib
import re
from typing import Any

from app.ingestion.chunking.base import Chunk


def structural_chunk(
    text: str,
    document_id: str,
    metadata: dict[str, Any] | None = None,
) -> list[Chunk]:
    """Split text by markdown-style headings."""
    heading_pattern = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)
    headings = list(heading_pattern.finditer(text))

    if not headings:
        # No headings found — treat as single chunk
        chunk_id = hashlib.sha256(f"{document_id}:0".encode()).hexdigest()[:16]
        return [
            Chunk(
                chunk_id=chunk_id,
                document_id=document_id,
                content=text,
                chunk_strategy="structural",
                token_count=len(text.split()),
                char_count=len(text),
                metadata=metadata or {},
            )
        ]

    chunks: list[Chunk] = []

    for i, match in enumerate(headings):
        level = len(match.group(1))
        heading_text = match.group(2).strip()
        start_pos = match.end()
        end_pos = headings[i + 1].start() if i + 1 < len(headings) else len(text)
        content = text[start_pos:end_pos].strip()

        if not content:
            continue

        heading_path = [heading_text]
        chunk_id = hashlib.sha256(f"{document_id}:{i}:{content[:100]}".encode()).hexdigest()[:16]

        chunks.append(
            Chunk(
                chunk_id=chunk_id,
                document_id=document_id,
                content=content,
                heading_path=heading_path,
                chunk_strategy="structural",
                token_count=len(content.split()),
                char_count=len(content),
                metadata={**(metadata or {}), "level": level},
            )
        )

    return chunks
