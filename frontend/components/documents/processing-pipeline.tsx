"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Circle,
  Ban,
  ChevronDown,
  FileText,
  Scissors,
  Brain,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type ProcessingStage } from "@/lib/types";

const stageIcons = {
  Parsing: FileText,
  Chunking: Scissors,
  Embedding: Brain,
  Indexing: Database,
};

const stageDescriptions = {
  Parsing: "Extract text and structure from document",
  Chunking: "Split content into semantic chunks",
  Embedding: "Generate vector embeddings for chunks",
  Indexing: "Store embeddings in vector database",
};

interface ProcessingPipelineProps {
  stages: ProcessingStage[];
  documentName: string;
  onBack: () => void;
  isPolling?: boolean;
}

export function ProcessingPipeline({
  stages,
  documentName,
  onBack,
  isPolling = false,
}: ProcessingPipelineProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);



  const getStatusIcon = (status: ProcessingStage["status"]) => {
    switch (status) {
      case "waiting":
        return <Circle className="h-5 w-5 text-muted-foreground/30" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "complete":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "skipped":
        return <Ban className="h-5 w-5 text-muted-foreground/50" />;
    }
  };

  const getStatusBadge = (status: ProcessingStage["status"]) => {
    switch (status) {
      case "waiting":
        return <Badge variant="muted">Waiting</Badge>;
      case "running":
        return <Badge variant="warning">Running</Badge>;
      case "complete":
        return <Badge variant="success">Complete</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      case "skipped":
        return <Badge variant="muted">Skipped</Badge>;
    }
  };

  const completedStages = stages.filter((s) => s.status === "complete").length;
  const totalStages = stages.length;
  const overallProgress = Math.round((completedStages / totalStages) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processing Pipeline</h1>
          <p className="mt-1 text-muted-foreground">{documentName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{overallProgress}%</span>
            <span>Complete</span>
          </div>
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronDown className="h-4 w-4" />
            Back to Documents
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="font-mono text-muted-foreground">{overallProgress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedStages} of {totalStages} stages complete</span>
              {isPolling && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Polling...
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = stageIcons[stage.name as keyof typeof stageIcons] || Circle;
          const isLast = index === stages.length - 1;
          const isExpanded = expandedStage === stage.name;

          return (
            <Card key={stage.name} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start gap-4">
                  {/* Connector line */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 bg-card">
                      {getStatusIcon(stage.status)}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "h-full w-0.5 mt-1",
                          stage.status === "complete" ? "bg-emerald-400" : "bg-border"
                        )}
                      />
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{stage.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{stageDescriptions[stage.name as keyof typeof stageDescriptions] || ""}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm">
                      {getStatusBadge(stage.status)}
                      {stage.duration && (
                        <span className="font-mono text-muted-foreground">
                          {stage.duration}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setExpandedStage(isExpanded ? null : stage.name)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                </div>
              </CardHeader>

              {/* Expanded Details */}
              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="ml-14 border-l-2 border-border pl-4 space-y-3">
                    {stage.details && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Details</p>
                        <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{stage.details}</pre>
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{stage.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-mono font-medium">
                          {stage.duration ? `${stage.duration}s` : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stage</p>
                        <p className="font-medium">{index + 1} of {totalStages}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}