"""FastAPI routes."""

from __future__ import annotations

from fastapi import APIRouter, UploadFile, File

from app.schemas.audio import AudioRequest
from app.schemas.response import FinalResponse

router = APIRouter()


@router.post("/transcribe", response_model=FinalResponse)
async def transcribe_audio(audio: UploadFile = File(...)) -> FinalResponse:
    """Transcribe audio and return pipeline result."""
    # TODO: implement full pipeline
    return FinalResponse(
        request_id="placeholder",
        decision="answer",
        answer="[placeholder]",
    )


@router.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
