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
    <div className="rounded-2xl border border-border bg-card/50 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Reranker Decision
          </h3>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold border shadow-sm",
            isEnabled
              ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          )}
        >
          {isEnabled ? (
            <>
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>ENABLED</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>SKIPPED</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="text-xs text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border font-medium">
          <span className="text-muted-foreground font-semibold">Reasoning: </span>
          {decision.reason}
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Query Complexity</span>
            <div className="mt-1 font-bold text-foreground">{decision.queryComplexity}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Agreement</span>
            <div className="mt-1 font-bold text-foreground">
              {(decision.denseSparseAgreement * 100).toFixed(0)}%
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Score Margin</span>
            <div className="mt-1 font-bold text-foreground">
              {decision.topScoreMargin.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Latency</span>
            <div className="mt-1 font-bold text-purple-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isEnabled ? `${decision.latencyMs}ms` : "0ms (Saved ~31ms)"}
            </div>
          </div>
        </div>

        {isEnabled && (
          <div className="flex items-center justify-between rounded-lg bg-purple-500/10 border border-purple-500/20 px-4 py-2 font-mono text-xs text-purple-300">
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
