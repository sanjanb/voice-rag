"""Answer guard — checks that generated claims are supported."""

from __future__ import annotations

from typing import TYPE_CHECKING

from app.schemas.guardrails import GuardrailDecision

if TYPE_CHECKING:
    from app.schemas.generation import ClaimVerification, GeneratedAnswer


class AnswerGuard:
    """Verifies the generated answer is grounded in evidence."""

    def __init__(self, max_unsupported_claims: int = 0) -> None:
        self.max_unsupported_claims = max_unsupported_claims

    def evaluate(
        self,
        answer: GeneratedAnswer,
        verifications: list[ClaimVerification],
    ) -> GuardrailDecision:
        """Check if the answer passes the grounding check."""
        unsupported = [v for v in verifications if not v.supported]

        if len(unsupported) > self.max_unsupported_claims:
            return GuardrailDecision(
                decision="abstain",
                confidence=0.0,
                reason=(
                    f"{len(unsupported)} unsupported claims exceed limit "
                    f"{self.max_unsupported_claims}"
                ),
                stage="answer_guard",
            )

        return GuardrailDecision(
            decision="allow",
            confidence=answer.confidence,
            reason="All claims supported by evidence",
            stage="answer_guard",
        )
