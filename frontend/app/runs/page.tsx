"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRuns } from "@/lib/api";
import { PipelineRun } from "@/lib/types";
import { Activity, Clock, CheckCircle2, ShieldAlert, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RunsPage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);

  useEffect(() => {
    getRuns().then(setRuns);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pipeline Runs</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Complete execution history, latency breakdown, and query traces
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
          <Activity className="h-4 w-4 text-primary" />
          <span>{runs.length} Total Runs</span>
        </div>
      </div>

      {/* Runs Table */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-border bg-muted/40 uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Run ID</th>
              <th className="px-4 py-3">Query</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {runs.map((run) => (
              <tr key={run.runId} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-bold text-primary">{run.runId}</td>
                <td className="px-4 py-3 font-sans text-foreground/90 font-medium max-w-xs truncate">
                  "{run.query}"
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                      run.status === "Complete" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                      run.status === "Abstained" && "border-amber-500/30 bg-amber-500/10 text-amber-400",
                      run.status === "Failed" && "border-destructive/30 bg-destructive/10 text-destructive"
                    )}
                  >
                    {run.status === "Complete" && <CheckCircle2 className="h-3 w-3" />}
                    {run.status === "Abstained" && <ShieldAlert className="h-3 w-3" />}
                    {run.status === "Failed" && <XCircle className="h-3 w-3" />}
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {run.totalLatencyMs}ms
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{run.timestamp}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/runs/${run.runId.replace("#", "")}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    Inspect <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
