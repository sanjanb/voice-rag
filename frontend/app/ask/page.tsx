"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/voice/voice-recorder";
import { WaveformVisualizer } from "@/components/voice/waveform-visualizer";
import { TranscriptPreview } from "@/components/voice/transcript-preview";
import { VoiceStatusBar } from "@/components/voice/voice-status-bar";
import { LivePipeline } from "@/components/pipeline/live-pipeline";
import { RetrievalVis } from "@/components/retrieval/retrieval-vis";
import { RerankerCard } from "@/components/reranking/reranker-card";
import { GuardrailCard } from "@/components/guardrails/guardrail-card";
import { EvidenceViewer } from "@/components/answer/evidence-viewer";
import { usePipelineEvents } from "@/hooks/usePipelineEvents";
import { MOCK_RUNS } from "@/lib/api";
import { MessageSquare, Sparkles } from "lucide-react";

type RecorderState =
  | "idle"
  | "listening"
  | "recording"
  | "stopped"
  | "transcribing"
  | "query_ready";

function mockSTT(_audioChunks: Blob[]): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("What are the main conclusions from the research paper?");
    }, 1200);
  });
}

export default function AskPage() {
  const [state, setState] = useState<RecorderState>("idle");
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [micPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [hasRun, setHasRun] = useState(false);

  const pipeline = usePipelineEvents();
  const recordingStartTimeRef = useRef<number>(0);
  const latestRun = MOCK_RUNS[0];

  useEffect(() => {
    const el = document.getElementById("voice-recorder-host");
    if (!el) return;

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<AnalyserNode>;
      setAnalyserNode(customEvent.detail);
    };

    el.addEventListener("analyser-ready", handler);
    return () => el.removeEventListener("analyser-ready", handler);
  }, []);

  const handleRecordingStart = useCallback(() => {
    recordingStartTimeRef.current = Date.now();
    setDuration(0);
  }, []);

  const handleRecordingStop = useCallback(() => {
    const elapsed = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
    setDuration(elapsed);
    setState("transcribing");
  }, []);

  const handleRecordingComplete = useCallback(
    (audioBlob: Blob) => {
      mockSTT([audioBlob]).then((result) => {
        setTranscript(result);
        setState("query_ready");
      });
    },
    []
  );

  const handleSubmit = useCallback(
    async (query: string) => {
      setHasRun(true);
      await pipeline.simulatePipelineRun(query);
    },
    [pipeline]
  );

  const handleReRecord = useCallback(() => {
    setTranscript("");
    setState("idle");
    setHasRun(false);
    pipeline.resetPipeline();
  }, [pipeline]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-mono font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>RESEARCH LAB VOICE INTERFACE</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
          Ask Your Documents
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Speak naturally — real-time STT, dual-stream retrieval, RRF, reranking & grounded answer
        </p>
      </div>

      {/* Main Recorder Section */}
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border border-border bg-card/50 p-8 shadow-xl backdrop-blur-md">
        <VoiceRecorder
          onTranscriptReady={setTranscript}
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
          onRecordingComplete={handleRecordingComplete}
          state={state}
          onStateChange={setState}
        />

        {/* Waveform */}
        <AnimatePresence>
          {(state === "recording" || state === "listening") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 100 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              <WaveformVisualizer
                analyserNode={analyserNode}
                isRecording={state === "recording"}
                className="h-[100px]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status bar */}
        <VoiceStatusBar
          state={state}
          micPermission={micPermission}
          duration={duration}
        />

        {/* Transcript preview */}
        <AnimatePresence>
          {state === "query_ready" && transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full"
            >
              <TranscriptPreview
                transcript={transcript}
                isTranscribing={false}
                onSubmit={handleSubmit}
                onReRecord={handleReRecord}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State before query */}
      {!hasRun && state === "idle" && (
        <div className="flex flex-col items-center gap-4 text-center py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No active query run</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the microphone above to speak your question or select a sample paper query
            </p>
          </div>
        </div>
      )}

      {/* Live Pipeline Execution Trace & Spec Visualizations */}
      {hasRun && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Live Pipeline DAG */}
          <LivePipeline
            stages={pipeline.stages}
            activeStage={pipeline.activeStage}
            totalLatencyMs={latestRun.totalLatencyMs}
          />

          {/* Dual Retrieval & RRF Candidate Comparator */}
          <RetrievalVis candidates={latestRun.candidates} />

          {/* Reranker & Guardrail Decision Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {latestRun.rerankerDecision && (
              <RerankerCard decision={latestRun.rerankerDecision} />
            )}
            {latestRun.guardrailDecision && (
              <GuardrailCard decision={latestRun.guardrailDecision} />
            )}
          </div>

          {/* Grounded Answer & Citation Evidence Split Viewer */}
          <EvidenceViewer
            answer={latestRun.answer}
            citations={latestRun.citations}
            totalLatencyMs={latestRun.totalLatencyMs}
          />
        </div>
      )}
    </div>
  );
}
