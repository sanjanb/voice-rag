"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Search,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  Cpu,
  Check,
  Loader2,
} from "lucide-react";
import { PipelineStageEvent, PipelineStageName } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LivePipelineProps {
  stages: Record<PipelineStageName, PipelineStageEvent>;
  activeStage: PipelineStageName | null;
  totalLatencyMs?: number;
}

interface NodeDef {
  id: PipelineStageName;
  label: string;
  icon: typeof Mic;
  parallelWith?: PipelineStageName;
}

const NODES: NodeDef[] = [
  { id: "STT", label: "STT", icon: Mic },
  { id: "QUERY", label: "QUERY", icon: Search },
  { id: "BM25", label: "BM25", icon: Database },
  { id: "DENSE", label: "DENSE", icon: Layers, parallelWith: "BM25" },
  { id: "RRF", label: "RRF", icon: Sparkles },
  { id: "RERANKER", label: "RERANKER", icon: Cpu },
  { id: "GUARDRAIL", label: "GUARDRAIL", icon: ShieldCheck },
  { id: "GENERATION", label: "GENERATOR", icon: Cpu },
];

export function LivePipeline({ stages, totalLatencyMs }: LivePipelineProps) {
  const renderNode = (id: PipelineStageName, label: string, Icon: typeof Mic) => {
    const stage = stages[id] || { stage: id, status: "waiting" };
    const isRunning = stage.status === "running";
    const isComplete = stage.status === "complete";
    const isFailed = stage.status === "failed";
    const isSkipped = stage.status === "skipped";

    return (
      <div className="flex flex-col items-center">
        <motion.div
          animate={isRunning ? { scale: [1, 1.06, 1] } : {}}
          transition={isRunning ? { duration: 1, repeat: Infinity } : {}}
          className={cn(
            "relative flex h-14 w-28 flex-col items-center justify-center rounded border p-2 shadow-sm transition-all",
            isComplete && "border-success/30 bg-success/5 text-success",
            isRunning && "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(30,58,95,0.15)]",
            isSkipped && "border-accent/20 bg-accent/5 text-accent opacity-60",
            isFailed && "border-destructive bg-destructive/5 text-destructive",
            stage.status === "waiting" && "border-border bg-muted text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wide uppercase">
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </div>

          <div className="mt-1 flex items-center gap-1 font-mono text-[10px] font-bold">
            {isRunning && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-primary">[RUNNING]</span>
              </>
            )}
            {isComplete && (
              <>
                <Check className="h-3 w-3 text-success" />
                <span>[{stage.durationMs ?? 0}ms]</span>
              </>
            )}
            {isSkipped && <span>[SKIPPED]</span>}
            {stage.status === "waiting" && <span>[WAITING]</span>}
          </div>
        </motion.div>

        {stage.details && (
          <span className="mt-1 max-w-[130px] truncate text-center font-mono text-[10px] text-muted-foreground">
            {stage.details}
          </span>
        )}
      </div>
    );
  };

  const renderConnector = (active: boolean) => (
    <div className="flex justify-center py-1.5">
      <div
        className={cn(
          "h-4 w-0.5 transition-colors",
          active ? "bg-success shadow-[0_0_8px_rgba(5,150,105,0.3)]" : "bg-border"
        )}
      />
    </div>
  );

  return (
    <div className="rounded border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            [Live Pipeline Trace]
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time backend execution DAG & stage latencies
          </p>
        </div>
        {totalLatencyMs !== undefined && (
          <div className="rounded border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-xs font-bold text-primary">
            [TOTAL: {totalLatencyMs}ms]
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center justify-center space-y-1">
        {/* STT */}
        {renderNode("STT", "STT", Mic)}
        {renderConnector(stages.STT.status === "complete")}

        {/* QUERY */}
        {renderNode("QUERY", "QUERY", Search)}
        {renderConnector(stages.QUERY.status === "complete")}

        {/* Parallel BM25 & DENSE */}
        <div className="flex items-center gap-6">
          {renderNode("BM25", "BM25", Database)}
          {renderNode("DENSE", "DENSE", Layers)}
        </div>
        {renderConnector(stages.BM25.status === "complete" && stages.DENSE.status === "complete")}

        {/* RRF */}
        {renderNode("RRF", "RRF", Sparkles)}
        {renderConnector(stages.RRF.status === "complete")}

        {/* RERANKER */}
        {renderNode("RERANKER", "RERANKER", Cpu)}
        {renderConnector(stages.RERANKER.status === "complete")}

        {/* GUARDRAIL */}
        {renderNode("GUARDRAIL", "GUARDRAIL", ShieldCheck)}
        {renderConnector(stages.GUARDRAIL.status === "complete")}

        {/* GENERATOR */}
        {renderNode("GENERATION", "GENERATOR", Cpu)}
      </div>
    </div>
  );
}
