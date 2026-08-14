"""OpenTelemetry tracing setup."""

from __future__ import annotations

import logging

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

logger = logging.getLogger(__name__)

_tracer: trace.Tracer | None = None


def setup_tracing(endpoint: str = "http://localhost:4317", service_name: str = "voice-rag") -> None:
    """Initialize OpenTelemetry tracing with OTLP exporter."""
    global _tracer
    try:
        resource = Resource.create({SERVICE_NAME: service_name})
        provider = TracerProvider(resource=resource)
        exporter = OTLPSpanExporter(endpoint=endpoint)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)
        _tracer = trace.get_tracer(service_name)
        logger.info("OpenTelemetry tracing initialized — endpoint: %s", endpoint)
    except Exception as e:
        logger.warning("Failed to initialize tracing: %s — using NoOp tracer", e)
        _tracer = trace.get_tracer(service_name)


def get_tracer() -> trace.Tracer:
    """Get the configured tracer (or NoOp if not initialized)."""
    global _tracer
    if _tracer is None:
        _tracer = trace.get_tracer("voice-rag")
    return _tracer


def span_attributes_from_query(query: str, request_id: str) -> dict[str, str]:
    """Build common span attributes from query context."""
    return {
        "voice_rag.request_id": request_id,
        "voice_rag.query.length": str(len(query)),
    }
