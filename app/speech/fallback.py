"""Fallback STT with automatic provider switching."""

from __future__ import annotations

import logging

from app.speech.base import SpeechRecognizer
from app.schemas.audio import TranscriptionResult

logger = logging.getLogger(__name__)


class FallbackSTT:
    """Try primary STT, fall back to secondary on failure."""

    def __init__(self, primary: SpeechRecognizer, fallback: SpeechRecognizer) -> None:
        self.primary = primary
        self.fallback = fallback

    async def transcribe(self, audio: bytes) -> TranscriptionResult:
        """Transcribe with fallback on failure."""
        try:
            result = await self.primary.transcribe(audio)
            if result.text.strip():
                return result
            logger.warning("Primary STT returned empty text, trying fallback")
        except Exception as exc:
            logger.warning("Primary STT failed: %s, trying fallback", exc)

        return await self.fallback.transcribe(audio)
