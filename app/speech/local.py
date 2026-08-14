"""Local STT provider using openai-whisper."""

from __future__ import annotations

import contextlib
import os
import tempfile
import time

from app.schemas.audio import TranscriptionResult

try:
    import whisper
except ImportError:
    whisper = None


class LocalSTT:
    """Local whisper-family model for offline STT."""

    def __init__(self, model_name: str = "base") -> None:
        if whisper is None:
            raise ImportError("Install whisper: pip install openai-whisper")
        self.model_name = model_name
        self._model = whisper.load_model(model_name)

    async def transcribe(self, audio: bytes) -> TranscriptionResult:
        """Transcribe audio using the local whisper model."""
        start = time.perf_counter()

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio)
            tmp_path = tmp.name

        try:
            result = self._model.transcribe(tmp_path)
            text = result.get("text", "").strip()
            language = result.get("language")
        finally:
            with contextlib.suppress(OSError):
                os.unlink(tmp_path)

        latency_ms = (time.perf_counter() - start) * 1000

        return TranscriptionResult(
            text=text,
            language=language,
            confidence=None,
            provider="local",
            model=self.model_name,
            latency_ms=latency_ms,
            fallback_used=False,
        )