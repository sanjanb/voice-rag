"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProcessingPipeline } from "@/components/documents/processing-pipeline";
import { type ProcessingStage } from "@/lib/types";

// TODO: replace with real API call
const mockStages: ProcessingStage[] = [
  {
    name: "Parsing",
    status: "complete",
    duration: 2.3,
    details: "Extracted 15 pages, 3,241 words, 12 tables, 8 images",
  },
  {
    name: "Chunking",
    status: "complete",
    duration: 1.1,
    details: "Created 142 chunks using semantic strategy, avg 245 tokens/chunk",
  },
  {
    name: "Embedding",
    status: "running",
    duration: 0,
    details: "Generating embeddings with text-embedding-3-large (batch size: 32)",
  },
  {
    name: "Indexing",
    status: "waiting",
    duration: 0,
    details: "Will upsert to Pinecone index 'voice-rag-prod'",
  },
];

const mockDocumentNames: Record<string, string> = {
  "1": "product-spec.pdf",
  "2": "api-reference.md",
  "3": "meeting-notes.jsonl",
  "4": "design-tokens.json",
};

export default function ProcessingPage() {
  const params = useParams();
  const id = params.id as string;
  const documentName = mockDocumentNames[id] || `Document ${id}`;
  const [stages, setStages] = useState<ProcessingStage[]>(mockStages);
  const [isPolling, setIsPolling] = useState(true);

  // TODO: replace with real API polling
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      setStages((prev) => {
        const runningIndex = prev.findIndex((s) => s.status === "running");
        if (runningIndex === -1) {
          setIsPolling(false);
          return prev;
        }

        const next = [...prev];
        const current = next[runningIndex];

        // Simulate progress
        if (current.name === "Embedding" && !current.duration) {
          next[runningIndex] = { ...current, duration: Math.random() * 5 + 5 };
        } else if (current.name === "Embedding" && current.duration && current.duration > 10) {
          next[runningIndex] = { ...current, status: "complete", duration: 12.4 };
          // Start next stage
          if (runningIndex + 1 < next.length) {
            next[runningIndex + 1] = { ...next[runningIndex + 1], status: "running" };
          }
        } else if (current.name === "Indexing" && current.duration && current.duration > 3) {
          next[runningIndex] = { ...current, status: "complete", duration: 4.2 };
          setIsPolling(false);
        }

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPolling]);

  return (
    <div className="space-y-6">
      <ProcessingPipeline
        stages={stages}
        documentName={documentName}
        onBack={() => window.history.back()}
        isPolling={isPolling}
      />
    </div>
  );
}