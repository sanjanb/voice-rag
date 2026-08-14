"use client";

import { GuardrailDecision } from "@/lib/types";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuardrailCardProps {
  decision: GuardrailDecision;
}

export function GuardrailCard({ decision }: GuardrailCardProps) {
  const isPass = decision.status === "PASS";

  return (
    <div
      className={cn(
        "rounded border p-6 shadow-sm transition-all",
        isPass
          ? "border-success/20 bg-success/5"
          : "border-accent/30 bg-accent/5"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          {isPass ? (
            <ShieldCheck className="h-5 w-5 text-success" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-accent" />
          )}
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            [Guardrail Verification]
          </h3>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded border px-3 py-1 font-mono text-xs font-bold",
            isPass
              ? "border-success/30 bg-success/10 text-success"
              : "border-accent/30 bg-accent/10 text-accent"
          )}
        >
          {isPass ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>[✓ PASS]</span>
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" />
              <span>[⊘ ABSTAIN]</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {!isPass && decision.reason && (
          <div className="rounded border border-accent/20 bg-accent/5 p-3 font-mono text-xs text-accent/80">
            <span className="font-bold">[Abstention Notice]: </span>
            {decision.reason}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Evidence Coverage]</span>
            <div className="mt-1 font-bold text-foreground">
              {(decision.evidenceCoverage * 100).toFixed(0)}%
            </div>
          </div>
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Confidence]</span>
            <div className="mt-1 font-bold text-foreground">
              {decision.retrievalConfidence.toFixed(2)}
            </div>
          </div>
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Contradiction]</span>
            <div className="mt-1 font-bold text-foreground">
              {decision.contradictionScore.toFixed(2)}
            </div>
          </div>
          <div className="rounded border border-border bg-card p-3">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">[Answerability]</span>
            <div
              className={cn(
                "mt-1 font-bold",
                decision.answerability === "HIGH"
                  ? "text-success"
                  : decision.answerability === "MEDIUM"
                    ? "text-accent"
                    : "text-destructive"
              )}
            >
              {decision.answerability}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

