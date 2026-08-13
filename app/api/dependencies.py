"""FastAPI dependencies."""

from __future__ import annotations

from functools import lru_cache

from app.config.settings import Settings, settings


def get_settings() -> Settings:
    """Get application settings."""
    return settings
