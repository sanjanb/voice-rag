"""Speech recognizer interface."""

from __future__ import annotations

from typing import Protocol

from app.schemas.audio import TranscriptionResult


class SpeechRecognizer(Protocol):
    """Protocol for speech-to-text providers."""

    async def transcribe(self, audio: bytes) -> TranscriptionResult: ...
