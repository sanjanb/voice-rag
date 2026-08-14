"""Integration tests for pipeline orchestrator."""

from __future__ import annotations

import pytest

from app.pipeline.orchestrator import PipelineOrchestrator
from app.schemas.audio import AudioRequest


@pytest.mark.asyncio
async def test_orchestrator_execution_flow() -> None:
    """Verify orchestrator runs through pipeline stages."""
    orchestrator = PipelineOrchestrator()
    request = AudioRequest(audio_bytes=b"sample audio", request_id="req-123")
    response = await orchestrator.run(request)

    assert response.request_id == "req-123"
    assert response.decision in ("answer", "abstain")
    assert response.metrics.total_ms is not None
