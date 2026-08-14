"""Dense retrieval using vector embeddings."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from app.config.settings import settings
from app.qdrant_client import get_shared_client
from app.schemas.retrieval import RetrievedChunk

if TYPE_CHECKING:
    from qdrant_client import QdrantClient

    from app.embeddings.embedder import Embedder

logger = logging.getLogger(__name__)


class DenseRetriever:
    """Dense vector retrieval using Qdrant."""

    def __init__(self, embedder: Embedder, qdrant_client: QdrantClient | None = None):
        self.embedder = embedder
        self._client = qdrant_client or get_shared_client()
        self._collection = settings.qdrant_collection

    async def search(self, query: str, top_n: int = 20) -> list[RetrievedChunk]:
        """Embed query and search Qdrant for similar chunks."""
        # 1. Embed the query text
        query_embedding = await self.embedder.embed_text(query)

        # 2. Search Qdrant
        chunks: list[RetrievedChunk] = []
        try:
            if hasattr(self._client, "query_points"):
                response = self._client.query_points(
                    collection_name=self._collection,
                    query=query_embedding,
                    limit=top_n,
                )
                results = response.points
            elif hasattr(self._client, "search"):
                results = self._client.search(  # type: ignore[attr-defined]
                    collection_name=self._collection,
                    query_vector=query_embedding,
                    limit=top_n,
                )
            else:
                results = []

            # 3. Map results to RetrievedChunk objects
            for rank, result in enumerate(results, start=1):
                payload = getattr(result, "payload", None) or {}
                chunk = RetrievedChunk(
                    chunk_id=payload.get("chunk_id", str(result.id)),
                    document_id=payload.get("document_id", "unknown"),
                    content=payload.get("content", ""),
                    metadata=payload.get("metadata", {}),
                    dense_rank=rank,
                    dense_score=getattr(result, "score", 0.0),
                )
                chunks.append(chunk)
        except Exception as exc:
            logger.warning("Dense search failed: %s; returning empty chunks", exc)

        # 4. Return list
        logger.info("Dense search for '%s' returned %d results", query[:50], len(chunks))
        return chunks
