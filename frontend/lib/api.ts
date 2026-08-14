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

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getHealthStatus(): Promise<SystemStatus> {
  const data = await fetchJson<SystemStatus>("/api/system/status");
  return data ?? {
    overall: "UNAVAILABLE",
    lastChecked: new Date().toISOString(),
    services: [],
  };
}

export async function getKnowledgeBaseStatus(): Promise<KnowledgeBaseStatus> {
  const data = await fetchJson<KnowledgeBaseStatus>("/api/system/knowledge-base");
  return data ?? {
    totalDocuments: 0,
    totalChunks: 0,
    processingCount: 0,
    readyCount: 0,
    status: "empty",
    lastUpdated: new Date().toISOString(),
  };
}

export async function getDocuments(): Promise<Document[]> {
  const data = await fetchJson<Document[]>("/api/documents");
  return data ?? [];
}

export async function getDocumentById(id: string): Promise<Document | undefined> {
  const data = await fetchJson<Document>(`/api/documents/${encodeURIComponent(id)}`);
  return data ?? undefined;
}

export async function getChunksForDocument(docId: string): Promise<Chunk[]> {
  const data = await fetchJson<Chunk[]>(`/api/documents/${encodeURIComponent(docId)}/chunks`);
  return data ?? [];
}

export async function getRuns(): Promise<PipelineRun[]> {
  const data = await fetchJson<PipelineRun[]>("/api/runs");
  return data ?? [];
}

export async function getRunById(runId: string): Promise<PipelineRun | undefined> {
  const data = await fetchJson<PipelineRun>(`/api/runs/${encodeURIComponent(runId)}`);
  return data ?? undefined;
}

export async function getBenchmarkRun(): Promise<BenchmarkRun | null> {
  const data = await fetchJson<BenchmarkRun>("/api/system/benchmarks");
  return data;
}

export async function getExperiments(): Promise<ExperimentComparison[]> {
  const data = await fetchJson<ExperimentComparison[]>("/api/system/experiments");
  return data ?? [];
}

export async function getSettings(): Promise<SystemSettings | null> {
  const data = await fetchJson<SystemSettings>("/api/system/settings");
  return data;
}

export async function askQuestion(query: string): Promise<{
  request_id: string;
  decision: string;
  answer: string | null;
  citations: Array<Record<string, unknown>>;
  transcript: string | null;
  metrics: Record<string, unknown>;
  errors: Array<Record<string, unknown>>;
} | null> {
  const data = await fetchJson<{
    request_id: string;
    decision: string;
    answer: string | null;
    citations: Array<Record<string, unknown>>;
    transcript: string | null;
    metrics: Record<string, unknown>;
    errors: Array<Record<string, unknown>>;
  }>("/api/ask", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  return data;
}

export async function transcribeAudio(file: File): Promise<{
  request_id: string;
  decision: string;
  answer: string | null;
  citations: Array<Record<string, unknown>>;
  transcript: string | null;
  metrics: Record<string, unknown>;
  errors: Array<Record<string, unknown>>;
} | null> {
  const formData = new FormData();
  formData.append("audio", file);
  try {
    const res = await fetch(`${API_BASE}/api/transcribe`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      request_id: string;
      decision: string;
      answer: string | null;
      citations: Array<Record<string, unknown>>;
      transcript: string | null;
      metrics: Record<string, unknown>;
      errors: Array<Record<string, unknown>>;
    };
  } catch {
    return null;
  }
}

export async function uploadDocument(file: File): Promise<Document | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Document;
  } catch {
    return null;
  }
}