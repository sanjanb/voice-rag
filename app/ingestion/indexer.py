"""Indexer — writes chunks to the vector store."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from app.ingestion.chunking.base import Chunk

logger = logging.getLogger(__name__)


class Indexer:
    """Indexes chunks into the vector database."""

    def __init__(self, vector_store: Any = None) -> None:
        self.vector_store = vector_store

    async def index_chunks(self, chunks: list[Chunk]) -> int:
        """Index a list of chunks. Returns the number indexed."""
        if self.vector_store is None:
            logger.warning("No vector store configured, skipping indexing")
            return 0

        # TODO: implement actual vector store indexing
        logger.info("Indexing %d chunks (placeholder)", len(chunks))
        return len(chunks)
