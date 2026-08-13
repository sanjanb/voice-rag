"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Chunk } from "@/lib/types";

interface ChunkListProps {
  chunks: Chunk[];
  pageSize?: number;
}

export function ChunkList({ chunks, pageSize = 10 }: ChunkListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(chunks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageChunks = chunks.slice(startIndex, endIndex);

  const toggleExpand = (chunkId: string) => {
    setExpandedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(chunkId)) {
        next.delete(chunkId);
      } else {
        next.add(chunkId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (chunks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No chunks available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chunk List */}
      <div className="space-y-2">
        {pageChunks.map((chunk, index) => {
          const isExpanded = expandedChunks.has(chunk.id);
          const preview = chunk.content.slice(0, 200) + (chunk.content.length > 200 ? "..." : "");

          return (
            <Card key={chunk.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 text-center text-muted-foreground/50 font-mono text-xs">
                    {startIndex + index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {chunk.strategy}
                      </Badge>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {chunk.tokenCount} tokens
                      </Badge>
                      {chunk.headingPath.length > 0 && (
                        <Badge variant="muted" className="text-xs truncate max-w-[200px]">
                          {chunk.headingPath.join(" > ")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                      {isExpanded ? chunk.content : preview}
                    </p>
                    {chunk.content.length > 200 && (
                      <button
                        onClick={() => toggleExpand(chunk.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(chunk.content)}
                      className="h-7 w-7"
                      title="Copy content"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                {Object.keys(chunk.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Metadata</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(chunk.metadata).map(([key, value]) => (
                        <div key={key} className="font-mono">
                          <span className="text-muted-foreground">{key}:</span>{" "}
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm font-mono text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Showing {pageChunks.length} of {chunks.length} chunks
      </p>
    </div>
  );
}