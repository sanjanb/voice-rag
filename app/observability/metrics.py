"""Pipeline metrics collection with OpenTelemetry."""

from __future__ import annotations

import logging

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader

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