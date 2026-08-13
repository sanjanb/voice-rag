"""Audio request schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AudioRequest(BaseModel):
    """Incoming audio request."""

    request_id: str
    session_id: str | None = None
    audio_format: str = "wav"
    sample_rate: int = 16000
    audio_bytes: bytes | None = None
    audio_reference: str | None = None


class TranscriptionResult(BaseModel):
    """Output from STT."""

    text: str
    language: str | None = None
    confidence: float | None = None
    provider: str
    model: str
    latency_ms: float
    fallback_used: bool = False
    request_id: str | None = None
