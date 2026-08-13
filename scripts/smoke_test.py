"""Smoke test — quick sanity check of the pipeline."""

from __future__ import annotations

import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main() -> None:
    """Run smoke tests."""
    logger.info("Running smoke test...")

    # Test 1: import check
    try:
        from app.config.settings import settings
        logger.info("✓ Settings loaded: model=%s", settings.llm_model)
    except Exception as exc:
        logger.error("✗ Settings failed: %s", exc)
        return

    # Test 2: schema validation
    try:
        from app.schemas.audio import TranscriptionResult
        result = TranscriptionResult(
            text="hello world",
            provider="test",
            model="test",
            latency_ms=10.0,
        )
        logger.info("✓ Schema validation passed")
    except Exception as exc:
        logger.error("✗ Schema validation failed: %s", exc)
        return

    # Test 3: query classification
    try:
        from app.query.classify import classify_difficulty
        analysis = classify_difficulty("How do I compare X and Y?")
        logger.info("✓ Query classification: score=%.2f class=%s", analysis.difficulty_score, analysis.difficulty_class)
    except Exception as exc:
        logger.error("✗ Query classification failed: %s", exc)
        return

    logger.info("All smoke tests passed ✓")


if __name__ == "__main__":
    main()
