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
  complete: "text-emerald-400",
  error: "text-red-400",
};

const statusLabels = {
  pending: "Waiting",
  uploading: "Uploading",
  processing: "Processing",
  complete: "Complete",
  error: "Failed",
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
    <Card className="space-y-4">
      <CardContent className="space-y-4 p-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="font-mono text-muted-foreground">{overallProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {completeCount} complete
            </span>
          )}
          {errorCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              {errorCount} failed
            </span>
          )}
        </div>

        {/* File List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {files.map((upload) => {
            const Icon = statusIcons[upload.status];
            const color = statusColors[upload.status];
            const label = statusLabels[upload.status];

            return (
              <div
                key={upload.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Icon className={cn("h-4 w-4 shrink-0", color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground w-10 text-right">
                      {upload.progress}%
                    </span>
                    <span className={cn("text-xs", color)}>{label}</span>
                  </div>
                  {upload.error && (
                    <p className="mt-1 text-xs text-red-400">{upload.error}</p>
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
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClear} disabled={isUploading}>
            Clear All
          </Button>
          <Button onClick={onUploadAll} disabled={isUploading || pendingCount === 0}>
            {isUploading ? "Uploading..." : "Upload All"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}