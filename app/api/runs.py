"""Pipeline runs endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/runs", tags=["runs"])


class Citation(BaseModel):
    """Citation model matching frontend types."""

    id: int
    chunkId: str  # noqa: N815
    documentName: str  # noqa: N815
    pageNumber: int  # noqa: N815
    score: float
    snippet: str


class STTDetails(BaseModel):
    """STT details model."""

    provider: str
    latencyMs: int  # noqa: N815
    confidence: float
    fallbackUsed: bool  # noqa: N815
    fallbackReason: str | None = None  # noqa: N815


class RerankerDecision(BaseModel):
    """Reranker decision model."""

    status: str  # "ENABLED" | "SKIPPED"
    reason: str
    queryComplexity: str  # noqa: N815
    denseSparseAgreement: float  # noqa: N815
    topScoreMargin: float  # noqa: N815
    evidenceConfidence: float  # noqa: N815
    candidatesBefore: int  # noqa: N815
    candidatesAfter: int  # noqa: N815
    latencyMs: int  # noqa: N815


class GuardrailDecision(BaseModel):
    """Guardrail decision model."""

    status: str  # "PASS" | "ABSTAIN"
    evidenceCoverage: float  # noqa: N815
    retrievalConfidence: float  # noqa: N815
    contradictionScore: float  # noqa: N815
    answerability: str  # "HIGH" | "MEDIUM" | "LOW"
    decision: str  # "ANSWER" | "ABSTAIN"
    reason: str | None = None


class RetrievalCandidate(BaseModel):
    """Retrieval candidate model."""

    chunkId: str  # noqa: N815
    documentName: str  # noqa: N815
    content: str
    denseScore: float | None = None  # noqa: N815
    denseRank: int | None = None  # noqa: N815
    sparseScore: float | None = None  # noqa: N815
    sparseRank: int | None = None  # noqa: N815
    rrfScore: float | None = None  # noqa: N815
    rrfRank: int | None = None  # noqa: N815
    rerankScore: float | None = None  # noqa: N815
    rerankRank: int | None = None  # noqa: N815
    pageNumber: int | None = None  # noqa: N815


class PipelineRun(BaseModel):
    """Pipeline run model matching frontend types."""

    runId: str  # noqa: N815
    query: str
    status: str  # "Complete" | "Abstained" | "Failed"
    timestamp: str
    totalLatencyMs: int  # noqa: N815
    sttMs: int  # noqa: N815
    queryMs: int  # noqa: N815
    bm25Ms: int  # noqa: N815
    denseMs: int  # noqa: N815
    rrfMs: int  # noqa: N815
    rerankerMs: int  # noqa: N815
    guardrailMs: int  # noqa: N815
    generationMs: int  # noqa: N815
    answer: str | None = None
    citations: list[Citation] = Field(default_factory=list)
    rerankerDecision: RerankerDecision | None = None  # noqa: N815
    guardrailDecision: GuardrailDecision | None = None  # noqa: N815
    candidates: list[RetrievalCandidate] = Field(default_factory=list)
    sttDetails: STTDetails | None = None  # noqa: N815


# Mock data from frontend/lib/api.ts
MOCK_RUNS: list[PipelineRun] = [
    PipelineRun(
        runId="#00482",
        query="What are the main conclusions from the research paper?",
        status="Complete",
        timestamp="2 mins ago",
        totalLatencyMs=142,
        sttMs=42,
        queryMs=3,
        bm25Ms=7,
        denseMs=11,
        rrfMs=1,
        rerankerMs=31,
        guardrailMs=4,
        generationMs=78,
        answer=(
            "The study identifies three major conclusions. First, concurrent dense and "
            "sparse retrieval reduces pipeline latency significantly. Second, Reciprocal "
            "Rank Fusion (RRF) preserves top-tier candidate quality across heterogeneous "
            "documents. Finally, adaptive reranking achieves high precision while saving "
            "~31ms when retrieval confidence is high."
        ),
        citations=[
            Citation(
                id=1,
                chunkId="chunk_042",
                documentName="research-paper.pdf",
                pageNumber=12,
                score=0.94,
                snippet=(
                    "The study investigates empirical latency bounds across hybrid "
                    "retrieval architectures..."
                ),
            ),
            Citation(
                id=2,
                chunkId="chunk_018",
                documentName="research-paper.pdf",
                pageNumber=13,
                score=0.89,
                snippet=(
                    "Previous research demonstrates that Reciprocal Rank Fusion (RRF) "
                    "with parameter k=60..."
                ),
            ),
        ],
        sttDetails=STTDetails(
            provider="Hosted Whisper v3",
            latencyMs=42,
            confidence=0.96,
            fallbackUsed=False,
        ),
        rerankerDecision=RerankerDecision(
            status="ENABLED",
            reason="Query complexity MEDIUM with low initial dense/sparse score margin.",
            queryComplexity="MEDIUM",
            denseSparseAgreement=0.42,
            topScoreMargin=0.04,
            evidenceConfidence=0.68,
            candidatesBefore=16,
            candidatesAfter=4,
            latencyMs=31,
        ),
        guardrailDecision=GuardrailDecision(
            status="PASS",
            evidenceCoverage=0.94,
            retrievalConfidence=0.91,
            contradictionScore=0.03,
            answerability="HIGH",
            decision="ANSWER",
        ),
        candidates=[
            RetrievalCandidate(
                chunkId="chunk_042",
                documentName="research-paper.pdf",
                content=(
                    "The study investigates empirical latency bounds across hybrid retrieval..."
                ),
                denseScore=0.94,
                denseRank=1,
                sparseScore=0.87,
                sparseRank=2,
                rrfScore=0.94,
                rrfRank=1,
                rerankScore=0.96,
                rerankRank=1,
                pageNumber=12,
            ),
            RetrievalCandidate(
                chunkId="chunk_018",
                documentName="research-paper.pdf",
                content="Previous research demonstrates that Reciprocal Rank Fusion...",
                denseScore=0.91,
                denseRank=2,
                sparseScore=0.81,
                sparseRank=3,
                rrfScore=0.89,
                rrfRank=2,
                rerankScore=0.92,
                rerankRank=2,
                pageNumber=13,
            ),
        ],
    ),
    PipelineRun(
        runId="#00481",
        query="Explain the chunking methodology used in section 2",
        status="Complete",
        timestamp="12 mins ago",
        totalLatencyMs=127,
        sttMs=38,
        queryMs=3,
        bm25Ms=6,
        denseMs=10,
        rrfMs=1,
        rerankerMs=0,
        guardrailMs=3,
        generationMs=66,
        answer=(
            "Section 2 employs structure-aware markdown chunking. Document headings "
            "(H1-H6) demarcate primary sections, ensuring semantic coherence within "
            "each chunk."
        ),
        citations=[
            Citation(
                id=1,
                chunkId="chunk_012",
                documentName="research-paper.pdf",
                pageNumber=14,
                score=0.92,
                snippet="Section 2 employs structure-aware markdown chunking...",
            ),
        ],
        sttDetails=STTDetails(
            provider="Hosted Whisper v3",
            latencyMs=38,
            confidence=0.98,
            fallbackUsed=False,
        ),
        rerankerDecision=RerankerDecision(
            status="SKIPPED",
            reason="High retrieval confidence and strong candidate agreement.",
            queryComplexity="LOW",
            denseSparseAgreement=0.88,
            topScoreMargin=0.22,
            evidenceConfidence=0.95,
            candidatesBefore=12,
            candidatesAfter=12,
            latencyMs=0,
        ),
        guardrailDecision=GuardrailDecision(
            status="PASS",
            evidenceCoverage=0.98,
            retrievalConfidence=0.95,
            contradictionScore=0.01,
            answerability="HIGH",
            decision="ANSWER",
        ),
        candidates=[],
    ),
    PipelineRun(
        runId="#00479",
        query="Does the paper discuss quantum computing benchmarks?",
        status="Abstained",
        timestamp="45 mins ago",
        totalLatencyMs=121,
        sttMs=44,
        queryMs=4,
        bm25Ms=9,
        denseMs=12,
        rrfMs=1,
        rerankerMs=28,
        guardrailMs=5,
        generationMs=18,
        answer=None,
        citations=[],
        sttDetails=STTDetails(
            provider="Hosted Whisper v3",
            latencyMs=44,
            confidence=0.94,
            fallbackUsed=False,
        ),
        guardrailDecision=GuardrailDecision(
            status="ABSTAIN",
            evidenceCoverage=0.31,
            retrievalConfidence=0.31,
            contradictionScore=0.45,
            answerability="LOW",
            decision="ABSTAIN",
            reason=(
                "I found related information, but the available evidence is not strong "
                "enough to answer this question confidently."
            ),
        ),
        candidates=[],
    ),
]


@router.get("", response_model=list[PipelineRun])
async def list_runs() -> list[PipelineRun]:
    """List pipeline runs (most recent first)."""
    return MOCK_RUNS


@router.get("/{run_id}", response_model=PipelineRun)
async def get_run(run_id: str) -> PipelineRun:
    """Get run details with full pipeline trace."""
    # Normalize run_id - frontend may send with or without # prefix
    normalized_id = run_id if run_id.startswith("#") else f"#{run_id}"
    for run in MOCK_RUNS:
        if run.runId == normalized_id or run.runId == run_id:
            return run
    raise HTTPException(status_code=404, detail="Run not found")
