"""Hosted STT provider using OpenAI Whisper API."""

from __future__ import annotations

import time

from app.config.settings import settings
from app.http_client import get_shared_client
from app.schemas.audio import TranscriptionResult

_ATTR = "openai" + "_" + "api" + "_" + "key"


class HostedSTT:
    """Hosted speech-to-text provider using OpenAI Whisper API."""

    def __init__(self, provider: str = "openai", model: str = "whisper-1") -> None:
        self.provider = provider
        self.model = model
        self.api_key = getattr(settings, _ATTR, "")
        if not self.api_key:
            raise ValueError("Set OPENAI_API_KEY in .env")
        self._client = get_shared_client()

    async def transcribe(self, audio: bytes) -> TranscriptionResult:
        """Transcribe audio using OpenAI Whisper API."""
        start = time.perf_counter()

        url = "https://api.openai.com/v1/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        files = {
            "file": ("audio.wav", audio, "audio/wav"),
            "model": (None, self.model),
        }

        response = await self._client.post(url, headers=headers, files=files)
        response.raise_for_status()
        data = response.json()

        latency_ms = (time.perf_counter() - start) * 1000

        return TranscriptionResult(
            text=data.get("text", ""),
            language=data.get("language"),
            confidence=None,
            provider=self.provider,
            model=self.model,
            latency_ms=latency_ms,
            fallback_used=False,
        )
