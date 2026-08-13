"""Retrieval engine — coordinates dense, sparse, and RRF."""

from __future__ import annotations

import logging

from app.retrieval.dense import DenseRetriever
from app.retrieval.sparse import SparseRetriever
from app.retrieval.rrf import reciprocal_rank_fusion
from app.schemas.retrieval import RetrievalResult, RetrievedChunk

logger = logging.getLogger(__name__)


class RetrievalEngine:
    """Coordinates hybrid retrieval with RRF fusion."""

    def __init__(
        self,
        dense: DenseRetriever | None = None,
        sparse: SparseRetriever | None = None,
    ) -> None:
        self.dense = dense or DenseRetriever()
        self.sparse = sparse or SparseRetriever()

    async def retrieve(
        self,
        query: str,
        dense_top_n: int = 20,
        sparse_top_n: int = 20,
        fused_top_n: int = 20,
    ) -> RetrievalResult:
        """Run hybrid retrieval and return fused results."""
        import uuid

        query_id = str(uuid.uuid4())

        dense_results = await self.dense.search(query, top_n=dense_top_n)
        sparse_results = await self.sparse.search(query, top_n=sparse_top_n)

        fused = reciprocal_rank_fusion(dense_results, sparse_results, top_n=fused_top_n)

        return RetrievalResult(
            query_id=query_id,
            strategy="hybrid_rrf",
            candidates=fused,
        )
