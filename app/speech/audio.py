"""Audio validation utilities."""

from __future__ import annotations

MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
MAX_DURATION_SECONDS = 300  # 5 minutes
ALLOWED_FORMATS = {"wav", "mp3", "ogg", "flac", "webm", "m4a"}


def validate_audio(audio: bytes, audio_format: str) -> None:
    """Validate audio payload. Raises ValueError on invalid input."""
    if not audio:
        raise ValueError("Empty audio payload")
    if len(audio) > MAX_AUDIO_SIZE_BYTES:
        raise ValueError(f"Audio too large: {len(audio)} bytes (max {MAX_AUDIO_SIZE_BYTES})")
    if audio_format.lower() not in ALLOWED_FORMATS:
        raise ValueError(f"Unsupported audio format: {audio_format}")
