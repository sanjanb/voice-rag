"""Dense retrieval using vector embeddings."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from qdrant_client import QdrantClient

from app.config.settings import settings
from app.embeddings.embedder import Embedder
from app.schemas.retrieval import RetrievedChunk

if TYPE_CHECKING:
    from qdrant_client.models import ScoredPoint

logger = logging.getLogger(__name__)


class DenseRetriever:
    """Dense vector retrieval using Qdrant."""

    def __init__(self, embedder: Embedder, qdrant_client: QdrantClient | None = None):
        self.embedder = embedder
        self._client = qdrant_client or QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
        self._collection = settings.qdrant_collection

    async def search(self, query: str, top_n: int = 20) -> list[RetrievedChunk]:
        """Embed query and search Qdrant for similar chunks."""
        # 1. Embed the query text
        query_embedding = await self.embedder.embed_text(query)

        # 2. Search Qdrant
        results: list[ScoredPoint] = self._client.search(
            collection_name=self._collection,
            query_vector=query_embedding,
            limit=top_n,
        )

        # 3. Map results to RetrievedChunk objects
        chunks: list[RetrievedChunk] = []
        for rank, result in enumerate(results, start=1):
            payload = result.payload or {}
            chunk = RetrievedChunk(
                chunk_id=payload.get("chunk_id", str(result.id)),
                document_id=payload.get("document_id", "unknown"),
                content=payload.get("content", ""),
                metadata=payload.get("metadata", {}),
                dense_rank=rank,
                dense_score=result.score,
            )
            chunks.append(chunk)

        # 4. Return list
        logger.info("Dense search for '%s' returned %d results", query[:50], len(chunks))
        return chunks