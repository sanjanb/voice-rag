"""Parent-child chunking — small searchable children with larger parent context."""

from __future__ import annotations

import hashlib

from app.ingestion.chunking.base import Chunk


def parent_child_chunk(
    text: str,
    document_id: str,
    child_size: int = 200,
    parent_size: int = 800,
    metadata: dict | None = None,
) -> list[Chunk]:
    """Create parent-child chunks.

    Children are small searchable units. Parents provide larger context.
    Search returns children but can expand to parent for context.
    """
    words = text.split()
    chunks: list[Chunk] = []
    parent_idx = 0

    # Create parents
    parents: list[tuple[int, str]] = []
    for start in range(0, len(words), parent_size):
        end = min(start + parent_size, len(words))
        parent_content = " ".join(words[start:end])
        parents.append((parent_idx, parent_content))
        parent_idx += 1

    # Create children within each parent
    for p_idx, parent_content in parents:
        parent_id = hashlib.sha256(f"{document_id}:parent:{p_idx}".encode()).hexdigest()[:16]
        child_words = parent_content.split()

        for c_start in range(0, len(child_words), child_size):
            c_end = min(c_start + child_size, len(child_words))
            child_content = " ".join(child_words[c_start:c_end])
            child_id = hashlib.sha256(
                f"{document_id}:child:{p_idx}:{c_start}".encode()
            ).hexdigest()[:16]

            chunks.append(Chunk(
                chunk_id=child_id,
                document_id=document_id,
                parent_id=parent_id,
                content=child_content,
                chunk_strategy="parent_child",
                token_count=len(child_words[c_start:c_end]),
                char_count=len(child_content),
                metadata=metadata or {},
            ))

    return chunks
