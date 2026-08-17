"""FastAPI routes."""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator  # noqa: TC003
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.api import documents, runs, system
from app.pipeline.orchestrator import PipelineOrchestrator
from app.schemas.audio import AudioRequest
from app.schemas.response import FinalResponse

router = APIRouter()

# Include sub-routers
router.include_router(documents.router)
router.include_router(runs.router)
router.include_router(system.router)

_MAX_AUDIO_BYTES = 10 * 1024 * 1024  # 10MB


async def get_orchestrator() -> AsyncGenerator[PipelineOrchestrator, None]:
    """Yield a fresh orchestrator instance per request to avoid shared mutable state."""
    yield PipelineOrchestrator()


class AskRequest(BaseModel):
    """Request body for the /ask endpoint."""

    query: str = Field(..., min_length=1, max_length=5000, description="The user query")


@router.post("/transcribe", response_model=FinalResponse)
async def transcribe_audio(
    audio: Annotated[UploadFile, File()],
    orchestrator: Annotated[PipelineOrchestrator, Depends(get_orchestrator)],
) -> FinalResponse:
    """Transcribe audio and return pipeline result."""
    # Enforce size limit even when Content-Length is missing:
    # read in chunks and abort early if over limit.
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await audio.read(64 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > _MAX_AUDIO_BYTES:
            raise HTTPException(status_code=413, detail="Audio file too large (max 10MB)")
        chunks.append(chunk)
    audio_bytes = b"".join(chunks)

    request = AudioRequest(
        request_id=str(uuid.uuid4()),
        audio_bytes=audio_bytes,
        audio_format=audio.content_type or "audio/wav",
    )
    return await orchestrator.run(request)


@router.post("/ask", response_model=FinalResponse)
async def ask_question(
    body: AskRequest,
    orchestrator: Annotated[PipelineOrchestrator, Depends(get_orchestrator)],
) -> FinalResponse:
    """Process a text query and return pipeline result."""
    return await orchestrator.run_text(body.query)


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
