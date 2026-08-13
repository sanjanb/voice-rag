"use client";

import { useState } from "react";
import { Network, Mic, Search, Database, Layers, Sparkles, Cpu, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentDetail {
  id: string;
  name: string;
  purpose: string;
  model: string;
  inputs: string;
  outputs: string;
  latency: string;
  fallback: string;
  failureBehavior: string;
}

const COMPONENTS: ComponentDetail[] = [
  {
    id: "stt",
    name: "Speech-To-Text (STT)",
    purpose: "Converts streaming audio input into raw query text.",
    model: "Hosted Whisper v3 / Local Whisper.cpp",
    inputs: "Streaming PCM Audio (16kHz WAV / WebM Opus)",
    outputs: "Transcribed Text string + confidence score",
    latency: "~42 ms",
    fallback: "Automatic failover to Local Whisper.cpp model",
    failureBehavior: "Returns STT_FAILED error stage",
  },
  {
    id: "query",
    name: "Query Analysis & Intent Classifier",
    purpose: "Analyzes query complexity, ambiguity, and multi-hop structure.",
    model: "Deterministic Regex + Heuristic Classifier",
    inputs: "Transcribed query text",
    outputs: "QueryAnalysis (DifficultyClass EASY/HARD, multi_hop bool)",
    latency: "~3 ms",
    fallback: "Default to EASY classification",
    failureBehavior: "Continues with default search plan",
  },
  {
    id: "bm25",
    name: "BM25 Sparse Search",
    purpose: "Lexical exact term matching across document corpus.",
    model: "Rank-BM25 (k1=1.5, b=0.75)",
    inputs: "Normalized query tokens",
    outputs: "Top-20 Lexical Candidates with BM25 scores",
    latency: "~7 ms",
    fallback: "Skip sparse stream if unindexed",
    failureBehavior: "Rely solely on Dense embeddings",
  },
  {
    id: "dense",
    name: "Dense Vector Search",
    purpose: "Semantic similarity search in high-dimensional vector space.",
    model: "text-embedding-3-small (1536-dim) + Qdrant HNSW",
    inputs: "1536d query embedding vector",
    outputs: "Top-20 Semantic Candidates with Cosine scores",
    latency: "~11 ms",
    fallback: "Retry with cached vector index",
    failureBehavior: "Rely solely on BM25 sparse results",
  },
  {
    id: "rrf",
    name: "Reciprocal Rank Fusion (RRF)",
    purpose: "Fuses ranked candidates from Dense and Sparse streams into a unified candidate pool.",
    model: "RRF(d) = Σ 1 / (60 + rank(d))",
    inputs: "Dense & Sparse candidate rank lists",
    outputs: "Top-20 RRF Fused Candidate chunks",
    latency: "~1 ms",
    fallback: "Union of candidates with fallback scores",
    failureBehavior: "Returns raw Dense candidates",
  },
  {
    id: "reranker",
    name: "Cross-Encoder Reranker",
    purpose: "Jointly encodes query and candidate text for precise relevance re-scoring.",
    model: "ms-marco-MiniLM-L-6-v2",
    inputs: "Query + Candidate chunk pairs",
    outputs: "Top-5 Reranked candidates with Cross-Encoder scores",
    latency: "~31 ms",
    fallback: "SKIPPED when initial retrieval confidence is high (>0.85)",
    failureBehavior: "Pass RRF candidate order directly",
  },
  {
    id: "guardrail",
    name: "Answerability & Grounding Guardrail",
    purpose: "Evaluates candidate evidence coverage to decide whether to generate an answer or abstain.",
    model: "Contradiction & Coverage Verifier",
    inputs: "Query + Filtered candidate chunks",
    outputs: "GuardrailDecision (PASS / ABSTAIN)",
    latency: "~4 ms",
    fallback: "Abstain on uncertainty",
    failureBehavior: "Triggers safe ABSTAIN response",
  },
  {
    id: "generator",
    name: "LLM Generator",
    purpose: "Produces grounded natural language answers with explicit citations.",
    model: "gpt-4o-mini",
    inputs: "Grounded prompt context + Verified evidence chunks",
    outputs: "GeneratedAnswer + Citations",
    latency: "~78 ms",
    fallback: "Retry with temperature 0.0",
    failureBehavior: "Returns GENERATION_FAILED exception",
  },
];

export default function ArchitecturePage() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentDetail>(COMPONENTS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
          <Network className="h-4 w-4" />
          <span>SYSTEM ARCHITECTURE & DIRECTORY</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          VoiceRAG Pipeline Architecture
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Click any component node to inspect models, latency, fallback mechanisms, and failure behaviors
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Node Diagram */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md flex flex-col items-center space-y-3 font-mono text-xs">
          {COMPONENTS.map((comp) => {
            const isSelected = selectedComponent.id === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedComponent(comp)}
                className={cn(
                  "w-full max-w-md flex items-center justify-between rounded-xl border p-3 transition-all text-left",
                  isSelected
                    ? "border-primary bg-primary/20 text-primary font-bold shadow-lg shadow-primary/10"
                    : "border-border bg-muted/30 text-foreground hover:bg-muted/60"
                )}
              >
                <span>{comp.name}</span>
                <span className="text-[10px] text-muted-foreground">{comp.latency}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Component Spec (Section 21 of UX spec) */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md space-y-4 font-mono text-xs">
          <div className="border-b border-border pb-3">
            <span className="text-[10px] text-primary uppercase font-bold">Component Details</span>
            <h3 className="text-base font-bold text-foreground font-sans mt-0.5">
              {selectedComponent.name}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground font-semibold">Purpose:</span>
              <p className="text-foreground font-sans mt-0.5 leading-relaxed">{selectedComponent.purpose}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold">Model / Provider:</span>
              <p className="text-primary font-bold">{selectedComponent.model}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold">Inputs:</span>
              <p className="text-foreground/90">{selectedComponent.inputs}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold">Outputs:</span>
              <p className="text-foreground/90">{selectedComponent.outputs}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold">Latency:</span>
              <p className="text-emerald-400 font-bold">{selectedComponent.latency}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold">Fallback Mechanism:</span>
              <p className="text-amber-300">{selectedComponent.fallback}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-semibold">Failure Behavior:</span>
              <p className="text-destructive font-semibold">{selectedComponent.failureBehavior}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
