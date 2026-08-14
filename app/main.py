from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from opentelemetry import metrics as otel_metrics
from opentelemetry import trace

from app.api.routes import router
from app.config.settings import settings
from app.observability.logging import setup_logging
from app.observability.metrics import setup_metrics
from app.observability.tracing import setup_tracing


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialize services on startup and cleanup on shutdown."""
    setup_logging(settings.log_level)
    setup_tracing(settings.otel_exporter_otlp_endpoint, settings.otel_service_name)
    setup_metrics(settings.otel_exporter_otlp_endpoint, settings.otel_service_name)
    yield
    from app.http_client import close_shared_client as close_http
    from app.qdrant_client import close_shared_client as close_qdrant

    await close_http()
    close_qdrant()
    trace.get_tracer_provider().shutdown()  # type: ignore[attr-defined]
    otel_metrics.get_meter_provider().shutdown()  # type: ignore[attr-defined]


app = FastAPI(
    title="VoiceRAG",
    description="Voice-enabled Retrieval-Augmented Generation system",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router)
