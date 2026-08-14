"""Integration tests for API routes."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_integration() -> None:
    """Verify health check integration."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_transcribe_endpoint_integration() -> None:
    """Verify transcribe endpoint accepts audio upload."""
    files = {"audio": ("sample.wav", b"fake audio data", "audio/wav")}
    response = client.post("/transcribe", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] in ("answer", "abstain")
    assert "request_id" in data
