"""Timeout wrapper for async operations."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Callable

logger = logging.getLogger(__name__)


async def with_timeout(
    fn: Callable[..., Any],
    *args: Any,
    timeout_ms: int,
    stage: str = "unknown",
    **kwargs: Any,
) -> Any:
    """Execute fn with a timeout. Raises asyncio.TimeoutError on expiry."""
    timeout_s = timeout_ms / 1000
    try:
        return await asyncio.wait_for(fn(*args, **kwargs), timeout=timeout_s)
    except asyncio.TimeoutError:
        logger.error("Stage '%s' timed out after %d ms", stage, timeout_ms)
        raise
