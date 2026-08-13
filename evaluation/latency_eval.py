"""Latency evaluation metrics."""

from __future__ import annotations

import statistics
from typing import Any


def compute_latency_percentiles(latencies_ms: list[float]) -> dict[str, float]:
    """Compute P50, P70, P90, P95, P99, P100 latencies."""
    if not latencies_ms:
        return {}
    sorted_lat = sorted(latencies_ms)
    n = len(sorted_lat)
    return {
        "p50": sorted_lat[int(n * 0.5)],
        "p70": sorted_lat[int(n * 0.7)],
        "p90": sorted_lat[int(n * 0.9)],
        "p95": sorted_lat[int(n * 0.95)],
        "p99": sorted_lat[min(int(n * 0.99), n - 1)],
        "p100": sorted_lat[-1],
        "mean": statistics.mean(sorted_lat),
    }
