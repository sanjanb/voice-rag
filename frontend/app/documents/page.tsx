"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="mt-1 text-muted-foreground">
            Manage files in your knowledge base.
          </p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Knowledge Base Status */}
      <StatusCard status={mockKBStatus} compact />

      {/* Upload Zone */}
      {showUpload && (
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload Documents</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowUpload(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

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
      <DocumentTable
        documents={mockDocuments}
        onRowClick={(doc) => {
          // Navigation handled by DocumentTable via Link
        }}
      />
    </div>
  );
}