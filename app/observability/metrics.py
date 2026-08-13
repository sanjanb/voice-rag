"""Pipeline metrics collection."""

from __future__ import annotations

import time


class MetricsCollector:
    """Collects and reports pipeline metrics."""

    def __init__(self) -> None:
        self._timers: dict[str, float] = {}

    def start_timer(self, name: str) -> None:
        """Start a named timer."""
        self._timers[name] = time.perf_counter()

    def stop_timer(self, name: str) -> float:
        """Stop a named timer and return elapsed ms."""
        start = self._timers.pop(name, time.perf_counter())
        return (time.perf_counter() - start) * 1000

    def record_latency(self, stage: str, latency_ms: float) -> None:
        """Record latency for a pipeline stage."""
        # TODO: emit to OpenTelemetry or other metrics backend
        pass
