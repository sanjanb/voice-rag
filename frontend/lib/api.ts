import {
  KnowledgeBaseStatus,
  Document,
  Chunk,
  PipelineRun,
  SystemStatus,
  BenchmarkRun,
  ExperimentComparison,
  SystemSettings,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Mock fallbacks for full UX specification demo operation
export const MOCK_KNOWLEDGE_BASE: KnowledgeBaseStatus = {
  totalDocuments: 12,
  totalChunks: 4821,
  processingCount: 0,
  readyCount: 12,
  status: "ready",
  lastUpdated: "2 min ago",
};

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc-001",
    name: "research-paper.pdf",
    type: "PDF",
    status: "ready",
    chunks: 842,
    date: "10 mins ago",
    size: 2450000,
    pages: 24,
    characters: 182421,
    embeddingsCount: 842,
    parser: "Structure-Aware PDF",
    chunkingStrategy: "Recursive / Heading",
    chunkSize: 512,
    overlap: 64,
    sparseIndex: "BM25 (k1=1.5, b=0.75)",
    denseIndex: "text-embedding-3-small (1536d)",
    metadata: { author: "DeepMind R&D", year: 2026 },
  },
  {
    id: "doc-002",
    name: "annual-report.pdf",
    type: "PDF",
    status: "ready",
    chunks: 611,
    date: "1 hour ago",
    size: 1850000,
    pages: 18,
    characters: 120500,
    embeddingsCount: 611,
    parser: "PDF",
    chunkingStrategy: "Parent-Child",
    chunkSize: 800,
    overlap: 100,
    sparseIndex: "BM25",
    denseIndex: "text-embedding-3-small",
    metadata: { type: "Financial" },
  },
  {
    id: "doc-003",
    name: "technical-report.pdf",
    type: "PDF",
    status: "ready",
    chunks: 503,
    date: "3 hours ago",
    size: 1420000,
    pages: 14,
    characters: 98400,
    embeddingsCount: 503,
    parser: "PDF",
    chunkingStrategy: "Fixed",
    chunkSize: 600,
    overlap: 90,
    sparseIndex: "BM25",
    denseIndex: "text-embedding-3-small",
    metadata: { type: "Engineering" },
  },
  {
    id: "doc-004",
    name: "system-architecture.md",
    type: "MD",
    status: "ready",
    chunks: 122,
    date: "1 day ago",
    size: 45000,
    pages: 4,
    characters: 32100,
    embeddingsCount: 122,
    parser: "Markdown",
    chunkingStrategy: "Structural",
    chunkSize: 400,
    overlap: 40,
    sparseIndex: "BM25",
    denseIndex: "text-embedding-3-small",
    metadata: { category: "Architecture" },
  },
];

export const MOCK_CHUNKS: Chunk[] = [
  {
    id: "chunk_042",
    documentId: "doc-001",
    documentName: "research-paper.pdf",
    content:
      "The study investigates empirical latency bounds across hybrid retrieval architectures. Dense and sparse indexing are executed concurrently to minimize total retrieval overhead.",
    tokenCount: 142,
    strategy: "structural",
    headingPath: ["Abstract", "System Overview"],
    pageNumber: 12,
    metadata: { headingLevel: 2 },
  },
  {
    id: "chunk_018",
    documentId: "doc-001",
    documentName: "research-paper.pdf",
    content:
      "Previous research demonstrates that Reciprocal Rank Fusion (RRF) with parameter k=60 achieves optimal trade-offs between precision and latency across multi-domain datasets.",
    tokenCount: 168,
    strategy: "structural",
    headingPath: ["Methodology", "Rank Fusion"],
    pageNumber: 13,
    metadata: { headingLevel: 3 },
  },
  {
    id: "chunk_012",
    documentId: "doc-001",
    documentName: "research-paper.pdf",
    content:
      "Experimental results confirm that adaptive cross-encoder reranking eliminates false positive context passages while saving ~31ms when retrieval confidence exceeds 0.85.",
    tokenCount: 155,
    strategy: "structural",
    headingPath: ["Results", "Reranker Ablation"],
    pageNumber: 14,
    metadata: { headingLevel: 3 },
  },
];

