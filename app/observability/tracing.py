"""OpenTelemetry tracing setup."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def setup_tracing(endpoint: str = "http://localhost:4317") -> None:
    """Initialize OpenTelemetry tracing with OTLP exporter."""
    # TODO: implement actual OpenTelemetry setup
    logger.info("Tracing setup (placeholder) — endpoint: %s", endpoint)
