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
      <div className="rounded border border-accent/30 bg-accent/5 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-accent/15 text-accent">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-mono text-xs font-bold uppercase tracking-wider text-accent">
          [CANNOT VERIFY EVIDENCE]
        </h3>
        <p className="mt-2 mx-auto max-w-lg text-sm leading-relaxed text-foreground/80">
          {abstentionReason ||
            "I found related information, but the available evidence is not strong enough to answer this question confidently without speculation."}
        </p>
        <div className="mt-6 font-mono text-xs text-muted-foreground">
          Decision: ABSTAIN · Confidence Below Safety Threshold
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grounded Answer Card */}
      <div className="rounded border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            [Grounded Answer]
          </h3>
          <div className="flex items-center gap-3 font-mono text-xs font-bold">
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> [GROUNDED]
            </span>
            <span className="text-muted-foreground">[{(confidence * 100).toFixed(0)}%]</span>
            <span className="text-primary">[{totalLatencyMs}ms]</span>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">
          <p>{answer}</p>
        </div>

        {/* Citations List */}
        <div className="mt-6 border-t border-border pt-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            [Source Citations]
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {citations.map((cite) => (
              <button
                key={cite.id}
                onClick={() => setActiveCitation(activeCitation?.id === cite.id ? null : cite)}
                className={cn(
                  "flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs transition-colors",
                  activeCitation?.id === cite.id
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                <span className="font-bold text-primary">[{cite.id}]</span>
                <span className="max-w-[160px] truncate">{cite.documentName}</span>
                <span className="text-[10px] text-muted-foreground">p.{cite.pageNumber}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Document Evidence Viewer (Section 16 of spec) */}
      {activeCitation && (
        <div className="rounded border border-primary/30 bg-card p-6 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCitation(null)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>[Back]</span>
              </button>
              <span className="font-mono text-xs font-bold text-foreground">
                [Document Viewer: {activeCitation.documentName}]
              </span>
            </div>
            <div className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-bold text-primary">
              Page {activeCitation.pageNumber} · Score {activeCitation.score.toFixed(2)}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Citation Summary */}
            <div className="space-y-3">
              <div className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                [Citation Context [{activeCitation.id}]]
              </div>
              <div className="rounded border border-border bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
                "{activeCitation.snippet}"
              </div>
            </div>

            {/* Document Page Preview with Highlight */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold text-muted-foreground">
                <span className="uppercase">[Document Page Preview]</span>
                <span>Page {activeCitation.pageNumber}</span>
              </div>
              <div className="rounded border border-border bg-background p-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
                <p>...the study conducted extensive evaluations across hybrid retrieval configurations...</p>
                <div className="rounded border-l-4 border-accent bg-accent/10 p-2 text-sm font-medium text-foreground">
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
