"""Retrieval guard — decides if evidence is sufficient."""

from __future__ import annotations

from app.schemas.retrieval import RetrievalDecision, RetrievedChunk


class RetrievalGuard:
    """Decides whether to proceed or abstain based on retrieval quality."""

    def __init__(
        self,
        min_confidence: float | None = None,
        min_candidates: int = 1,
    ) -> None:
        self.min_confidence = min_confidence
        self.min_candidates = min_candidates

    def evaluate(
        self,
        candidates: list[RetrievedChunk],
        dense_sparse_agreement: float | None = None,
    ) -> RetrievalDecision:
        """Evaluate retrieval quality and decide allow/abstain."""
        if len(candidates) < self.min_candidates:
            return RetrievalDecision(
                decision="abstain",
                confidence=0.0,
                reason=f"Too few candidates: {len(candidates)} < {self.min_candidates}",
                evidence_ids=[],
            )

        # Check score confidence
        if candidates and candidates[0].rrf_score is not None:
            if self.min_confidence is not None and candidates[0].rrf_score < self.min_confidence:
                return RetrievalDecision(
                    decision="abstain",
                    confidence=candidates[0].rrf_score,
                    reason=f"Top score {candidates[0].rrf_score:.4f} below threshold {self.min_confidence}",
                    evidence_ids=[c.chunk_id for c in candidates],
                )

        return RetrievalDecision(
            decision="allow",
            confidence=candidates[0].rrf_score if candidates else 0.0,
            reason="Sufficient evidence",
            evidence_ids=[c.chunk_id for c in candidates],
        )
