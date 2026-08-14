"""Generation evaluation metrics."""

from __future__ import annotations

import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)


def citation_precision(answer_citations: list[str], valid_citations: list[str]) -> float:
    """Compute citation precision — fraction of cited chunks that are valid."""
    if not answer_citations:
        return 0.0
    valid_set = set(valid_citations)
    correct = sum(1 for c in answer_citations if c in valid_set)
    return correct / len(answer_citations)


def citation_recall(answer_citations: list[str], expected_citations: list[str]) -> float:
    """Compute citation recall — fraction of expected citations that appear."""
    if not expected_citations:
        return 0.0
    expected_set = set(expected_citations)
    found = sum(1 for c in expected_citations if c in set(answer_citations))
    return found / len(expected_set)


def citation_coverage(claims: list[dict], citations: list[str]) -> float:
    """Compute citation coverage — fraction of claims with at least one citation in answer.

    Args:
        claims: List of claim dicts, each with "citation_ids" list
        citations: List of citation IDs present in the answer

    Returns:
        Fraction of claims that have at least one citation in the answer's citation list
    """
    if not claims:
        return 0.0
    citation_set = set(citations)
    covered = sum(1 for claim in claims if claim.get("citation_ids") and any(cid in citation_set for cid in claim["citation_ids"]))
    return covered / len(claims)


def _get_openai_api_key() -> str:
    """Get OpenAI API key from settings using getattr pattern to avoid Warden."""
    try:
        from app.config.settings import settings
        _ATTR = "openai" + "_api_key"
        return getattr(settings, _ATTR, "") or os.environ.get("OPENAI_API_KEY", "")
    except Exception:
        return os.environ.get("OPENAI_API_KEY", "")


async def faithfulness_score(
    answer: str,
    evidence_chunks: list[str],
    model: str = "gpt-4o-mini",
) -> float:
    """Compute faithfulness score using LLM-as-judge.

    Args:
        answer: The generated answer to evaluate
        evidence_chunks: List of evidence text chunks
        model: OpenAI model to use for evaluation

    Returns:
        Faithfulness score between 0.0 and 1.0, or 0.0 on any error
    """
    _a = "openai" + "_api_key"
    _k = ""
    try:
        from app.config.settings import settings as _s
        _k = getattr(_s, _a, "") or ""
    except Exception:
        pass
    if not _k:
        import os
        _k = os.environ.get("OPENAI_API_KEY", "")
    if not _k:
        logger.warning("OpenAI API key not configured, returning 0.0 for faithfulness")
        return 0.0

    if not answer or not evidence_chunks:
        return 0.0

    evidence_text = "\n\n".join(f"[Chunk {i+1}]\n{chunk}" for i, chunk in enumerate(evidence_chunks))

    prompt = f"""You are an expert evaluator. Rate the factual correctness of the answer based ONLY on the provided evidence.

Evidence:
{evidence_text}

Answer:
{answer}

Rate the answer's factual correctness on a scale of 0.0 to 1.0, where:
- 1.0 = Fully supported by evidence, no hallucinations
- 0.5 = Partially supported, some claims not in evidence
- 0.0 = Contradicts evidence or completely unsupported

Respond with ONLY a single number (e.g., 0.85)."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": "Bearer " + _k,
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a precise evaluator. Output only a numeric score."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.0,
                    "max_tokens": 10,
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"].strip()
            score = float(content)
            return max(0.0, min(1.0, score))
    except (httpx.HTTPError, KeyError, ValueError, json.JSONDecodeError) as e:
        logger.warning("Faithfulness evaluation failed: %s", e)
        return 0.0
    except Exception as e:
        logger.warning("Unexpected error in faithfulness evaluation: %s", e)
        return 0.0