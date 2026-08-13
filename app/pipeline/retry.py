"""Retry logic for transient failures."""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from collections.abc import Callable

logger = logging.getLogger(__name__)


async def with_retry(
    fn: Callable[..., Any],
    *args: Any,
    max_attempts: int = 2,
    backoff_ms: int = 20,
    retryable_exceptions: tuple[type[Exception], ...] = (Exception,),
    **kwargs: Any,
) -> Any:
    """Execute fn with bounded retry for transient failures."""
    last_exc: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            return await fn(*args, **kwargs)
        except retryable_exceptions as exc:
            last_exc = exc
            if attempt < max_attempts:
                delay = backoff_ms * (2 ** (attempt - 1)) / 1000
                logger.warning("Attempt %d failed: %s. Retrying in %.3fs", attempt, exc, delay)
                await asyncio.sleep(delay)
            else:
                logger.error("All %d attempts failed: %s", max_attempts, exc)
    raise last_exc  # type: ignore[misc]