export const MOCK_RUNS: PipelineRun[] = [
  {
    runId: "#00482",
    query: "What are the main conclusions from the research paper?",
    status: "Complete",
    timestamp: "2 mins ago",
    totalLatencyMs: 142,
    sttMs: 42,
    queryMs: 3,
    bm25Ms: 7,
    denseMs: 11,
    rrfMs: 1,
    rerankerMs: 31,
    guardrailMs: 4,
    generationMs: 78,
    answer:
      "The study identifies three major conclusions. First, concurrent dense and sparse retrieval reduces pipeline latency significantly. Second, Reciprocal Rank Fusion (RRF) preserves top-tier candidate quality across heterogeneous documents. Finally, adaptive reranking achieves high precision while saving ~31ms when retrieval confidence is high.",
    citations: [
      {
        id: 1,
        chunkId: "chunk_042",
        documentName: "research-paper.pdf",
        pageNumber: 12,
        score: 0.94,
        snippet:
          "The study investigates empirical latency bounds across hybrid retrieval architectures...",
      },
      {
        id: 2,
        chunkId: "chunk_018",
        documentName: "research-paper.pdf",
        pageNumber: 13,
        score: 0.89,
        snippet:
          "Previous research demonstrates that Reciprocal Rank Fusion (RRF) with parameter k=60...",
      },
    ],
    sttDetails: {
      provider: "Hosted Whisper v3",
      latencyMs: 42,
      confidence: 0.96,
      fallbackUsed: false,
    },
    rerankerDecision: {
      status: "ENABLED",
      reason: "Query complexity MEDIUM with low initial dense/sparse score margin.",
      queryComplexity: "MEDIUM",
      denseSparseAgreement: 0.42,
      topScoreMargin: 0.04,
      evidenceConfidence: 0.68,
      candidatesBefore: 16,
      candidatesAfter: 4,
      latencyMs: 31,
    },
    guardrailDecision: {
      status: "PASS",
      evidenceCoverage: 0.94,
      retrievalConfidence: 0.91,
      contradictionScore: 0.03,
      answerability: "HIGH",
      decision: "ANSWER",
    },
    candidates: [
      {
        chunkId: "chunk_042",
        documentName: "research-paper.pdf",
        content: "The study investigates empirical latency bounds across hybrid retrieval...",
        denseScore: 0.94,
        denseRank: 1,
        sparseScore: 0.87,
        sparseRank: 2,
        rrfScore: 0.94,
        rrfRank: 1,
        rerankScore: 0.96,
        rerankRank: 1,
        pageNumber: 12,
      },
      {
        chunkId: "chunk_018",
        documentName: "research-paper.pdf",
        content: "Previous research demonstrates that Reciprocal Rank Fusion...",
        denseScore: 0.91,
        denseRank: 2,
        sparseScore: 0.81,
        sparseRank: 3,
        rrfScore: 0.89,
        rrfRank: 2,
        rerankScore: 0.92,
        rerankRank: 2,
        pageNumber: 13,
      },
    ],
  },
  {
    runId: "#00481",
    query: "Explain the chunking methodology used in section 2",
    status: "Complete",
    timestamp: "12 mins ago",
    totalLatencyMs: 127,
    sttMs: 38,
    queryMs: 3,
    bm25Ms: 6,
    denseMs: 10,
    rrfMs: 1,
    rerankerMs: 0,
    guardrailMs: 3,
    generationMs: 66,
    answer:
      "Section 2 employs structure-aware markdown chunking. Document headings (H1-H6) demarcate primary sections, ensuring semantic coherence within each chunk.",
    citations: [
      {
        id: 1,
        chunkId: "chunk_012",
        documentName: "research-paper.pdf",
        pageNumber: 14,
        score: 0.92,
        snippet: "Section 2 employs structure-aware markdown chunking...",
      },
    ],
    sttDetails: {
      provider: "Hosted Whisper v3",
      latencyMs: 38,
      confidence: 0.98,
      fallbackUsed: false,
    },
    rerankerDecision: {
      status: "SKIPPED",
      reason: "High retrieval confidence and strong candidate agreement.",
      queryComplexity: "LOW",
      denseSparseAgreement: 0.88,
      topScoreMargin: 0.22,
      evidenceConfidence: 0.95,
      candidatesBefore: 12,
      candidatesAfter: 12,
      latencyMs: 0,
    },
    guardrailDecision: {
      status: "PASS",
      evidenceCoverage: 0.98,
      retrievalConfidence: 0.95,
      contradictionScore: 0.01,
      answerability: "HIGH",
      decision: "ANSWER",
    },
    candidates: [],
  },
  {
    runId: "#00479",
    query: "Does the paper discuss quantum computing benchmarks?",
    status: "Abstained",
    timestamp: "45 mins ago",
    totalLatencyMs: 121,
    sttMs: 44,
    queryMs: 4,
    bm25Ms: 9,
    denseMs: 12,
    rrfMs: 1,
    rerankerMs: 28,
    guardrailMs: 5,
    generationMs: 18,
    answer: undefined,
    citations: [],
    sttDetails: {
      provider: "Hosted Whisper v3",
      latencyMs: 44,
      confidence: 0.94,
      fallbackUsed: false,
    },
    guardrailDecision: {
      status: "ABSTAIN",
      evidenceCoverage: 0.31,
      retrievalConfidence: 0.31,
      contradictionScore: 0.45,
      answerability: "LOW",
      decision: "ABSTAIN",
      reason:
        "I found related information, but the available evidence is not strong enough to answer this question confidently.",
    },
    candidates: [],
  },
];

