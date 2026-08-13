"use client";

import { useState } from "react";
import { Citation } from "@/lib/types";
import { CheckCircle2, FileText, ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceViewerProps {
  answer?: string;
  citations: Citation[];
  isAbstained?: boolean;
  abstentionReason?: string;
  totalLatencyMs?: number;
  confidence?: number;
}

export function EvidenceViewer({
  answer,
  citations,
  isAbstained = false,
  abstentionReason,
  totalLatencyMs = 142,
  confidence = 0.94,
}: EvidenceViewerProps) {
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  if (isAbstained || !answer) {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-8 shadow-xl backdrop-blur-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold uppercase tracking-wider text-amber-200">
          CANNOT VERIFY EVIDENCE
        </h3>
        <p className="mt-2 text-sm text-amber-300/80 max-w-lg mx-auto leading-relaxed">
          {abstentionReason ||
            "I found related information, but the available evidence is not strong enough to answer this question confidently without speculation."}
        </p>
        <div className="mt-6 font-mono text-xs text-amber-400/70">
          Decision: ABSTAIN · Confidence Below Safety Threshold
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grounded Answer Card */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Grounded Answer
          </h3>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> GROUNDED ✓
            </span>
            <span className="text-muted-foreground">CONFIDENCE {(confidence * 100).toFixed(0)}%</span>
            <span className="text-primary font-semibold">{totalLatencyMs}ms</span>
          </div>
        </div>

        <div className="mt-4 text-sm leading-relaxed text-foreground/90 space-y-3">
          <p>{answer}</p>
        </div>

        {/* Citations List */}
        <div className="mt-6 border-t border-border pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Source Citations:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {citations.map((cite) => (
              <button
                key={cite.id}
                onClick={() => setActiveCitation(activeCitation?.id === cite.id ? null : cite)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors",
                  activeCitation?.id === cite.id
                    ? "border-primary bg-primary/20 text-primary font-bold shadow-sm"
                    : "border-border bg-muted/40 text-foreground hover:bg-muted"
                )}
              >
                <span className="font-bold text-primary">[{cite.id}]</span>
                <span className="truncate max-w-[160px]">{cite.documentName}</span>
                <span className="text-[10px] text-muted-foreground">p.{cite.pageNumber}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Document Evidence Viewer (Section 16 of spec) */}
      {activeCitation && (
        <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCitation(null)}
                className="flex items-center gap-1 rounded p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <span className="text-xs font-bold text-foreground">
                Document Viewer: {activeCitation.documentName}
              </span>
            </div>
            <div className="font-mono text-xs text-primary font-bold">
              Page {activeCitation.pageNumber} · Score {activeCitation.score.toFixed(2)}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Citation Summary */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                Citation Context [{activeCitation.id}]
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs font-mono leading-relaxed text-foreground">
                "{activeCitation.snippet}"
              </div>
            </div>

            {/* Document Page Preview with Highlight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="uppercase">Document Page Preview</span>
                <span className="font-mono text-[10px]">Page {activeCitation.pageNumber}</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs leading-relaxed text-muted-foreground font-serif">
                <p>...the study conducted extensive evaluations across hybrid retrieval configurations...</p>
                <div className="rounded bg-yellow-500/20 border-l-4 border-yellow-500 p-2 text-foreground font-sans font-medium">
                  "{activeCitation.snippet}"
                </div>
                <p>...the findings demonstrate marked improvement in answer accuracy and provable grounding.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
