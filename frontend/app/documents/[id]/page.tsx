"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DocumentDetail } from "@/components/documents/document-detail";
import { type Document, type Chunk, type ProcessingStage } from "@/lib/types";

// TODO: replace with real API calls
const mockDocuments: Record<string, Document> = {
  "1": {
    id: "1",
    name: "product-spec.pdf",
    type: "PDF",
    status: "ready",
    chunks: 142,
    date: "2026-08-12",
    size: 2048576,
    metadata: { author: "Product Team", version: "1.0", pages: 15, language: "en" },
  },
  "2": {
    id: "2",
    name: "api-reference.md",
    type: "Markdown",
    status: "ready",
    chunks: 87,
    date: "2026-08-11",
    size: 512000,
    metadata: { author: "Engineering", version: "2.3", headings: 42, language: "en" },
  },
  "3": {
    id: "3",
    name: "meeting-notes.jsonl",
    type: "JSONL",
    status: "processing",
    chunks: 0,
    date: "2026-08-13",
    size: 102400,
    metadata: { author: "Team Lead", meeting: "Q3 Planning", participants: 8, language: "en" },
  },
  "4": {
    id: "4",
    name: "design-tokens.json",
    type: "JSON",
    status: "failed",
    chunks: 0,
    date: "2026-08-10",
    size: 256000,
    metadata: { author: "Design Team", format: "Figma tokens", colors: 48, language: "en" },
  },
};

const mockChunks: Record<string, Chunk[]> = {
  "1": Array.from({ length: 142 }, (_, i) => ({
    id: `chunk-${i + 1}`,
    documentId: "1",
    content: `This is chunk ${i + 1} of the product specification document. It contains detailed information about the product features, requirements, and technical specifications. The content is quite extensive and covers multiple aspects of the product design. `.repeat(3),
    tokenCount: 245 + Math.floor(Math.random() * 50),
    strategy: "semantic",
    headingPath: ["Product Overview", "Features", `Feature ${Math.floor(i / 10) + 1}`],
    metadata: { page: Math.floor(i / 10) + 1, section: `Feature ${Math.floor(i / 10) + 1}` },
  })),
  "2": Array.from({ length: 87 }, (_, i) => ({
    id: `chunk-${i + 1}`,
    documentId: "2",
    content: `API Reference chunk ${i + 1} covering endpoint definitions, parameters, and response formats. This markdown document provides comprehensive API documentation. `.repeat(2),
    tokenCount: 180 + Math.floor(Math.random() * 40),
    strategy: "heading",
    headingPath: ["API Reference", "Endpoints", `Endpoint ${Math.floor(i / 5) + 1}`],
    metadata: { endpoint: `/api/v1/resource${Math.floor(i / 5) + 1}`, method: ["GET", "POST", "PUT", "DELETE"][i % 4] },
  })),
  "3": [],
  "4": [],
};

const mockProcessingStages: Record<string, ProcessingStage[]> = {
  "1": [
    { name: "Parsing", status: "complete", duration: 2.3, details: "Extracted 15 pages, 3,241 words, 12 tables, 8 images" },
    { name: "Chunking", status: "complete", duration: 1.1, details: "Created 142 chunks using semantic strategy, avg 245 tokens/chunk" },
    { name: "Embedding", status: "complete", duration: 12.4, details: "Generated embeddings with text-embedding-3-large (batch size: 32)" },
    { name: "Indexing", status: "complete", duration: 4.2, details: "Upserted 142 vectors to Pinecone index 'voice-rag-prod'" },
  ],
  "2": [
    { name: "Parsing", status: "complete", duration: 0.8, details: "Parsed markdown, extracted 42 headings, 1,847 words" },
    { name: "Chunking", status: "complete", duration: 0.5, details: "Created 87 chunks using heading strategy, avg 195 tokens/chunk" },
    { name: "Embedding", status: "complete", duration: 8.1, details: "Generated embeddings with text-embedding-3-large (batch size: 32)" },
    { name: "Indexing", status: "complete", duration: 2.8, details: "Upserted 87 vectors to Pinecone index 'voice-rag-prod'" },
  ],
  "3": [
    { name: "Parsing", status: "complete", duration: 0.3, details: "Parsed JSONL, 247 lines, 12,450 words" },
    { name: "Chunking", status: "complete", duration: 0.2, details: "Created 156 chunks using line strategy, avg 85 tokens/chunk" },
    { name: "Embedding", status: "running", duration: 0, details: "Generating embeddings with text-embedding-3-large (batch size: 32)" },
    { name: "Indexing", status: "waiting", duration: 0, details: "Will upsert to Pinecone index 'voice-rag-prod'" },
  ],
  "4": [
    { name: "Parsing", status: "complete", duration: 0.5, details: "Parsed JSON, extracted 48 color tokens, 12 spacing tokens" },
    { name: "Chunking", status: "failed", duration: 0.1, details: "Failed: Unsupported JSON structure for chunking" },
    { name: "Embedding", status: "waiting", duration: 0, details: "Skipped due to chunking failure" },
    { name: "Indexing", status: "waiting", duration: 0, details: "Skipped due to chunking failure" },
  ],
};

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [stages, setStages] = useState<ProcessingStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with real API calls
    const fetchData = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300)); // Simulate network delay
      setDocument(mockDocuments[id] || null);
      setChunks(mockChunks[id] || []);
      setStages(mockProcessingStages[id] || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Details</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Details</h1>
          </div>
        </div>
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">Document not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocumentDetail
        document={document}
        chunks={chunks}
        processingStages={stages}
        onEdit={() => {
          // TODO: implement edit
          console.log("Edit document:", id);
        }}
        onDelete={() => {
          // TODO: implement delete
          console.log("Delete document:", id);
        }}
        onBack={() => window.history.back()}
      />
    </div>
  );
}