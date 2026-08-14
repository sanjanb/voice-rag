"""FastAPI routes."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from app.api import documents, runs, system
from app.pipeline.orchestrator import PipelineOrchestrator
from app.schemas.audio import AudioRequest
from app.schemas.response import FinalResponse

router = APIRouter()

# Include sub-routers
router.include_router(documents.router)
router.include_router(runs.router)
router.include_router(system.router)

_orchestrator = PipelineOrchestrator()


@router.post("/transcribe", response_model=FinalResponse)
async def transcribe_audio(audio: Annotated[UploadFile, File()]) -> FinalResponse:
    """Transcribe audio and return pipeline result."""
    audio_bytes = await audio.read()
    request = AudioRequest(
        request_id=str(uuid.uuid4()),
        audio_bytes=audio_bytes,
        audio_format=audio.content_type or "audio/wav",
    )
    return await _orchestrator.run(request)


@router.post("/ask", response_model=FinalResponse)
async def ask_question(query: str) -> FinalResponse:
    """Process a text query and return pipeline result."""
    return await _orchestrator.run_text(query)


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}