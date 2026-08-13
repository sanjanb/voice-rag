"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Edit,
  Trash2,
  FileText,
  Layers,
  Info,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type Document, type Chunk, type ProcessingStage } from "@/lib/types";
import { ChunkList } from "./chunk-list";

const statusConfig: Record<Document["status"], { label: string; variant: "warning" | "success" | "danger" | "secondary" }> = {
  processing: { label: "Processing", variant: "warning" },
  ready: { label: "Ready", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  uploading: { label: "Uploading", variant: "secondary" },
};

const statusIcons = {
  processing: Loader2,
  ready: CheckCircle,
  failed: AlertCircle,
  uploading: Loader2,
};

interface DocumentDetailProps {
  document: Document;
  chunks: Chunk[];
  processingStages: ProcessingStage[];
  onEdit?: () => void;
  onDelete?: () => void;
  onBack: () => void;
}

export function DocumentDetail({
  document,
  chunks,
  processingStages,
  onEdit,
  onDelete,
  onBack,
}: DocumentDetailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "chunks" | "metadata">("overview");

  const StatusIcon = statusIcons[document.status];
  const statusCfg = statusConfig[document.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold">{document.name}</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {document.type} • {document.size > 0 ? `${(document.size / 1024).toFixed(1)} KB` : "Unknown size"} • Uploaded {document.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusCfg.variant} className="gap-1.5">
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </Badge>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chunks</p>
                <p className="text-2xl font-bold font-mono">{document.chunks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold font-mono">
                  {document.status === "ready" ? document.chunks : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold font-mono">
                  {document.status === "processing" ? document.chunks : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Layers className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stages</p>
                <p className="text-2xl font-bold font-mono">
                  {processingStages.filter((s) => s.status === "complete").length} / {processingStages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "chunks" | "metadata")}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            <Info className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chunks" className="flex-1">
            <Layers className="h-4 w-4 mr-2" />
            Chunks ({chunks.length})
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Metadata
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Timeline</CardTitle>
              <CardDescription>Document processing stages and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {processingStages.length > 0 ? (
                <div className="space-y-4">
                  {processingStages.map((stage, index) => {
                    const isLast = index === processingStages.length - 1;
                    const isComplete = stage.status === "complete";
                    const isRunning = stage.status === "running";
                    const isFailed = stage.status === "failed";

                    return (
                      <div key={stage.name} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border-2",
                              isComplete && "bg-emerald-400 border-emerald-400",
                              isRunning && "bg-primary border-primary animate-pulse",
                              isFailed && "bg-red-400 border-red-400",
                              !isComplete && !isRunning && !isFailed && "border-muted bg-card"
                            )}
                          >
                            {isComplete ? (
                              <CheckCircle className="h-4 w-4 text-emerald-900" />
                            ) : isRunning ? (
                              <Loader2 className="h-4 w-4 text-primary animate-spin" />
                            ) : isFailed ? (
                              <AlertCircle className="h-4 w-4 text-red-900" />
                            ) : (
                              <span className="text-xs font-mono text-muted-foreground">{index + 1}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "h-full w-0.5 mt-1",
                                isComplete ? "bg-emerald-400" : "bg-border"
                              )}
                            />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{stage.name}</span>
                            {stage.duration && (
                              <span className="font-mono text-xs text-muted-foreground">
                                {stage.duration}s
                              </span>
                            )}
                          </div>
                          {stage.details && (
                            <p className="mt-1 text-sm text-muted-foreground font-mono">{stage.details}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant={
                                isComplete ? "success" : isRunning ? "warning" : isFailed ? "danger" : "muted"
                              }
                            >
                              {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No processing timeline available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Document ID</p>
                <p className="font-mono text-sm">{document.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-mono text-sm">{document.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-mono text-sm">
                  {document.size > 0 ? `${(document.size / 1024).toFixed(1)} KB` : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upload Date</p>
                <p className="font-mono text-sm">{document.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Chunks</p>
                <p className="font-mono text-sm">{document.chunks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chunks Tab */}
        <TabsContent value="chunks">
          <ChunkList chunks={chunks} />
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Document Metadata</CardTitle>
              <CardDescription>Key-value metadata extracted from the document</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(document.metadata).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(document.metadata).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start gap-4 rounded-lg border p-4"
                    >
                      <div className="flex-shrink-0 w-40 font-mono text-sm text-muted-foreground">
                        {key}
                      </div>
                      <div className="flex-1 font-mono text-sm break-all">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No metadata available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}