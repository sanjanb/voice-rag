"""VoiceRAG FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import router
from app.config.settings import settings
from app.observability.logging import setup_logging
from app.observability.tracing import setup_tracing

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
    setup_tracing(settings.otel_exporter_otlp_endpoint)


@app.on_event("shutdown")
async def shutdown() -> None:
    """Cleanup on shutdown."""
    pass