export const MOCK_SYSTEM_STATUS: SystemStatus = {
  overall: "READY",
  lastChecked: "2 sec ago",
  services: [
    { name: "API Gateway", status: "healthy", details: "0.4ms latency", lastChecked: "2s ago" },
    { name: "Vector Store (Qdrant)", status: "healthy", details: "4.2K vectors", lastChecked: "2s ago" },
    { name: "Primary STT (Hosted)", status: "healthy", details: "Whisper v3 active", lastChecked: "2s ago" },
    { name: "Fallback STT (Local)", status: "healthy", details: "Ready", lastChecked: "2s ago" },
    { name: "Embedding Model", status: "healthy", details: "text-embedding-3-small", lastChecked: "2s ago" },
    { name: "Cross-Encoder Reranker", status: "healthy", details: "ms-marco-MiniLM-L-6-v2", lastChecked: "2s ago" },
    { name: "Generator LLM", status: "healthy", details: "gpt-4o-mini", lastChecked: "2s ago" },
  ],
};

export const MOCK_BENCHMARK_RUN: BenchmarkRun = {
  id: "bench-v1.4",
  datasetName: "VoiceRAG-Bench v1",
  queryCount: 500,
  hardware: "NVIDIA RTX 4090 / AMD EPYC 7763",
  commitHash: "b4df7936",
  timestamp: "2026-08-13 10:15 UTC",
  metrics: {
    p50: 124,
    p70: 148,
    p95: 215,
    p99: 310,
    stageLatencies: [
      { stage: "STT", ms: 42 },
      { stage: "Query", ms: 3 },
      { stage: "BM25", ms: 7 },
      { stage: "Dense", ms: 11 },
      { stage: "RRF", ms: 1 },
      { stage: "Reranker", ms: 28 },
      { stage: "Generation", ms: 72 },
    ],
    recallAt5: 0.884,
    recallAt10: 0.942,
    mrr: 0.891,
    ndcg: 0.915,
    groundedness: 0.962,
    correctness: 0.941,
    abstentionPrecision: 0.985,
  },
};

export const MOCK_EXPERIMENTS: ExperimentComparison[] = [
  {
    name: "Baseline (Dense Only)",
    recallAt10: 0.812,
    mrr: 0.764,
    p50Ms: 98,
    p95Ms: 165,
    chunking: "Fixed 512",
    retrieval: "Dense Top-10",
    reranking: "None",
    stt: "Hosted Whisper",
  },
  {
    name: "Semantic Hybrid",
    recallAt10: 0.895,
    mrr: 0.841,
    p50Ms: 112,
    p95Ms: 185,
    chunking: "Semantic",
    retrieval: "BM25 + Dense + RRF",
    reranking: "None",
    stt: "Hosted Whisper",
  },
  {
    name: "VoiceRAG Production (Hybrid + Adaptive Rerank)",
    recallAt10: 0.942,
    mrr: 0.891,
    p50Ms: 124,
    p95Ms: 215,
    chunking: "Structure-Aware",
    retrieval: "BM25 + Dense + RRF",
    reranking: "Adaptive Cross-Encoder",
    stt: "Hosted + Local Fallback",
  },
];

export const MOCK_SETTINGS: SystemSettings = {
  sttProvider: "Hosted",
  sttFallback: "Local",
  denseTopK: 10,
  sparseTopK: 10,
  rrfK: 60,
  rerankingMode: "Adaptive",
  rerankingThreshold: 0.72,
  abstentionThreshold: 0.72,
  generationModel: "gpt-4o-mini",
  generationTemperature: 0.0,
};

// Client API Helper functions with fallback
export async function getHealthStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (res.ok) {
      return MOCK_SYSTEM_STATUS;
    }
  } catch {
    // Fall back to mock when server is offline
  }
  return MOCK_SYSTEM_STATUS;
}

export async function getKnowledgeBaseStatus(): Promise<KnowledgeBaseStatus> {
  return MOCK_KNOWLEDGE_BASE;
}

export async function getDocuments(): Promise<Document[]> {
  return MOCK_DOCUMENTS;
}

export async function getDocumentById(id: string): Promise<Document | undefined> {
  return MOCK_DOCUMENTS.find((d) => d.id === id || d.name === id);
}

export async function getChunksForDocument(docId: string): Promise<Chunk[]> {
  return MOCK_CHUNKS.filter((c) => c.documentId === docId || c.documentName === docId);
}

export async function getRuns(): Promise<PipelineRun[]> {
  return MOCK_RUNS;
}

export async function getRunById(runId: string): Promise<PipelineRun | undefined> {
  return MOCK_RUNS.find((r) => r.runId === runId || r.runId === `#${runId}`);
}

export async function getBenchmarkRun(): Promise<BenchmarkRun> {
  return MOCK_BENCHMARK_RUN;
}

export async function getExperiments(): Promise<ExperimentComparison[]> {
  return MOCK_EXPERIMENTS;
}

export async function getSettings(): Promise<SystemSettings> {
  return MOCK_SETTINGS;
}
