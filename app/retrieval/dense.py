"""Dense retrieval using vector embeddings."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from app.schemas.retrieval import RetrievedChunk

logger = logging.getLogger(__name__)


class DenseRetriever:
    """Dense vector retrieval."""

    def __init__(self, vector_store: Any = None, embedder: Any = None) -> None:
        self.vector_store = vector_store
        self.embedder = embedder

    async def search(self, query: str, top_n: int = 20) -> list[RetrievedChunk]:
        """Search using dense vectors."""
        if self.vector_store is None:
            logger.warning("No vector store configured")
            return []

        # TODO: implement actual embedding + vector search
        logger.info("Dense search for '%s' (placeholder)", query[:50])
        return []
