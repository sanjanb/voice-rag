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
from app.observability.tracing import get_tracer, span_attributes_from_query

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

        tracer = get_tracer()
        root_attrs = span_attributes_from_query(request.audio_reference or "", request_id)
        root_attrs["voice_rag.stage"] = "pipeline.run"

        with tracer.start_as_current_span("pipeline.run", attributes=root_attrs) as root_span:
            try:
                # Stage 1: STT
                self.stage = PipelineStage.TRANSCRIBING
                stt_start = time.perf_counter()
                with tracer.start_as_current_span("stt", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "stt"}) as span:
                    transcription = TranscriptionResult(
                        text=request.audio_reference or "",
                        provider="placeholder",
                        model="placeholder",
                        latency_ms=0,
                        request_id=request_id,
                    )
                    metrics.stt_ms = (time.perf_counter() - stt_start) * 1000
                    span.set_attribute("voice_rag.stt_ms", metrics.stt_ms)

                # Stage 2: Query analysis
                self.stage = PipelineStage.QUERY_READY
                query_start = time.perf_counter()
                with tracer.start_as_current_span("query_analysis", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "query_analysis"}) as span:
                    query_text = transcription.text
                    query_analysis = classify_difficulty(query_text)
                    metrics.query_ms = (time.perf_counter() - query_start) * 1000
                    span.set_attribute("voice_rag.query_ms", metrics.query_ms)
                    span.set_attribute("voice_rag.difficulty_score", query_analysis.difficulty_score)

                # Stage 3: Retrieval
                self.stage = PipelineStage.RETRIEVING
                retrieval_start = time.perf_counter()
                with tracer.start_as_current_span("retrieval", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "retrieval"}) as span:
                    retrieval_result = await self.retrieval_engine.retrieve(query_text)
                    candidates = retrieval_result.candidates
                    metrics.dense_retrieval_ms = (time.perf_counter() - retrieval_start) * 1000
                    span.set_attribute("voice_rag.dense_retrieval_ms", metrics.dense_retrieval_ms)
                    span.set_attribute("voice_rag.candidates_count", len(candidates))

                # Stage 4: Optional reranking
                rerank_start = time.perf_counter()
                with tracer.start_as_current_span("reranking", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "reranking"}) as span:
                    if query_analysis.difficulty_score >= 0.4 and len(candidates) > 5:
                        candidates = await self.reranker.rerank(query_text, candidates, top_k=5)
                        span.set_attribute("voice_rag.reranked_count", len(candidates))
                    else:
                        span.add_event("reranker.skip", {"reason": "difficulty_low_or_few_candidates"})
                    metrics.rerank_ms = (time.perf_counter() - rerank_start) * 1000
                    span.set_attribute("voice_rag.rerank_ms", metrics.rerank_ms)

                # Stage 5: Retrieval guard
                guard_start = time.perf_counter()
                with tracer.start_as_current_span("retrieval_guard", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "retrieval_guard"}) as span:
                    retrieval_decision = self.retrieval_guard.evaluate(candidates)
                    if retrieval_decision.decision == "abstain":
                        span.add_event("retrieval.abstain", {"reason": retrieval_decision.reason})
                        span.set_attribute("voice_rag.decision", "abstain")
                        self.stage = PipelineStage.COMPLETED
                        metrics.total_ms = (time.perf_counter() - start) * 1000
                        root_span.set_attribute("voice_rag.decision", "abstain")
                        root_span.set_attribute("voice_rag.total_ms", metrics.total_ms)
                        return FinalResponse(
                            request_id=request_id,
                            decision="abstain",
                            answer=None,
                            transcript=transcription.text,
                            metrics=metrics,
                            errors=errors,
                        )
                    metrics.context_build_ms = (time.perf_counter() - guard_start) * 1000
                    span.set_attribute("voice_rag.context_build_ms", metrics.context_build_ms)

                # Stage 6: Context building
                with tracer.start_as_current_span("context_build", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "context_build"}) as span:
                    context = self.context_builder.build(candidates)
                    span.set_attribute("voice_rag.context_length", len(context))

                # Stage 7: Generation
                self.stage = PipelineStage.GENERATING
                generation_start = time.perf_counter()
                with tracer.start_as_current_span("generation", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "generation"}) as span:
                    generated = await self.generator.generate(query_text, context)
                    metrics.generation_ms = (time.perf_counter() - generation_start) * 1000
                    span.set_attribute("voice_rag.generation_ms", metrics.generation_ms)
                    span.set_attribute("voice_rag.answer_length", len(generated.answer))

                # Stage 8: Verification
                verify_start = time.perf_counter()
                with tracer.start_as_current_span("verification", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "verification"}) as span:
                    verifications = await self.verifier.verify(generated, context)
                    answer_decision = self.answer_guard.evaluate(generated, verifications)
                    metrics.verification_ms = (time.perf_counter() - verify_start) * 1000
                    span.set_attribute("voice_rag.verification_ms", metrics.verification_ms)
                    span.set_attribute("voice_rag.verifications_count", len(verifications))

                    if answer_decision.decision == "abstain":
                        span.add_event("generation.abstain", {"reason": answer_decision.reason})
                        span.set_attribute("voice_rag.decision", "abstain")
                        self.stage = PipelineStage.COMPLETED
                        metrics.total_ms = (time.perf_counter() - start) * 1000
                        root_span.set_attribute("voice_rag.decision", "abstain")
                        root_span.set_attribute("voice_rag.total_ms", metrics.total_ms)
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
                root_span.set_attribute("voice_rag.decision", "error")
                root_span.record_exception(exc)

            metrics.total_ms = (time.perf_counter() - start) * 1000
            root_span.set_attribute("voice_rag.total_ms", metrics.total_ms)
            root_span.set_attribute("voice_rag.decision", "error" if errors else "answer")

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

        tracer = get_tracer()
        root_attrs = span_attributes_from_query(query, request_id)
        root_attrs["voice_rag.stage"] = "pipeline.run"

        with tracer.start_as_current_span("pipeline.run", attributes=root_attrs) as root_span:
            try:
                # Stage 1: Query analysis
                self.stage = PipelineStage.QUERY_READY
                query_start = time.perf_counter()
                with tracer.start_as_current_span("query_analysis", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "query_analysis"}) as span:
                    query_analysis = classify_difficulty(query)
                    metrics.query_ms = (time.perf_counter() - query_start) * 1000
                    span.set_attribute("voice_rag.query_ms", metrics.query_ms)
                    span.set_attribute("voice_rag.difficulty_score", query_analysis.difficulty_score)

                # Stage 2: Retrieval
                self.stage = PipelineStage.RETRIEVING
                retrieval_start = time.perf_counter()
                with tracer.start_as_current_span("retrieval", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "retrieval"}) as span:
                    retrieval_result = await self.retrieval_engine.retrieve(query)
                    candidates = retrieval_result.candidates
                    metrics.dense_retrieval_ms = (time.perf_counter() - retrieval_start) * 1000
                    span.set_attribute("voice_rag.dense_retrieval_ms", metrics.dense_retrieval_ms)
                    span.set_attribute("voice_rag.candidates_count", len(candidates))

                # Stage 3: Optional reranking
                rerank_start = time.perf_counter()
                with tracer.start_as_current_span("reranking", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "reranking"}) as span:
                    if query_analysis.difficulty_score >= 0.4 and len(candidates) > 5:
                        candidates = await self.reranker.rerank(query, candidates, top_k=5)
                        span.set_attribute("voice_rag.reranked_count", len(candidates))
                    else:
                        span.add_event("reranker.skip", {"reason": "difficulty_low_or_few_candidates"})
                    metrics.rerank_ms = (time.perf_counter() - rerank_start) * 1000
                    span.set_attribute("voice_rag.rerank_ms", metrics.rerank_ms)

                # Stage 4: Retrieval guard
                guard_start = time.perf_counter()
                with tracer.start_as_current_span("retrieval_guard", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "retrieval_guard"}) as span:
                    retrieval_decision = self.retrieval_guard.evaluate(candidates)
                    if retrieval_decision.decision == "abstain":
                        span.add_event("retrieval.abstain", {"reason": retrieval_decision.reason})
                        span.set_attribute("voice_rag.decision", "abstain")
                        self.stage = PipelineStage.COMPLETED
                        metrics.total_ms = (time.perf_counter() - start) * 1000
                        root_span.set_attribute("voice_rag.decision", "abstain")
                        root_span.set_attribute("voice_rag.total_ms", metrics.total_ms)
                        return FinalResponse(
                            request_id=request_id,
                            decision="abstain",
                            answer=None,
                            transcript=query,
                            metrics=metrics,
                            errors=errors,
                        )
                    metrics.context_build_ms = (time.perf_counter() - guard_start) * 1000
                    span.set_attribute("voice_rag.context_build_ms", metrics.context_build_ms)

                # Stage 5: Context building
                with tracer.start_as_current_span("context_build", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "context_build"}) as span:
                    context = self.context_builder.build(candidates)
                    span.set_attribute("voice_rag.context_length", len(context))

                # Stage 6: Generation
                self.stage = PipelineStage.GENERATING
                generation_start = time.perf_counter()
                with tracer.start_as_current_span("generation", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "generation"}) as span:
                    generated = await self.generator.generate(query, context)
                    metrics.generation_ms = (time.perf_counter() - generation_start) * 1000
                    span.set_attribute("voice_rag.generation_ms", metrics.generation_ms)
                    span.set_attribute("voice_rag.answer_length", len(generated.answer))

                # Stage 7: Verification
                verify_start = time.perf_counter()
                with tracer.start_as_current_span("verification", attributes={"voice_rag.request_id": request_id, "voice_rag.stage": "verification"}) as span:
                    verifications = await self.verifier.verify(generated, context)
                    answer_decision = self.answer_guard.evaluate(generated, verifications)
                    metrics.verification_ms = (time.perf_counter() - verify_start) * 1000
                    span.set_attribute("voice_rag.verification_ms", metrics.verification_ms)
                    span.set_attribute("voice_rag.verifications_count", len(verifications))

                    if answer_decision.decision == "abstain":
                        span.add_event("generation.abstain", {"reason": answer_decision.reason})
                        span.set_attribute("voice_rag.decision", "abstain")
                        self.stage = PipelineStage.COMPLETED
                        metrics.total_ms = (time.perf_counter() - start) * 1000
                        root_span.set_attribute("voice_rag.decision", "abstain")
                        root_span.set_attribute("voice_rag.total_ms", metrics.total_ms)
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
                root_span.set_attribute("voice_rag.decision", "error")
                root_span.record_exception(exc)

            metrics.total_ms = (time.perf_counter() - start) * 1000
            root_span.set_attribute("voice_rag.total_ms", metrics.total_ms)
            root_span.set_attribute("voice_rag.decision", "error" if errors else "answer")

            return FinalResponse(
                request_id=request_id,
                decision="error" if errors else "answer",
                answer=None,
                metrics=metrics,
                errors=errors,
            )