"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [".txt", ".md", ".json", ".jsonl", ".pdf"];
const ACCEPT_MIME = "text/plain,text/markdown,application/json,text/csv,application/pdf";

interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress?: number;
}

interface UploadZoneProps {
  onUpload?: (files: File[]) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return ACCEPTED_TYPES.includes(ext);
  };

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const valid = Array.from(files).filter(validateFile);
      if (valid.length === 0) return;

      const newUploads = valid.map((file) => ({ file, status: "pending" as const }));
      setUploads((prev) => [...prev, ...newUploads]);
      onUpload?.(valid);
    },
    [onUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-mono text-xs font-bold text-foreground">[Drop files here or click to browse]</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            Supports {ACCEPTED_TYPES.join(", ")}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_MIME}
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, i) => (
            <div
              key={`${upload.file.name}-${i}`}
              className="flex items-center gap-3 rounded border border-border bg-card px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate font-mono text-xs text-foreground">{upload.file.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {(upload.file.size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={() => removeFile(i)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
