"""Speech recognizer interface."""

from __future__ import annotations

from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from app.schemas.audio import TranscriptionResult


class SpeechRecognizer(Protocol):
    """Protocol for speech-to-text providers."""

    async def transcribe(self, audio: bytes) -> TranscriptionResult: ...
