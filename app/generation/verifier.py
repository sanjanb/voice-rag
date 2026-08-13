"""Answer verifier — checks claims against evidence."""

from __future__ import annotations

import logging
from typing import Any

from app.schemas.generation import ClaimVerification, GeneratedAnswer

logger = logging.getLogger(__name__)


class Verifier:
    """Verifies that generated claims are supported by evidence."""

    def __init__(self, client: Any = None) -> None:
        self.client = client

    async def verify(
        self, answer: GeneratedAnswer, evidence: str
    ) -> list[ClaimVerification]:
        """Verify each claim in the answer against the evidence."""
        verifications: list[ClaimVerification] = []

        for claim in answer.claims:
            # TODO: implement actual LLM-based verification
            verifications.append(ClaimVerification(
                claim_id=claim.claim_id,
                claim=claim.text,
                supported=True,  # placeholder
                evidence_ids=claim.citation_ids,
                reason="placeholder verification",
            ))

        return verifications
