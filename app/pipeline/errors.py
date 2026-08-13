"""Pipeline error types."""

from __future__ import annotations

from enum import StrEnum
from typing import Any


class ErrorCode(StrEnum):
    """Machine-readable error codes."""

    STT_TIMEOUT = "STT_TIMEOUT"
    STT_FAILED = "STT_FAILED"
    STT_INVALID_AUDIO = "STT_INVALID_AUDIO"
    EMBEDDING_FAILED = "EMBEDDING_FAILED"
    RETRIEVAL_FAILED = "RETRIEVAL_FAILED"
    RERANKER_TIMEOUT = "RERANKER_TIMEOUT"
    RERANKER_FAILED = "RERANKER_FAILED"
    GENERATION_FAILED = "GENERATION_FAILED"
    GENERATION_TIMEOUT = "GENERATION_TIMEOUT"
    VERIFICATION_FAILED = "VERIFICATION_FAILED"
    INVALID_SCHEMA = "INVALID_SCHEMA"
    GUARDRAIL_ABSTAIN = "GUARDRAIL_ABSTAIN"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class PipelineError(Exception):
    """Typed pipeline error."""

    def __init__(
        self,
        code: ErrorCode,
        stage: str,
        message: str,
        retryable: bool = False,
        cause: Exception | None = None,
    ):
        self.code = code
        self.stage = stage
        self.message = message
        self.retryable = retryable
        self.cause = cause
        super().__init__(f"[{code.value}] {stage}: {message}")

    def to_dict(self) -> dict[str, Any]:
        return {
            "code": self.code.value,
            "stage": self.stage,
            "retryable": self.retryable,
            "message": self.message,
        }
