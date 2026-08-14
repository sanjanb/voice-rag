"""Pipeline orchestrator — coordinates the full VoiceRAG pipeline."""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any

from app.generation.generator import Generator
from app.generation.verifier import Verifier
from app.guardrails.answer_guard import AnswerGuard
from app.guardrails.retrieval_guard import RetrievalGuard
from app.context.builder import ContextBuilder
from app.pipeline.state import PipelineStage
from app.query.classify import classify_difficulty
from app.retrieval.engine import RetrievalEngine
from app.retrieval.reranker import CrossEncoderReranker
from app.schemas.audio import AudioRequest, TranscriptionResult
from app.schemas.response import FinalResponse, LatencyMetrics

logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    """Coordinates STT → query → retrieval → generation → verification."""

    def __init__(self) -> None:
        self.stage = PipelineStage.RECEIVED
        self.retrieval_engine = RetrievalEngine()
        self.reranker = CrossEncoderReranker()
        self.context_builder = ContextBuilder()
        self.retrieval_guard = RetrievalGuard(min_confidence=0.3, min_candidates=1)
        self.generator = Generator()
        self.verifier = Verifier()
        self.answer_guard = AnswerGuard()

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
            transcription = TranscriptionResult(
                text=request.audio_reference or "",
                provider="placeholder",
                model="placeholder",
                latency_ms=0,
                request_id=request_id,
            )
            metrics.stt_ms = (time.perf_counter() - stt_start) * 1000

            # Stage 2: Query analysis
            self.stage = PipelineStage.QUERY_READY
            query_start = time.perf_counter()
            query_text = transcription.text
            query_analysis = classify_difficulty(query_text)
            metrics.query_ms = (time.perf_counter() - query_start) * 1000

            # Stage 3: Retrieval
            self.stage = PipelineStage.RETRIEVING
            retrieval_start = time.perf_counter()
            retrieval_result = await self.retrieval_engine.retrieve(query_text)
            candidates = retrieval_result.candidates
            metrics.dense_retrieval_ms = (time.perf_counter() - retrieval_start) * 1000

            # Stage 4: Optional reranking
            rerank_start = time.perf_counter()
            if query_analysis.difficulty_score >= 0.4 and len(candidates) > 5:
                candidates = await self.reranker.rerank(query_text, candidates, top_k=5)
            metrics.rerank_ms = (time.perf_counter() - rerank_start) * 1000

            # Stage 5: Retrieval guard
            guard_start = time.perf_counter()
            retrieval_decision = self.retrieval_guard.evaluate(candidates)
            if retrieval_decision.decision == "abstain":
                self.stage = PipelineStage.COMPLETED
                metrics.total_ms = (time.perf_counter() - start) * 1000
                return FinalResponse(
                    request_id=request_id,
                    decision="abstain",
                    answer=None,
                    transcript=transcription.text,
                    metrics=metrics,
                    errors=errors,
                )
            metrics.context_build_ms = (time.perf_counter() - guard_start) * 1000

            # Stage 6: Context building
            context = self.context_builder.build(candidates)

            # Stage 7: Generation
            self.stage = PipelineStage.GENERATING
            generation_start = time.perf_counter()
            generated = await self.generator.generate(query_text, context)
            metrics.generation_ms = (time.perf_counter() - generation_start) * 1000

            # Stage 8: Verification
            verify_start = time.perf_counter()
            verifications = await self.verifier.verify(generated, context)
            answer_decision = self.answer_guard.evaluate(generated, verifications)
            metrics.verification_ms = (time.perf_counter() - verify_start) * 1000

            if answer_decision.decision == "abstain":
                self.stage = PipelineStage.COMPLETED
                metrics.total_ms = (time.perf_counter() - start) * 1000
                return FinalResponse(
                    request_id=request_id,
                    decision="abstain",
                    answer=None,
                    transcript=transcription.text,
                    metrics=metrics,
                    errors=errors,
                )

            self.stage = PipelineStage.COMPLETED

            return FinalResponse(
                request_id=request_id,
                decision="answer",
                answer=generated.answer,
                citations=[{"id": c, "score": 1.0} for c in generated.citations],
                transcript=transcription.text,
                metrics=metrics,
                errors=errors,
            )

        except Exception as exc:
            self.stage = PipelineStage.FAILED
            errors.append({"code": "INTERNAL_ERROR", "message": str(exc)})
            logger.exception("Pipeline failed for request %s", request_id)

        metrics.total_ms = (time.perf_counter() - start) * 1000

        return FinalResponse(
            request_id=request_id,
            decision="error" if errors else "answer",
            answer=None,
            metrics=metrics,
            errors=errors,
        )

    async def run_text(self, query: str) -> FinalResponse:
        """Execute the pipeline for a text query (skip STT)."""
        request_id = str(uuid.uuid4())
        metrics = LatencyMetrics()
        errors: list[dict[str, Any]] = []
        start = time.perf_counter()

        try:
            # Stage 1: Query analysis
            self.stage = PipelineStage.QUERY_READY
            query_start = time.perf_counter()
            query_analysis = classify_difficulty(query)
            metrics.query_ms = (time.perf_counter() - query_start) * 1000

            # Stage 2: Retrieval
            self.stage = PipelineStage.RETRIEVING
            retrieval_start = time.perf_counter()
            retrieval_result = await self.retrieval_engine.retrieve(query)
            candidates = retrieval_result.candidates
            metrics.dense_retrieval_ms = (time.perf_counter() - retrieval_start) * 1000

            # Stage 3: Optional reranking
            rerank_start = time.perf_counter()
            if query_analysis.difficulty_score >= 0.4 and len(candidates) > 5:
                candidates = await self.reranker.rerank(query, candidates, top_k=5)
            metrics.rerank_ms = (time.perf_counter() - rerank_start) * 1000

            # Stage 4: Retrieval guard
            guard_start = time.perf_counter()
            retrieval_decision = self.retrieval_guard.evaluate(candidates)
            if retrieval_decision.decision == "abstain":
                self.stage = PipelineStage.COMPLETED
                metrics.total_ms = (time.perf_counter() - start) * 1000
                return FinalResponse(
                    request_id=request_id,
                    decision="abstain",
                    answer=None,
                    transcript=query,
                    metrics=metrics,
                    errors=errors,
                )
            metrics.context_build_ms = (time.perf_counter() - guard_start) * 1000

            # Stage 5: Context building
            context = self.context_builder.build(candidates)

            # Stage 6: Generation
            self.stage = PipelineStage.GENERATING
            generation_start = time.perf_counter()
            generated = await self.generator.generate(query, context)
            metrics.generation_ms = (time.perf_counter() - generation_start) * 1000

            # Stage 7: Verification
            verify_start = time.perf_counter()
            verifications = await self.verifier.verify(generated, context)
            answer_decision = self.answer_guard.evaluate(generated, verifications)
            metrics.verification_ms = (time.perf_counter() - verify_start) * 1000

            if answer_decision.decision == "abstain":
                self.stage = PipelineStage.COMPLETED
                metrics.total_ms = (time.perf_counter() - start) * 1000
                return FinalResponse(
                    request_id=request_id,
                    decision="abstain",
                    answer=None,
                    transcript=query,
                    metrics=metrics,
                    errors=errors,
                )

            self.stage = PipelineStage.COMPLETED

            return FinalResponse(
                request_id=request_id,
                decision="answer",
                answer=generated.answer,
                citations=[{"id": c, "score": 1.0} for c in generated.citations],
                transcript=query,
                metrics=metrics,
                errors=errors,
            )

        except Exception as exc:
            self.stage = PipelineStage.FAILED
            errors.append({"code": "INTERNAL_ERROR", "message": str(exc)})
            logger.exception("Pipeline failed for request %s", request_id)

        metrics.total_ms = (time.perf_counter() - start) * 1000

        return FinalResponse(
            request_id=request_id,
            decision="error" if errors else "answer",
            answer=None,
            metrics=metrics,
            errors=errors,
        )
