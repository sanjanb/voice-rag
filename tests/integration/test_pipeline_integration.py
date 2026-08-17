"""Integration tests for pipeline orchestrator."""

from __future__ import annotations

from unittest.mock import patch

import pytest

from app.pipeline.orchestrator import PipelineOrchestrator
from app.schemas.audio import AudioRequest


@pytest.mark.asyncio
@patch("app.retrieval.sparse.SparseRetriever.search")
async def test_orchestrator_execution_flow(mock_search) -> None:
    mock_search.return_value = []
    """Verify orchestrator runs through pipeline stages."""
    orchestrator = PipelineOrchestrator()
    request = AudioRequest(audio_bytes=b"sample audio", request_id="req-123")
    response = await orchestrator.run(request)

    assert response.request_id == "req-123"
    assert response.decision in ("answer", "abstain")
    assert response.metrics.total_ms is not None
