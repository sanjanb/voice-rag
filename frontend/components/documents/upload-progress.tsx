"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface UploadProgressProps {
  files: UploadFile[];
  onCancel: (id: string) => void;
  onUploadAll: () => void;
  onClear: () => void;
  isUploading: boolean;
}

const statusIcons = {
  pending: FileText,
  uploading: Loader2,
  processing: Loader2,
  complete: CheckCircle,
  error: AlertCircle,
};

const statusColors = {
  pending: "text-muted-foreground",
  uploading: "text-primary",
  processing: "text-primary",
  complete: "text-success",
  error: "text-destructive",
};

const statusLabels = {
  pending: "[Waiting]",
  uploading: "[Uploading]",
  processing: "[Processing]",
  complete: "[Complete]",
  error: "[Failed]",
};

export function UploadProgress({
  files,
  onCancel,
  onUploadAll,
  onClear,
  isUploading,
}: UploadProgressProps) {
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (files.length === 0) {
      setOverallProgress(0);
      return;
    }
    const total = files.reduce((sum, f) => sum + f.progress, 0);
    setOverallProgress(Math.round(total / files.length));
  }, [files]);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading" || f.status === "processing").length;
  const completeCount = files.filter((f) => f.status === "complete").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  if (files.length === 0) return null;

  return (
    <Card className="mt-4 space-y-4">
      <CardContent className="space-y-4 p-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-foreground">[Overall Progress]</span>
            <span className="font-mono text-xs font-bold text-muted-foreground">{overallProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              {pendingCount} pending
            </span>
          )}
          {uploadingCount > 0 && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              {uploadingCount} uploading
            </span>
          )}
          {completeCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" />
              {completeCount} complete
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              {errorCount} failed
            </span>
          )}
        </div>

        {/* File List */}
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {files.map((upload) => {
            const Icon = statusIcons[upload.status];
            const color = statusColors[upload.status];
            const label = statusLabels[upload.status];

            return (
              <div
                key={upload.id}
                className="flex items-center gap-3 rounded border border-border p-3"
              >
                <Icon className={cn("h-4 w-4 shrink-0", color)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs font-medium text-foreground">{upload.file.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-[10px] font-bold text-muted-foreground">
                      {upload.progress}%
                    </span>
                    <span className={cn("font-mono text-[10px] font-bold", color)}>{label}</span>
                  </div>
                  {upload.error && (
                    <p className="mt-1 font-mono text-[10px] text-destructive">{upload.error}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCancel(upload.id)}
                  disabled={upload.status === "complete" || upload.status === "uploading" || upload.status === "processing"}
                  className="h-7 w-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
          <Button
            variant="outline"
            onClick={onClear}
            disabled={isUploading}
            className="rounded border-border bg-muted font-mono text-xs font-bold hover:bg-muted/80"
          >
            [Clear All]
          </Button>
          <Button
            onClick={onUploadAll}
            disabled={isUploading || pendingCount === 0}
            className="rounded bg-primary px-4 font-mono text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            {isUploading ? "[Uploading...]" : "[Upload All]"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
