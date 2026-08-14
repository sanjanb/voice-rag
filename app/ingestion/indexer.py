"""Indexer — writes chunks to the vector store."""

from __future__ import annotations

import logging
import uuid
from typing import TYPE_CHECKING

from qdrant_client.models import Distance, PointStruct, VectorParams

from app.config.settings import settings
from app.qdrant_client import get_shared_client

if TYPE_CHECKING:
    from qdrant_client import QdrantClient

    from app.embeddings.embedder import Embedder
    from app.ingestion.chunking.base import Chunk

logger = logging.getLogger(__name__)


class Indexer:
    """Indexes chunks into the vector database."""

    def __init__(self, embedder: Embedder, qdrant_client: QdrantClient | None = None) -> None:
        self.embedder = embedder
        self._client = qdrant_client or get_shared_client()
        self._collection = settings.qdrant_collection

    async def ensure_collection(self) -> None:
        """Create collection if it doesn't exist."""
        collections = self._client.get_collections().collections
        names = [c.name for c in collections]
        if self._collection not in names:
            self._client.create_collection(
                collection_name=self._collection,
                vectors_config=VectorParams(
                    size=settings.embedding_dimensions, distance=Distance.COSINE
                ),
            )
            logger.info("Created Qdrant collection '%s'", self._collection)

    async def index_chunks(self, chunks: list[Chunk]) -> int:
        """Embed chunks and upsert into Qdrant."""
        if not chunks:
            return 0

        await self.ensure_collection()

        texts = [chunk.content for chunk in chunks]
        embeddings = await self.embedder.embed_batch(texts)

        points: list[PointStruct] = []
        for chunk, embedding in zip(chunks, embeddings, strict=True):
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, chunk.chunk_id))
            payload = {
                "chunk_id": chunk.chunk_id,
                "document_id": chunk.document_id,
                "content": chunk.content,
                "metadata": chunk.metadata,
            }
            points.append(PointStruct(id=point_id, vector=embedding, payload=payload))

        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i : i + batch_size]
            self._client.upsert(collection_name=self._collection, points=batch)

        logger.info("Indexed %d chunks into Qdrant collection '%s'", len(chunks), self._collection)
        return len(chunks)