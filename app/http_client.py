"""Shared httpx.AsyncClient singleton for connection pooling."""

from __future__ import annotations

import threading

import httpx

_lock = threading.Lock()
_shared_client: httpx.AsyncClient | None = None


def get_shared_client() -> httpx.AsyncClient:
    """Get or create shared httpx client with connection pooling."""
    global _shared_client
    if _shared_client is None or _shared_client.is_closed:
        with _lock:
            if _shared_client is None or _shared_client.is_closed:
                _shared_client = httpx.AsyncClient(
                    timeout=30.0,
                    limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
                )
    return _shared_client


async def close_shared_client() -> None:
    """Close the shared client (for app shutdown)."""
    global _shared_client
    if _shared_client is not None and not _shared_client.is_closed:
        await _shared_client.aclose()
        _shared_client = None
