"""FastAPI routes."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from app.schemas.response import FinalResponse

router = APIRouter()


@router.post("/transcribe", response_model=FinalResponse)
async def transcribe_audio(audio: Annotated[UploadFile, File()]) -> FinalResponse:
    """Transcribe audio and return pipeline result."""
    # TODO: implement full pipeline
    return FinalResponse(
        request_id="placeholder",
        decision="answer",
        answer="[placeholder]",
    )


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
