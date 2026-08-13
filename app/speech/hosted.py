"""Hosted STT provider (placeholder)."""

from __future__ import annotations

import time

from app.schemas.audio import TranscriptionResult


class HostedSTT:
    """Hosted speech-to-text provider."""

    def __init__(self, provider: str = "openai", model: str = "whisper-1") -> None:
        self.provider = provider
        self.model = model

    async def transcribe(self, audio: bytes) -> TranscriptionResult:
        """Transcribe audio using the hosted provider."""
        start = time.perf_counter()
        # TODO: implement actual API call
        latency_ms = (time.perf_counter() - start) * 1000
        return TranscriptionResult(
            text="",
            provider=self.provider,
            model=self.model,
            latency_ms=latency_ms,
        )
