export interface Workspace {
  id: string;
  name: string;
  documentCount: number;
  chunkCount: number;
  status: "ready" | "processing" | "empty";
  lastUpdated: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: "processing" | "ready" | "failed" | "uploading";
  chunks: number;
  date: string;
  size: number;
  pages?: number;
  characters?: number;
  embeddingsCount?: number;
  parser?: string;
  chunkingStrategy?: string;
  chunkSize?: number;
  overlap?: number;
  sparseIndex?: string;
  denseIndex?: string;
  metadata: Record<string, unknown>;
}

export interface Chunk {
  id: string;
  documentId: string;
  documentName?: string;
  content: string;
  tokenCount: number;
  strategy: string;
  headingPath: string[];
  pageNumber?: number;
  metadata: Record<string, unknown>;
}

export interface ProcessingStage {
  name: string;
  status: "waiting" | "running" | "complete" | "failed" | "skipped";
  progress?: number;
  duration?: number;
  details?: string;
}

export interface KnowledgeBaseStatus {
  totalDocuments: number;
  totalChunks: number;
  processingCount: number;
  readyCount: number;
  status: "ready" | "processing" | "empty" | "error";
  lastUpdated: string;
}

export type PipelineStageName =
  | "STT"
  | "QUERY"
  | "BM25"
  | "DENSE"
  | "RRF"
  | "RERANKER"
  | "GUARDRAIL"
  | "GENERATION"
  | "VERIFICATION";

export interface PipelineStageEvent {
  stage: PipelineStageName;
  status: "waiting" | "running" | "complete" | "failed" | "skipped";
  durationMs?: number;
  details?: string;
}

export interface RetrievalCandidate {
  chunkId: string;
  documentName: string;
  content: string;
  denseScore?: number;
  denseRank?: number;
  sparseScore?: number;
  sparseRank?: number;
  rrfScore?: number;
  rrfRank?: number;
  rerankScore?: number;
  rerankRank?: number;
  pageNumber?: number;
}

export interface RerankerDecision {
  status: "ENABLED" | "SKIPPED";
  reason: string;
  queryComplexity: "LOW" | "MEDIUM" | "HIGH";
  denseSparseAgreement: number;
  topScoreMargin: number;
  evidenceConfidence: number;
  candidatesBefore: number;
  candidatesAfter: number;
  latencyMs: number;
}

export interface GuardrailDecision {
  status: "PASS" | "ABSTAIN";
  evidenceCoverage: number;
  retrievalConfidence: number;
  contradictionScore: number;
  answerability: "HIGH" | "MEDIUM" | "LOW";
  decision: "ANSWER" | "ABSTAIN";
  reason?: string;
}

export interface Citation {
  id: number;
  chunkId: string;
  documentName: string;
  pageNumber: number;
  score: number;
  snippet: string;
}

export interface PipelineRun {
  runId: string;
  query: string;
  status: "Complete" | "Abstained" | "Failed";
  timestamp: string;
  totalLatencyMs: number;
  sttMs: number;
  queryMs: number;
  bm25Ms: number;
  denseMs: number;
  rrfMs: number;
  rerankerMs: number;
  guardrailMs: number;
  generationMs: number;
  answer?: string;
  citations: Citation[];
  rerankerDecision?: RerankerDecision;
  guardrailDecision?: GuardrailDecision;
  candidates: RetrievalCandidate[];
  sttDetails?: {
    provider: string;
    latencyMs: number;
    confidence: number;
    fallbackUsed: boolean;
    fallbackReason?: string;
  };
}

export interface SystemServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "unavailable";
  details?: string;
  lastChecked: string;
}

export interface SystemStatus {
  overall: "READY" | "DEGRADED" | "UNAVAILABLE";
  services: SystemServiceStatus[];
  lastChecked: string;
}

export interface BenchmarkMetrics {
  p50: number;
  p70: number;
  p95: number;
  p99: number;
  stageLatencies: { stage: string; ms: number }[];
  recallAt5: number;
  recallAt10: number;
  mrr: number;
  ndcg: number;
  groundedness: number;
  correctness: number;
  abstentionPrecision: number;
}

export interface BenchmarkRun {
  id: string;
  datasetName: string;
  queryCount: number;
  hardware: string;
  commitHash: string;
  timestamp: string;
  metrics: BenchmarkMetrics;
}

export interface ExperimentComparison {
  name: string;
  recallAt10: number;
  mrr: number;
  p50Ms: number;
  p95Ms: number;
  chunking: string;
  retrieval: string;
  reranking: string;
  stt: string;
}

export interface SystemSettings {
  sttProvider: "Hosted" | "Local" | "Hybrid";
  sttFallback: "Local" | "None";
  denseTopK: number;
  sparseTopK: number;
  rrfK: number;
  rerankingMode: "Adaptive" | "Always" | "Never";
  rerankingThreshold: number;
  abstentionThreshold: number;
  generationModel: string;
  generationTemperature: number;
}