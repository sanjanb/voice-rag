"""Pipeline event logging."""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


def log_stage_event(
    request_id: str,
    stage: str,
    status: str,
    duration_ms: float | None = None,
    **kwargs: Any,
) -> None:
    """Log a structured pipeline stage event."""
    event: dict[str, Any] = {
        "event": f"stage_{status}",
        "request_id": request_id,
        "stage": stage,
        "status": status,
    }
    if duration_ms is not None:
        event["duration_ms"] = duration_ms
    event.update(kwargs)
    logger.info(json.dumps(event))
