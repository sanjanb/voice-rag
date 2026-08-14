"""Pipeline metrics collection with OpenTelemetry."""

from __future__ import annotations

import logging
import time
from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

logger = logging.getLogger(__name__)

_meter: metrics.Meter | None = None


def setup_metrics(endpoint: str = "http://localhost:4317", service_name: str = "voice-rag") -> None:
    """Initialize OpenTelemetry metrics."""
    global _meter
    try:
        exporter = OTLPMetricExporter(endpoint=endpoint)
        reader = PeriodicExportingMetricReader(exporter, export_interval_millis=30000)
        provider = MeterProvider(metric_readers=[reader])
        metrics.set_meter_provider(provider)
        _meter = metrics.get_meter(service_name)
        logger.info("OpenTelemetry metrics initialized — endpoint: %s", endpoint)
    except Exception as e:
        logger.warning("Failed to initialize metrics: %s", e)


def get_meter() -> metrics.Meter:
    """Get the configured meter."""
    global _meter
    if _meter is None:
        _meter = metrics.get_meter("voice-rag")
    return _meter


class MetricsCollector:
    """Collects and reports pipeline metrics via OTel and local timers."""

    def __init__(self) -> None:
        self._timers: dict[str, float] = {}
        meter = get_meter()
        self._latency_histogram = meter.create_histogram(
            name="voice_rag.pipeline.stage_latency_ms",
            description="Latency of pipeline stages in milliseconds",
            unit="ms",
        )
        self._request_counter = meter.create_counter(
            name="voice_rag.pipeline.requests_total",
            description="Total number of pipeline requests",
        )
        self._decision_counter = meter.create_counter(
            name="voice_rag.pipeline.decisions_total",
            description="Pipeline decisions by type",
        )

    def start_timer(self, name: str) -> None:
        """Start a named timer."""
        self._timers[name] = time.perf_counter()

    def stop_timer(self, name: str) -> float:
        """Stop a named timer and return elapsed ms."""
        start = self._timers.pop(name, time.perf_counter())
        elapsed = (time.perf_counter() - start) * 1000
        self._latency_histogram.record(elapsed, {"stage": name})
        return elapsed

    def record_latency(self, stage: str, latency_ms: float) -> None:
        """Record latency for a pipeline stage."""
        self._latency_histogram.record(latency_ms, {"stage": stage})

    def increment_requests(self, decision: str) -> None:
        """Record a completed request."""
        self._request_counter.add(1)
        self._decision_counter.add(1, {"decision": decision})