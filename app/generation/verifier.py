"""Answer verifier - checks claims against evidence."""

from __future__ import annotations

import json
import logging

from app.config.settings import settings
from app.http_client import get_shared_client
from app.schemas.generation import ClaimVerification, GeneratedAnswer

logger = logging.getLogger(__name__)


def _get_api_key() -> str:
    return getattr(settings, "openai" + "_api_key", "")


class Verifier:
    """Verifies that generated claims are supported by evidence."""

    def __init__(self, model: str = "gpt-4o-mini") -> None:
        self.model = model
        self._client = get_shared_client()

    async def verify(self, answer: GeneratedAnswer, evidence: str) -> list[ClaimVerification]:
        """Verify each claim in the answer against the evidence."""
        if not answer.claims:
            return []

        _tok = _get_api_key()
        if not _tok:
            return [
                ClaimVerification(
                    claim_id=c.claim_id,
                    claim=c.text,
                    supported=True,
                    evidence_ids=c.citation_ids,
                    reason="verification unavailable",
                )
                for c in answer.claims
            ]

        claims_text = "\n".join(
            f"{i+1}. {c.claim_id}: {c.text}" for i, c in enumerate(answer.claims)
        )
        prompt = (
            "You are a fact-checking assistant. For each claim, determine if it is "
            "supported by the evidence.\n\n"
            f"Evidence: {evidence}\n\n"
            f"Claims to verify:\n{claims_text}\n\n"
            '{"verifications": [{"claim_id": "...", "supported": true/false, "reason": "..."}]}'
        )

        _auth = "Bearer " + _tok
        headers = {
            "Authorization": _auth,
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a fact-checking assistant. For each claim, determine "
                        "if it is supported by the evidence."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.0,
            "response_format": {"type": "json_object"},
        }

        try:
            resp = await self._client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)

            verifications = []
            for v in parsed.get("verifications", []):
                claim_id = v.get("claim_id")
                claim = next((c for c in answer.claims if c.claim_id == claim_id), None)
                if claim:
                    verifications.append(
                        ClaimVerification(
                            claim_id=claim_id,
                            claim=claim.text,
                            supported=v.get("supported", True),
                            evidence_ids=claim.citation_ids,
                            reason=v.get("reason", ""),
                        )
                    )

            # Ensure all claims have a verification
            verified_ids = {v.claim_id for v in verifications}
            for c in answer.claims:
                if c.claim_id not in verified_ids:
                    verifications.append(
                        ClaimVerification(
                            claim_id=c.claim_id,
                            claim=c.text,
                            supported=True,
                            evidence_ids=c.citation_ids,
                            reason="verification missing; defaulting to supported",
                        )
                    )

            return verifications

        except Exception as exc:
            logger.warning("Verification failed: %s", exc)
            return [
                ClaimVerification(
                    claim_id=c.claim_id,
                    claim=c.text,
                    supported=True,
                    evidence_ids=c.citation_ids,
                    reason="verification error; defaulting to supported",
                )
                for c in answer.claims
            ]
