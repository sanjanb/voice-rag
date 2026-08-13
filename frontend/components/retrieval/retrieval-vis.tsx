"use client";

import { useState } from "react";
import { RetrievalCandidate } from "@/lib/types";
import { Layers, Database, Sparkles, FileText, ChevronRight } from "lucide-react";
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
    <div className="rounded-2xl border border-border bg-card/50 p-6 shadow-xl backdrop-blur-md">
      <div className="border-b border-border pb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Retrieval & Fusion Visualization
        </h3>
        <p className="text-xs text-muted-foreground">
          Dual-stream Dense (Semantic) + BM25 (Lexical) fusion via Reciprocal Rank Fusion (RRF k=60)
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stream Comparisons */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* BM25 Column */}
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 text-xs font-semibold text-foreground">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                <span>BM25 Sparse</span>
              </div>
              <div className="mt-3 space-y-2 font-mono text-xs">
                {sparseSorted.slice(0, 4).map((c, idx) => (
                  <div
                    key={c.chunkId}
                    onClick={() => setSelectedCandidate(c)}
                    className={cn(
                      "flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors",
                      selectedCandidate?.chunkId === c.chunkId
                        ? "bg-primary/20 border border-primary/40 text-primary font-bold"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="truncate max-w-[100px]">{c.chunkId}</span>
                    <span className="text-muted-foreground">{(c.sparseScore || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dense Column */}
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 text-xs font-semibold text-foreground">
                <Layers className="h-3.5 w-3.5 text-purple-400" />
                <span>Dense Embeddings</span>
              </div>
              <div className="mt-3 space-y-2 font-mono text-xs">
                {denseSorted.slice(0, 4).map((c, idx) => (
                  <div
                    key={c.chunkId}
                    onClick={() => setSelectedCandidate(c)}
                    className={cn(
                      "flex items-center justify-between rounded-md p-1.5 cursor-pointer transition-colors",
                      selectedCandidate?.chunkId === c.chunkId
                        ? "bg-primary/20 border border-primary/40 text-primary font-bold"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="truncate max-w-[100px]">{c.chunkId}</span>
                    <span className="text-muted-foreground">{(c.denseScore || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RRF Fused Candidates */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2.5 text-xs font-bold text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span>Final RRF Candidates</span>
            </div>
            <div className="mt-3 divide-y divide-border/40 font-mono text-xs">
              {rrfSorted.map((c, idx) => (
                <div
                  key={c.chunkId}
                  onClick={() => setSelectedCandidate(c)}
                  className={cn(
                    "flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-colors",
                    selectedCandidate?.chunkId === c.chunkId
                      ? "bg-emerald-500/20 text-emerald-300 font-bold"
                      : "hover:bg-emerald-500/10 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">#{idx + 1}</span>
                    <span className="text-foreground">{c.chunkId}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-muted-foreground">{c.documentName}</span>
                    <span className="text-emerald-400 font-bold">
                      {(c.rrfScore || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Candidate Inspector */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Candidate Content Inspector</span>
            </div>
            {selectedCandidate && (
              <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                {selectedCandidate.chunkId}
              </span>
            )}
          </div>

          {selectedCandidate ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-3 font-mono text-xs">
                <div className="rounded border border-border bg-card px-2.5 py-1">
                  <span className="text-muted-foreground">Doc: </span>
                  <span className="text-foreground font-semibold">{selectedCandidate.documentName}</span>
                </div>
                {selectedCandidate.pageNumber && (
                  <div className="rounded border border-border bg-card px-2.5 py-1">
                    <span className="text-muted-foreground">Page: </span>
                    <span className="text-foreground font-semibold">{selectedCandidate.pageNumber}</span>
                  </div>
                )}
                {selectedCandidate.rrfScore && (
                  <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                    <span className="text-muted-foreground">RRF Score: </span>
                    <span className="font-semibold">{selectedCandidate.rrfScore.toFixed(4)}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-3 font-sans text-xs leading-relaxed text-foreground/90">
                "{selectedCandidate.content}"
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              Click any candidate above to inspect content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
