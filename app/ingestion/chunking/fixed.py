"""Fixed-size token chunking strategy."""

from __future__ import annotations

import hashlib

from app.ingestion.chunking.base import Chunk


def fixed_chunk(
    text: str,
    document_id: str,
    chunk_size: int = 600,
    overlap: int = 90,
    metadata: dict | None = None,
) -> list[Chunk]:
    """Split text into fixed-size chunks with overlap."""
    words = text.split()
    chunks: list[Chunk] = []
    start = 0
    idx = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk_words = words[start:end]
        content = " ".join(chunk_words)

        chunk_id = hashlib.sha256(f"{document_id}:{idx}:{content[:100]}".encode()).hexdigest()[:16]

        chunks.append(Chunk(
            chunk_id=chunk_id,
            document_id=document_id,
            content=content,
            chunk_strategy="fixed",
            token_count=len(chunk_words),
            char_count=len(content),
            metadata=metadata or {},
        ))

        start += chunk_size - overlap
        idx += 1

    return chunks
