"""Context builder — assembles evidence for the generator."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.retrieval import RetrievedChunk


class ContextBuilder:
    """Builds the context window for the LLM from retrieved chunks."""

    def __init__(self, max_tokens: int = 3000) -> None:
        self.max_tokens = max_tokens

    def build(self, chunks: list[RetrievedChunk]) -> str:
        """Build a context string from retrieved chunks, respecting token budget."""
        context_parts: list[str] = []
        token_count = 0

        for chunk in chunks:
            chunk_tokens = chunk.metadata.get("token_count", len(chunk.content.split()))
            if token_count + chunk_tokens > self.max_tokens:
                break
            context_parts.append(f"[{chunk.chunk_id}] {chunk.content}")
            token_count += chunk_tokens

        return "\n\n".join(context_parts)
