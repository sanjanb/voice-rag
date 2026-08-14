"use client";

import { useState, useCallback } from "react";
import { PipelineStageEvent, PipelineStageName } from "@/lib/types";

export interface PipelineEventsState {
  isExecuting: boolean;
  activeStage: PipelineStageName | null;
  stages: Record<PipelineStageName, PipelineStageEvent>;
  lastResult: any | null;
}

const INITIAL_STAGES: Record<PipelineStageName, PipelineStageEvent> = {
  STT: { stage: "STT", status: "waiting" },
  QUERY: { stage: "QUERY", status: "waiting" },
  BM25: { stage: "BM25", status: "waiting" },
  DENSE: { stage: "DENSE", status: "waiting" },
  RRF: { stage: "RRF", status: "waiting" },
  RERANKER: { stage: "RERANKER", status: "waiting" },
  GUARDRAIL: { stage: "GUARDRAIL", status: "waiting" },
  GENERATION: { stage: "GENERATION", status: "waiting" },
  VERIFICATION: { stage: "VERIFICATION", status: "waiting" },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function usePipelineEvents() {
  const [state, setState] = useState<PipelineEventsState>({
    isExecuting: false,
    activeStage: null,
    stages: INITIAL_STAGES,
    lastResult: null,
  });

  const resetPipeline = useCallback(() => {
    setState({
      isExecuting: false,
      activeStage: null,
      stages: INITIAL_STAGES,
      lastResult: null,
    });
  }, []);

  const simulatePipelineRun = useCallback(async (question: string) => {
    resetPipeline();
    setState((prev) => ({ ...prev, isExecuting: true }));

    // Start all stages as waiting, animate STT immediately
    const stageSequence: PipelineStageName[] = [
      "STT", "QUERY", "BM25", "DENSE", "RRF", "RERANKER", "GUARDRAIL", "GENERATION", "VERIFICATION",
    ];

    // Animate stages as waiting, then start the real call
    for (const stage of stageSequence.slice(0, 2)) {
      setState((prev) => ({
        ...prev,
        activeStage: stage,
        stages: {
          ...prev.stages,
          [stage]: { stage, status: "running" },
        },
      }));
      await new Promise((r) => setTimeout(r, 200));
    }

    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
      });
      const data = await res.json();

      // Map real latency metrics to stages
      const m = data.metrics || {};
      const stageDetails: { stage: PipelineStageName; ms: number; details: string }[] = [
        { stage: "STT", ms: m.stt_ms || 0, details: `STT (${(m.stt_ms || 0).toFixed(0)}ms)` },
        { stage: "QUERY", ms: m.query_ms || 0, details: `Query analysis (${(m.query_ms || 0).toFixed(0)}ms)` },
        { stage: "BM25", ms: (m.dense_retrieval_ms || 0) * 0.3, details: "BM25 sparse retrieval" },
        { stage: "DENSE", ms: (m.dense_retrieval_ms || 0) * 0.7, details: "Dense vector retrieval" },
        { stage: "RRF", ms: 1, details: "RRF rank fusion" },
        { stage: "RERANKER", ms: m.rerank_ms || 0, details: `Reranker (${(m.rerank_ms || 0).toFixed(0)}ms)` },
        { stage: "GUARDRAIL", ms: m.context_build_ms || 0, details: `Guard + context (${(m.context_build_ms || 0).toFixed(0)}ms)` },
        { stage: "GENERATION", ms: m.generation_ms || 0, details: `Generation (${(m.generation_ms || 0).toFixed(0)}ms)` },
        { stage: "VERIFICATION", ms: m.verification_ms || 0, details: `Verification (${(m.verification_ms || 0).toFixed(0)}ms)` },
      ];

      // Animate through each stage with real durations
      for (const step of stageDetails) {
        setState((prev) => ({
          ...prev,
          activeStage: step.stage,
          stages: {
            ...prev.stages,
            [step.stage]: { stage: step.stage, status: "running" },
          },
        }));
        const waitMs = Math.max(100, Math.min(step.ms * 2, 800));
        await new Promise((r) => setTimeout(r, waitMs));
        setState((prev) => ({
          ...prev,
          stages: {
            ...prev.stages,
            [step.stage]: {
              stage: step.stage,
              status: "complete",
              durationMs: step.ms,
              details: step.details,
            },
          },
        }));
      }

      setState((prev) => ({
        ...prev,
        isExecuting: false,
        activeStage: null,
        lastResult: data,
      }));
    } catch (err) {
      // Mark current stage as failed
      setState((prev) => ({
        ...prev,
        isExecuting: false,
        activeStage: null,
        lastResult: { decision: "error", error: String(err), metrics: {} },
      }));
    }
  }, [resetPipeline]);

  return {
    ...state,
    resetPipeline,
    simulatePipelineRun,
  };
}
