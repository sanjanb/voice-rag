"""Pipeline orchestrator — coordinates the full VoiceRAG pipeline."""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any

from app.pipeline.state import PipelineStage
from app.schemas.audio import AudioRequest, TranscriptionResult
from app.schemas.response import FinalResponse, LatencyMetrics

logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    """Coordinates STT → query → retrieval → generation → verification."""

    def __init__(self) -> None:
        self.stage = PipelineStage.RECEIVED

    async def run(self, request: AudioRequest) -> FinalResponse:
        """Execute the full pipeline for an audio request."""
        request_id = request.request_id or str(uuid.uuid4())
        metrics = LatencyMetrics()
        errors: list[dict[str, Any]] = []
        start = time.perf_counter()

        try:
            # Stage 1: STT
            self.stage = PipelineStage.TRANSCRIBING
            stt_start = time.perf_counter()
            # transcription = await self.stt_service.transcribe(request)
            # Placeholder — will be wired in Phase 8
            transcription = TranscriptionResult(
                text="[placeholder]",
                provider="placeholder",
                model="placeholder",
                latency_ms=0,
                request_id=request_id,
            )
            metrics.stt_ms = (time.perf_counter() - stt_start) * 1000

            # Stage 2: Query analysis
            self.stage = PipelineStage.QUERY_READY
            query_start = time.perf_counter()
            # query_analysis = await self.query_service.analyze(transcription.text)
            metrics.query_ms = (time.perf_counter() - query_start) * 1000

            # Stage 3: Retrieval
            self.stage = PipelineStage.RETRIEVING
            retrieval_start = time.perf_counter()
            # retrieval_result = await self.retrieval_engine.retrieve(query_analysis)
            metrics.dense_retrieval_ms = (time.perf_counter() - retrieval_start) * 1000

            # Stage 4: Optional reranking
            # Stage 5: Context building
            # Stage 6: Guardrails
            # Stage 7: Generation
            # Stage 8: Verification

            self.stage = PipelineStage.COMPLETED

        except Exception as exc:
            self.stage = PipelineStage.FAILED
            errors.append({"code": "INTERNAL_ERROR", "message": str(exc)})
            logger.exception("Pipeline failed for request %s", request_id)

        metrics.total_ms = (time.perf_counter() - start) * 1000

        return FinalResponse(
            request_id=request_id,
            decision="answer" if self.stage == PipelineStage.COMPLETED else "error",
            answer=None,
            transcript=transcription.text if transcription else None,
            metrics=metrics,
            errors=errors,
        )
