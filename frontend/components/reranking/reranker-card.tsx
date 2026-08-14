"use client";

import { RerankerDecision } from "@/lib/types";
import { Cpu, CheckCircle2, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RerankerCardProps {
  decision: RerankerDecision;
}

export function RerankerCard({ decision }: RerankerCardProps) {
  const isEnabled = decision.status === "ENABLED";

  return (
    <div className="rounded border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-accent" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            [Reranker Decision]
          </h3>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded border px-3 py-1 font-mono text-xs font-bold",
            isEnabled
              ? "border-accent/20 bg-accent/5 text-accent"
              : "border-success/20 bg-success/5 text-success"
          )}
        >
          {isEnabled ? (
            <>
              <Zap className="h-3.5 w-3.5" />
              <span>[ENABLED]</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>[SKIPPED]</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded border border-border bg-muted p-3 font-mono text-xs font-medium text-foreground/90">
          <span className="font-bold text-muted-foreground">Reasoning: </span>
          {decision.reason}
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Query Complexity]</span>
            <div className="mt-1 font-bold text-foreground">{decision.queryComplexity}</div>
          </div>
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Agreement]</span>
            <div className="mt-1 font-bold text-foreground">
              {(decision.denseSparseAgreement * 100).toFixed(0)}%
            </div>
          </div>
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Score Margin]</span>
            <div className="mt-1 font-bold text-foreground">
              {decision.topScoreMargin.toFixed(2)}
            </div>
          </div>
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Latency]</span>
            <div className="mt-1 flex items-center gap-1 font-bold text-accent">
              <Clock className="h-3 w-3" />
              {isEnabled ? `${decision.latencyMs}ms` : "0ms (Saved ~31ms)"}
            </div>
          </div>
        </div>

        {isEnabled && (
          <div className="flex items-center justify-between rounded border border-accent/20 bg-accent/5 px-4 py-2 font-mono text-xs text-accent">
            <span>Candidates Filtered:</span>
            <span className="font-bold">
              {decision.candidatesBefore} → {decision.candidatesAfter} candidates
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
