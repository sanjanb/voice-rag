"""Unit tests for retrieval and answer guardrails."""

from __future__ import annotations

from app.guardrails.answer_guard import AnswerGuard
from app.guardrails.retrieval_guard import RetrievalGuard
from app.schemas.generation import ClaimVerification, GeneratedAnswer
from app.schemas.retrieval import RetrievedChunk


def test_retrieval_guard_too_few_candidates() -> None:
    """Test retrieval guard abstains when candidates are below minimum."""
    guard = RetrievalGuard(min_candidates=2)
    decision = guard.evaluate([])
    assert decision.decision == "abstain"
    assert decision.confidence == 0.0


def test_retrieval_guard_sufficient_candidates() -> None:
    """Test retrieval guard allows when criteria met."""
    guard = RetrievalGuard(min_candidates=1)
    chunk = RetrievedChunk(chunk_id="c1", document_id="d1", content="test", rrf_score=0.8)
    decision = guard.evaluate([chunk])
    assert decision.decision == "allow"
    assert decision.confidence == 0.8


def test_answer_guard_unsupported_claims() -> None:
    """Test answer guard abstains when unsupported claims exceed limit."""
    guard = AnswerGuard(max_unsupported_claims=0)
    answer = GeneratedAnswer(decision="answer", answer="test", confidence=0.9)
    verifications = [
        ClaimVerification(claim_id="1", claim="test claim", supported=False, reason="no evidence")
    ]
    decision = guard.evaluate(answer, verifications)
    assert decision.decision == "abstain"
