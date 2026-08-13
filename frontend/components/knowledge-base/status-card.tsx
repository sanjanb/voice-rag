"use client";

import { FileText, Layers, Activity, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type KnowledgeBaseStatus } from "@/lib/types";

interface StatusCardProps {
  status: KnowledgeBaseStatus;
  compact?: boolean;
}

export function StatusCard({ status, compact = false }: StatusCardProps) {
  const getStatusConfig = () => {
    switch (status.status) {
      case "ready":
        return { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Ready" };
      case "processing":
        return { icon: Loader2, color: "text-amber-400", bg: "bg-amber-500/10", label: "Processing" };
      case "empty":
        return { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/20", label: "Empty" };
      case "error":
        return { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Error" };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.bg)}>
                <StatusIcon className={cn("h-4 w-4", config.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="font-bold font-mono">{status.totalDocuments}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Chunks</p>
                <p className="font-bold font-mono">{status.totalChunks}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.bg)}>
                <StatusIcon className={cn("h-4 w-4", config.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={status.status === "ready" ? "success" : status.status === "processing" ? "warning" : "danger"}>
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Knowledge Base Status</h3>
          <Badge variant={status.status === "ready" ? "success" : status.status === "processing" ? "warning" : "danger"} className="gap-1.5">
            <StatusIcon className={cn("h-3 w-3", config.color)} />
            {config.label}
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-3xl font-bold font-mono">{status.totalDocuments}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Chunks</p>
              <p className="text-3xl font-bold font-mono">{status.totalChunks}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Activity className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-3xl font-bold font-mono">{status.processingCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready</p>
              <p className="text-3xl font-bold font-mono">{status.readyCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}