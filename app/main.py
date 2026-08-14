"""VoiceRAG FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from opentelemetry import trace, metrics as otel_metrics

from app.api.routes import router
from app.config.settings import settings
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing
from app.observability.metrics import setup_metrics

app = FastAPI(
    title="VoiceRAG",
    description="Voice-enabled Retrieval-Augmented Generation system",
    version="0.1.0",
)

app.include_router(router)


@app.on_event("startup")
async def startup() -> None:
    """Initialize services on startup."""
    setup_logging(settings.log_level)
    setup_tracing(settings.otel_exporter_otlp_endpoint, settings.otel_service_name)
    setup_metrics(settings.otel_exporter_otlp_endpoint, settings.otel_service_name)


@app.on_event("shutdown")
async def shutdown() -> None:
    """Cleanup on shutdown — flush OTel buffers."""
    trace.get_tracer_provider().shutdown()
    otel_metrics.get_meter_provider().shutdown()
