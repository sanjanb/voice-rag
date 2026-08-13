"""Pipeline state machine."""

from __future__ import annotations

from enum import Enum


class PipelineStage(str, Enum):
    """Pipeline processing stages."""

    RECEIVED = "received"
    TRANSCRIBING = "transcribing"
    QUERY_READY = "query_ready"
    RETRIEVING = "retrieving"
    RERANKING = "reranking"
    GUARDING = "guarding"
    GENERATING = "generating"
    VERIFYING = "verifying"
    COMPLETED = "completed"
    ABSTAINED = "abstained"
    FAILED = "failed"
