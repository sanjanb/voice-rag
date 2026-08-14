"use client";

import { useState } from "react";
import { RetrievalCandidate } from "@/lib/types";
import { Layers, Database, Sparkles, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetrievalVisProps {
  candidates: RetrievalCandidate[];
}

export function RetrievalVis({ candidates }: RetrievalVisProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<RetrievalCandidate | null>(
    candidates[0] || null
  );

  const denseSorted = [...candidates].sort((a, b) => (b.denseScore || 0) - (a.denseScore || 0));
  const sparseSorted = [...candidates].sort((a, b) => (b.sparseScore || 0) - (a.sparseScore || 0));
  const rrfSorted = [...candidates].sort((a, b) => (b.rrfScore || 0) - (a.rrfScore || 0));

  return (
    <div className="rounded border border-border bg-card p-6 shadow-sm">
      <div className="border-b border-border pb-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
          [Retrieval & Fusion Visualization]
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Dual-stream Dense (Semantic) + BM25 (Lexical) fusion via Reciprocal Rank Fusion (RRF k=60)
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stream Comparisons */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* BM25 Column */}
            <div className="rounded border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                <Database className="h-3.5 w-3.5 text-primary" />
                <span>[BM25 Sparse]</span>
              </div>
              <div className="mt-3 space-y-2 font-mono text-xs">
                {sparseSorted.slice(0, 4).map((c, idx) => (
                  <div
                    key={c.chunkId}
                    onClick={() => setSelectedCandidate(c)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded border p-1.5 transition-colors",
                      selectedCandidate?.chunkId === c.chunkId
                        ? "border-primary/30 bg-primary/10 text-primary font-bold"
                        : "border-transparent hover:bg-muted"
                    )}
                  >
                    <span className="max-w-[100px] truncate">{c.chunkId}</span>
                    <span className="text-muted-foreground">{(c.sparseScore || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dense Column */}
            <div className="rounded border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                <Layers className="h-3.5 w-3.5 text-accent" />
                <span>[Dense Embeddings]</span>
              </div>
              <div className="mt-3 space-y-2 font-mono text-xs">
                {denseSorted.slice(0, 4).map((c, idx) => (
                  <div
                    key={c.chunkId}
                    onClick={() => setSelectedCandidate(c)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded border p-1.5 transition-colors",
                      selectedCandidate?.chunkId === c.chunkId
                        ? "border-primary/30 bg-primary/10 text-primary font-bold"
                        : "border-transparent hover:bg-muted"
                    )}
                  >
                    <span className="max-w-[100px] truncate">{c.chunkId}</span>
                    <span className="text-muted-foreground">{(c.denseScore || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RRF Fused Candidates */}
          <div className="rounded border border-success/20 bg-success/5 p-4">
            <div className="flex items-center gap-2 border-b border-success/20 pb-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-success">
              <Sparkles className="h-4 w-4" />
              <span>[Final RRF Candidates]</span>
            </div>
            <div className="mt-3 divide-y divide-border/40 font-mono text-xs">
              {rrfSorted.map((c, idx) => (
                <div
                  key={c.chunkId}
                  onClick={() => setSelectedCandidate(c)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded px-2 py-2 transition-colors",
                    selectedCandidate?.chunkId === c.chunkId
                      ? "bg-success/10 font-bold text-success"
                      : "text-muted-foreground hover:bg-success/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-success">#{idx + 1}</span>
                    <span className="text-foreground">{c.chunkId}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-muted-foreground">{c.documentName}</span>
                    <span className="font-bold text-success">
                      {(c.rrfScore || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Candidate Inspector */}
        <div className="rounded border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                [Candidate Content Inspector]
              </span>
            </div>
            {selectedCandidate && (
              <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                {selectedCandidate.chunkId}
              </span>
            )}
          </div>

          {selectedCandidate ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-3 font-mono text-xs">
                <div className="rounded border border-border bg-card px-2.5 py-1">
                  <span className="text-muted-foreground">Doc: </span>
                  <span className="font-bold text-foreground">{selectedCandidate.documentName}</span>
                </div>
                {selectedCandidate.pageNumber && (
                  <div className="rounded border border-border bg-card px-2.5 py-1">
                    <span className="text-muted-foreground">Page: </span>
                    <span className="font-bold text-foreground">{selectedCandidate.pageNumber}</span>
                  </div>
                )}
                {selectedCandidate.rrfScore && (
                  <div className="rounded border border-success/20 bg-success/5 px-2.5 py-1 text-success">
                    <span className="text-muted-foreground">RRF Score: </span>
                    <span className="font-bold">{selectedCandidate.rrfScore.toFixed(4)}</span>
                  </div>
                )}
              </div>

              <div className="rounded border border-border bg-card p-3 font-mono text-xs leading-relaxed text-foreground/90">
                "{selectedCandidate.content}"
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center font-mono text-xs text-muted-foreground">
              [Click any candidate above to inspect content]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
