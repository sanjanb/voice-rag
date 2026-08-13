"use client";

import { useState, useCallback } from "react";
import { PipelineStageEvent, PipelineStageName } from "@/lib/types";

export interface PipelineEventsState {
  isExecuting: boolean;
  activeStage: PipelineStageName | null;
  stages: Record<PipelineStageName, PipelineStageEvent>;
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

export function usePipelineEvents() {
  const [state, setState] = useState<PipelineEventsState>({
    isExecuting: false,
    activeStage: null,
    stages: INITIAL_STAGES,
  });

  const resetPipeline = useCallback(() => {
    setState({
      isExecuting: false,
      activeStage: null,
      stages: INITIAL_STAGES,
    });
  }, []);

  const simulatePipelineRun = useCallback(async (question: string) => {
    resetPipeline();
    setState((prev) => ({ ...prev, isExecuting: true }));

    const sequence: { stage: PipelineStageName; duration: number; details: string }[] = [
      { stage: "STT", duration: 42, details: "Hosted Whisper v3 (42ms)" },
      { stage: "QUERY", duration: 3, details: "Complexity: MEDIUM" },
      { stage: "BM25", duration: 7, details: "Top-10 sparse candidates" },
      { stage: "DENSE", duration: 11, details: "Top-10 dense candidates" },
      { stage: "RRF", duration: 1, details: "k=60 rank fusion" },
      { stage: "RERANKER", duration: 31, details: "Adaptive rerank (ENABLED)" },
      { stage: "GUARDRAIL", duration: 4, details: "Status: PASS (0.94 coverage)" },
      { stage: "GENERATION", duration: 78, details: "GPT-4o mini grounded generation" },
      { stage: "VERIFICATION", duration: 5, details: "Claim verification complete" },
    ];

    for (const step of sequence) {
      // Set current stage to running
      setState((prev) => ({
        ...prev,
        activeStage: step.stage,
        stages: {
          ...prev.stages,
          [step.stage]: {
            stage: step.stage,
            status: "running",
          },
        },
      }));

      // Simulate step duration
      await new Promise((resolve) => setTimeout(resolve, Math.max(150, step.duration * 4)));

      // Set stage to complete
      setState((prev) => ({
        ...prev,
        stages: {
          ...prev.stages,
          [step.stage]: {
            stage: step.stage,
            status: "complete",
            durationMs: step.duration,
            details: step.details,
          },
        },
      }));
    }

    setState((prev) => ({
      ...prev,
      isExecuting: false,
      activeStage: null,
    }));
  }, [resetPipeline]);

  return {
    ...state,
    resetPipeline,
    simulatePipelineRun,
  };
}
