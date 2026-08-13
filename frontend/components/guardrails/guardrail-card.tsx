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
        "rounded-2xl border p-6 shadow-xl backdrop-blur-md transition-all",
        isPass
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-500/40 bg-amber-500/10"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          {isPass ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-400" />
          )}
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Guardrail Verification
          </h3>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold border shadow-sm",
            isPass
              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
              : "border-amber-500/40 bg-amber-500/20 text-amber-400"
          )}
        >
          {isPass ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>✓ PASS</span>
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" />
              <span>⊘ ABSTAIN</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {!isPass && decision.reason && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            <span className="font-bold">Abstention Notice: </span>
            {decision.reason}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Evidence Coverage</span>
            <div className="mt-1 font-bold text-foreground">
              {(decision.evidenceCoverage * 100).toFixed(0)}%
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Confidence</span>
            <div className="mt-1 font-bold text-foreground">
              {decision.retrievalConfidence.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Contradiction</span>
            <div className="mt-1 font-bold text-foreground">
              {decision.contradictionScore.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="text-[10px] text-muted-foreground uppercase">Answerability</span>
            <div
              className={cn(
                "mt-1 font-bold",
                decision.answerability === "HIGH"
                  ? "text-emerald-400"
                  : decision.answerability === "MEDIUM"
                    ? "text-amber-400"
                    : "text-red-400"
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
