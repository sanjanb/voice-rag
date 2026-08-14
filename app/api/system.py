"""System status and settings endpoints."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/system", tags=["system"])


class SystemServiceStatus(BaseModel):
    """System service status model."""

    name: str
    status: str  # "healthy" | "degraded" | "unavailable"
    details: str | None = None
    lastChecked: str  # noqa: N815


class SystemStatus(BaseModel):
    """System status model matching frontend types."""

    overall: str  # "READY" | "DEGRADED" | "UNAVAILABLE"
    services: list[SystemServiceStatus]
    lastChecked: str  # noqa: N815


class KnowledgeBaseStatus(BaseModel):
    """Knowledge base status model."""

    totalDocuments: int  # noqa: N815
    totalChunks: int  # noqa: N815
    processingCount: int  # noqa: N815
    readyCount: int  # noqa: N815
    status: str  # "ready" | "processing" | "empty" | "error"
    lastUpdated: str  # noqa: N815


class StageLatency(BaseModel):
    """Stage latency model."""

    stage: str
    ms: float


class BenchmarkMetrics(BaseModel):
    """Benchmark metrics model."""

    p50: float
    p70: float
    p95: float
    p99: float
    stageLatencies: list[StageLatency]  # noqa: N815
    recallAt5: float  # noqa: N815
    recallAt10: float  # noqa: N815
    mrr: float
    ndcg: float
    groundedness: float
    correctness: float
    abstentionPrecision: float  # noqa: N815


class BenchmarkRun(BaseModel):
    """Benchmark run model."""

    id: str
    datasetName: str  # noqa: N815
    queryCount: int  # noqa: N815
    hardware: str
    commitHash: str  # noqa: N815
    timestamp: str
    metrics: BenchmarkMetrics


class ExperimentComparison(BaseModel):
    """Experiment comparison model."""

    name: str
    recallAt10: float  # noqa: N815
    mrr: float
    p50Ms: float  # noqa: N815
    p95Ms: float  # noqa: N815
    chunking: str
    retrieval: str
    reranking: str
    stt: str


class SystemSettings(BaseModel):
    """System settings model matching frontend types."""

    sttProvider: str  # noqa: N815
    sttFallback: str  # noqa: N815
    denseTopK: int  # noqa: N815
    sparseTopK: int  # noqa: N815
    rrfK: int  # noqa: N815
    rerankingMode: str  # noqa: N815
    rerankingThreshold: float  # noqa: N815
    abstentionThreshold: float  # noqa: N815
    generationModel: str  # noqa: N815
    generationTemperature: float  # noqa: N815


# Mock data from frontend/lib/api.ts
MOCK_SYSTEM_STATUS = SystemStatus(
    overall="READY",
    lastChecked="2 sec ago",
    services=[
        SystemServiceStatus(
            name="API Gateway",
            status="healthy",
            details="0.4ms latency",
            lastChecked="2s ago",
        ),
        SystemServiceStatus(
            name="Vector Store (Qdrant)",
            status="healthy",
            details="4.2K vectors",
            lastChecked="2s ago",
        ),
        SystemServiceStatus(
            name="Primary STT (Hosted)",
            status="healthy",
            details="Whisper v3 active",
            lastChecked="2s ago",
        ),
        SystemServiceStatus(
            name="Fallback STT (Local)",
            status="healthy",
            details="Ready",
            lastChecked="2s ago",
        ),
        SystemServiceStatus(
            name="Embedding Model",
            status="healthy",
            details="text-embedding-3-small",
            lastChecked="2s ago",
        ),
        SystemServiceStatus(
            name="Cross-Encoder Reranker",
            status="healthy",
            details="ms-marco-MiniLM-L-6-v2",
            lastChecked="2s ago",
        ),
        SystemServiceStatus(
            name="Generator LLM",
            status="healthy",
            details="gpt-4o-mini",
            lastChecked="2s ago",
        ),
    ],
)

MOCK_KNOWLEDGE_BASE = KnowledgeBaseStatus(
    totalDocuments=12,
    totalChunks=4821,
    processingCount=0,
    readyCount=12,
    status="ready",
    lastUpdated="2 min ago",
)

MOCK_BENCHMARK_RUN = BenchmarkRun(
    id="bench-v1.4",
    datasetName="VoiceRAG-Bench v1",
    queryCount=500,
    hardware="NVIDIA RTX 4090 / AMD EPYC 7763",
    commitHash="b4df7936",
    timestamp="2026-08-13 10:15 UTC",
    metrics=BenchmarkMetrics(
        p50=124,
        p70=148,
        p95=215,
        p99=310,
        stageLatencies=[
            {"stage": "STT", "ms": 42},
            {"stage": "Query", "ms": 3},
            {"stage": "BM25", "ms": 7},
            {"stage": "Dense", "ms": 11},
            {"stage": "RRF", "ms": 1},
            {"stage": "Reranker", "ms": 28},
            {"stage": "Generation", "ms": 72},
        ],
        recallAt5=0.884,
        recallAt10=0.942,
        mrr=0.891,
        ndcg=0.915,
        groundedness=0.962,
        correctness=0.941,
        abstentionPrecision=0.985,
    ),
)

MOCK_EXPERIMENTS: list[ExperimentComparison] = [
    ExperimentComparison(
        name="Baseline (Dense Only)",
        recallAt10=0.812,
        mrr=0.764,
        p50Ms=98,
        p95Ms=165,
        chunking="Fixed 512",
        retrieval="Dense Top-10",
        reranking="None",
        stt="Hosted Whisper",
    ),
    ExperimentComparison(
        name="Semantic Hybrid",
        recallAt10=0.895,
        mrr=0.841,
        p50Ms=112,
        p95Ms=185,
        chunking="Semantic",
        retrieval="BM25 + Dense + RRF",
        reranking="None",
        stt="Hosted Whisper",
    ),
    ExperimentComparison(
        name="VoiceRAG Production (Hybrid + Adaptive Rerank)",
        recallAt10=0.942,
        mrr=0.891,
        p50Ms=124,
        p95Ms=215,
        chunking="Structure-Aware",
        retrieval="BM25 + Dense + RRF",
        reranking="Adaptive Cross-Encoder",
        stt="Hosted + Local Fallback",
    ),
]

MOCK_SETTINGS = SystemSettings(
    sttProvider="Hosted",
    sttFallback="Local",
    denseTopK=10,
    sparseTopK=10,
    rrfK=60,
    rerankingMode="Adaptive",
    rerankingThreshold=0.72,
    abstentionThreshold=0.72,
    generationModel="gpt-4o-mini",
    generationTemperature=0.0,
)


@router.get("/status", response_model=SystemStatus)
async def get_system_status() -> SystemStatus:
    """System health (all services)."""
    return MOCK_SYSTEM_STATUS


@router.get("/knowledge-base", response_model=KnowledgeBaseStatus)
async def get_knowledge_base_status() -> KnowledgeBaseStatus:
    """Knowledge base stats."""
    return MOCK_KNOWLEDGE_BASE


@router.get("/settings", response_model=SystemSettings)
async def get_system_settings() -> SystemSettings:
    """Current system settings."""
    return MOCK_SETTINGS


@router.get("/benchmarks", response_model=BenchmarkRun)
async def get_benchmarks() -> BenchmarkRun:
    """Latest benchmark results."""
    return MOCK_BENCHMARK_RUN


@router.get("/experiments", response_model=list[ExperimentComparison])
async def get_experiments() -> list[ExperimentComparison]:
    """Experiment comparisons."""
    return MOCK_EXPERIMENTS
