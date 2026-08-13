"""Local STT provider (placeholder)."""

from __future__ import annotations

import time

from app.schemas.audio import TranscriptionResult


class LocalSTT:
    """Local whisper-family model for offline STT."""

    def __init__(self, model_name: str = "base") -> None:
        self.model_name = model_name

    async def transcribe(self, audio: bytes) -> TranscriptionResult:
        """Transcribe audio using the local model."""
        start = time.perf_counter()
        # TODO: implement local whisper inference
        latency_ms = (time.perf_counter() - start) * 1000
        return TranscriptionResult(
            text="",
            provider="local",
            model=self.model_name,
            latency_ms=latency_ms,
        )
