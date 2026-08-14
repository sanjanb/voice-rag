"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentTable, type Document } from "@/components/documents/document-table";
import { UploadZone } from "@/components/documents/upload-zone";
import { UploadProgress, type UploadFile } from "@/components/documents/upload-progress";
import { StatusCard } from "@/components/knowledge-base/status-card";
import { type KnowledgeBaseStatus } from "@/lib/types";

// TODO: replace with real API call
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "product-spec.pdf",
    type: "PDF",
    status: "ready",
    chunks: 142,
    date: "2026-08-12",
    size: 2048576,
    metadata: { author: "Product Team", version: "1.0" },
  },
  {
    id: "2",
    name: "api-reference.md",
    type: "Markdown",
    status: "ready",
    chunks: 87,
    date: "2026-08-11",
    size: 512000,
    metadata: { author: "Engineering", version: "2.3" },
  },
  {
    id: "3",
    name: "meeting-notes.jsonl",
    type: "JSONL",
    status: "processing",
    chunks: 0,
    date: "2026-08-13",
    size: 102400,
    metadata: { author: "Team Lead", meeting: "Q3 Planning" },
  },
  {
    id: "4",
    name: "design-tokens.json",
    type: "JSON",
    status: "failed",
    chunks: 0,
    date: "2026-08-10",
    size: 256000,
    metadata: { author: "Design Team", format: "Figma tokens" },
  },
];

// TODO: replace with real API call
const mockKBStatus: KnowledgeBaseStatus = {
  totalDocuments: 4,
  totalChunks: 229,
  processingCount: 1,
  readyCount: 2,
  status: "processing",
  lastUpdated: "Just now",
};

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function DocumentsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      return [".txt", ".md", ".json", ".jsonl", ".pdf"].includes(ext);
    });
    if (valid.length === 0) return;

    const newUploads = valid.map((file) => ({
      id: generateId(),
      file,
      status: "pending" as const,
      progress: 0,
    }));
    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  const handleUploadAll = useCallback(async () => {
    const pendingFiles = uploads.filter((u) => u.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    for (const upload of pendingFiles) {
      // Update to uploading
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id ? { ...u, status: "uploading" as const, progress: 0 } : u
        )
      );

      // Simulate upload progress
      for (let p = 0; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 50));
        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, progress: p } : u
          )
        );
      }

      // Update to processing
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: "processing" as const, progress: 100 }
            : u
        )
      );

      // Simulate processing
      await new Promise((r) => setTimeout(r, 1000));

      // Complete
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id ? { ...u, status: "complete" as const } : u
        )
      );
    }

    setIsUploading(false);
    // TODO: replace with real API call to add documents to the list
    // For now, just clear the uploads after a delay
    setTimeout(() => {
      setUploads([]);
      setShowUpload(false);
    }, 1500);
  }, [uploads]);

  const pendingCount = uploads.filter((u) => u.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-primary">
            <FileText className="h-4 w-4" />
            <span>[DOCUMENT MANAGEMENT]</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Documents
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage files in your knowledge base.
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="gap-2 rounded bg-primary px-4 py-2 font-mono text-xs font-bold text-primary-foreground hover:bg-primary/90"
        >
          {showUpload ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showUpload ? "Cancel" : "Upload Files"}
        </Button>
      </div>

      {/* Knowledge Base Status */}
      <StatusCard status={mockKBStatus} compact />

      {/* Upload Zone */}
      {showUpload && (
        <Card className="overflow-hidden border-primary/20">
          <div className="border-b border-border bg-muted/50 px-4 py-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              [Upload Documents]
            </h2>
          </div>
          <CardContent className="p-6">
            <UploadZone onUpload={addFiles} />

            <UploadProgress
              files={uploads}
              onCancel={removeFile}
              onUploadAll={handleUploadAll}
              onClear={clearAll}
              isUploading={isUploading}
            />
          </CardContent>
        </Card>
      )}

      {/* Document Table */}
      <Card>
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              [Knowledge Base Documents]
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {mockDocuments.length} files · {mockKBStatus.totalChunks} chunks
            </span>
          </div>
        </div>
        <CardContent className="p-0">
          <DocumentTable
            documents={mockDocuments}
            onRowClick={(doc) => {
              // Navigation handled by DocumentTable via Link
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
