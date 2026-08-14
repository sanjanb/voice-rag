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
        return { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "[Ready]" };
      case "processing":
        return { icon: Loader2, color: "text-accent", bg: "bg-accent/10", label: "[Processing]" };
      case "empty":
        return { icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted", label: "[Empty]" };
      case "error":
        return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "[Error]" };
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
              <div className={cn("flex h-8 w-8 items-center justify-center rounded", config.bg)}>
                <StatusIcon className={cn("h-4 w-4", config.color)} />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">[Documents]</p>
                <p className="font-mono text-sm font-bold">{status.totalDocuments}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">[Total Chunks]</p>
                <p className="font-mono text-sm font-bold">{status.totalChunks}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded", config.bg)}>
                <StatusIcon className={cn("h-4 w-4", config.color)} />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">[Status]</p>
                <Badge variant={status.status === "ready" ? "success" : status.status === "processing" ? "warning" : "danger"} className="font-mono text-[10px] font-bold">
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
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            [Knowledge Base Status]
          </h3>
          <Badge variant={status.status === "ready" ? "success" : status.status === "processing" ? "warning" : "danger"} className="gap-1.5 font-mono text-[10px] font-bold">
            <StatusIcon className={cn("h-3 w-3", config.color)} />
            {config.label}
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">[Total Documents]</p>
              <p className="font-mono text-3xl font-bold">{status.totalDocuments}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">[Total Chunks]</p>
              <p className="font-mono text-3xl font-bold">{status.totalChunks}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-accent/10">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">[Processing]</p>
              <p className="font-mono text-3xl font-bold">{status.processingCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase text-muted-foreground">[Ready]</p>
              <p className="font-mono text-3xl font-bold">{status.readyCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
