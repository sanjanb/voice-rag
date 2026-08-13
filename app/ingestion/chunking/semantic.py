"""Semantic chunking — groups sentences by similarity."""

from __future__ import annotations

import hashlib
from typing import Any

from app.ingestion.chunking.base import Chunk


def semantic_chunk(
    text: str,
    document_id: str,
    similarity_threshold: float = 0.5,
    metadata: dict[str, Any] | None = None,
) -> list[Chunk]:
    """Split text at semantic boundaries.

    This is a placeholder implementation. Full semantic chunking requires
    an embedding model to compute sentence similarities.
    """
    # For now, fall back to paragraph-based chunking
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[Chunk] = []

    for i, para in enumerate(paragraphs):
        chunk_id = hashlib.sha256(f"{document_id}:sem:{i}:{para[:100]}".encode()).hexdigest()[:16]
        chunks.append(
            Chunk(
                chunk_id=chunk_id,
                document_id=document_id,
                content=para,
                chunk_strategy="semantic",
                token_count=len(para.split()),
                char_count=len(para),
                metadata=metadata or {},
            )
        )

    return chunks
