"use client";

import { useEffect, useState } from "react";
import { getExperiments } from "@/lib/api";
import { ExperimentComparison } from "@/lib/types";
import { FlaskConical, Layers, Zap, Clock, CheckCircle2 } from "lucide-react";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentComparison[]>([]);

  useEffect(() => {
    getExperiments().then(setExperiments);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
          <FlaskConical className="h-4 w-4" />
          <span>RESEARCH & ABLATION LAB</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          Experiment Comparison
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Side-by-side comparison across chunking strategies, retrieval algorithms, reranking, and STT providers
        </p>
      </div>

      {/* Experiment Matrix Table */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Metric / Configuration</th>
              {experiments.map((exp) => (
                <th key={exp.name} className="px-4 py-3 font-bold text-foreground">
                  {exp.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            <tr>
              <td className="px-4 py-3 font-bold text-muted-foreground">Recall@10</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 font-bold text-emerald-400">
                  {(exp.recallAt10 * 100).toFixed(1)}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-muted-foreground">MRR</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 font-bold text-foreground">
                  {exp.mrr.toFixed(3)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-muted-foreground">P50 Latency</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 font-semibold text-primary">
                  {exp.p50Ms}ms
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-muted-foreground">P95 Latency</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 text-muted-foreground">
                  {exp.p95Ms}ms
                </td>
              ))}
            </tr>
            <tr className="bg-muted/20">
              <td className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px]">Chunking Strategy</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 text-foreground">{exp.chunking}</td>
              ))}
            </tr>
            <tr className="bg-muted/20">
              <td className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px]">Retrieval Pipeline</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 text-foreground">{exp.retrieval}</td>
              ))}
            </tr>
            <tr className="bg-muted/20">
              <td className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px]">Reranker</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 text-foreground">{exp.reranking}</td>
              ))}
            </tr>
            <tr className="bg-muted/20">
              <td className="px-4 py-3 font-bold text-muted-foreground uppercase text-[10px]">STT Provider</td>
              {experiments.map((exp) => (
                <td key={exp.name} className="px-4 py-3 text-foreground">{exp.stt}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
