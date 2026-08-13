"use client";

import { useEffect, useState } from "react";
import { getBenchmarkRun } from "@/lib/api";
import { BenchmarkRun } from "@/lib/types";
import { BarChart3, Cpu, GitCommit, Database, Zap, ShieldCheck } from "lucide-react";

export default function BenchmarksPage() {
  const [bench, setBench] = useState<BenchmarkRun | null>(null);

  useEffect(() => {
    getBenchmarkRun().then(setBench);
  }, []);

  if (!bench) {
    return (
      <div className="rounded-2xl border border-border p-8 text-center text-muted-foreground font-mono text-xs">
        Loading benchmark evaluation metrics...
      </div>
    );
  }

  const { metrics } = bench;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
          <BarChart3 className="h-4 w-4" />
          <span>EVALUATION SUITE</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          VoiceRAG Benchmarks
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Measured engineering performance across pipeline latency, retrieval accuracy, and answer grounding
        </p>
      </div>

      {/* Dataset & Hardware Context */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Database className="h-3.5 w-3.5" />
            <span>Dataset</span>
          </div>
          <div className="mt-1.5 font-bold text-foreground">{bench.datasetName}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            <span>Queries Evaluated</span>
          </div>
          <div className="mt-1.5 font-bold text-foreground">{bench.queryCount} queries</div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" />
            <span>Hardware</span>
          </div>
          <div className="mt-1.5 font-bold text-foreground truncate">{bench.hardware}</div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GitCommit className="h-3.5 w-3.5" />
            <span>Commit Hash</span>
          </div>
          <div className="mt-1.5 font-bold text-primary">{bench.commitHash}</div>
        </div>
      </div>

      {/* Pipeline Latency Percentiles */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border pb-3">
          Pipeline Latency Percentiles
        </h3>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 font-mono text-center">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-xs text-muted-foreground">P50 (Median)</span>
            <div className="mt-2 text-2xl font-extrabold text-emerald-400">{metrics.p50}ms</div>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <span className="text-xs text-muted-foreground">P70</span>
            <div className="mt-2 text-2xl font-extrabold text-blue-400">{metrics.p70}ms</div>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <span className="text-xs text-muted-foreground">P95</span>
            <div className="mt-2 text-2xl font-extrabold text-purple-400">{metrics.p95}ms</div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <span className="text-xs text-muted-foreground">P99</span>
            <div className="mt-2 text-2xl font-extrabold text-amber-400">{metrics.p99}ms</div>
          </div>
        </div>
      </div>

      {/* Retrieval & Answer Quality Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Retrieval Quality */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Retrieval Quality</span>
            <Zap className="h-4 w-4 text-primary" />
          </h3>
          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Recall@5:</span>
              <span className="font-bold text-foreground">{(metrics.recallAt5 * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Recall@10:</span>
              <span className="font-bold text-emerald-400 font-extrabold">{(metrics.recallAt10 * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">MRR (Mean Reciprocal Rank):</span>
              <span className="font-bold text-foreground">{metrics.mrr.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">nDCG (Normalized Discounted Cumulative Gain):</span>
              <span className="font-bold text-foreground">{metrics.ndcg.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Answer Quality */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Answer Quality & Grounding</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </h3>
          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Groundedness Score:</span>
              <span className="font-bold text-emerald-400 font-extrabold">{(metrics.groundedness * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Factual Correctness:</span>
              <span className="font-bold text-foreground">{(metrics.correctness * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Abstention Precision:</span>
              <span className="font-bold text-emerald-400">{(metrics.abstentionPrecision * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
