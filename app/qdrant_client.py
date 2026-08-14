"""Shared QdrantClient singleton for connection reuse."""

from __future__ import annotations

import threading

from qdrant_client import QdrantClient

from app.config.settings import settings

_lock = threading.Lock()
_shared_client: QdrantClient | None = None


def get_shared_client() -> QdrantClient:
    """Get or create shared Qdrant client."""
    global _shared_client
    if _shared_client is None:
        with _lock:
            if _shared_client is None:
                _shared_client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
    return _shared_client


def close_shared_client() -> None:
    """Close the shared client (for app shutdown)."""
    global _shared_client
    if _shared_client is not None:
        _shared_client.close()
        _shared_client = None