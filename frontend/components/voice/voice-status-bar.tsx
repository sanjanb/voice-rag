"use client";

import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  AlertCircle,
} from "lucide-react";

type RecorderState =
  | "idle"
  | "listening"
  | "recording"
  | "stopped"
  | "transcribing"
  | "query_ready";

interface VoiceStatusBarProps {
  state: RecorderState;
  micPermission: "prompt" | "granted" | "denied";
  duration?: number;
  className?: string;
}

const stateLabel: Record<RecorderState, string> = {
  idle: "Ready",
  listening: "Requesting microphone…",
  recording: "Recording",
  stopped: "Recording complete",
  transcribing: "Transcribing…",
  query_ready: "Ready to ask",
};

const stateIndicator: Record<RecorderState, { symbol: string; color: string }> = {
  idle: { symbol: "○", color: "text-muted-foreground" },
  listening: { symbol: "◉", color: "text-warning" },
  recording: { symbol: "◉", color: "text-destructive" },
  stopped: { symbol: "✓", color: "text-success" },
  transcribing: { symbol: "◎", color: "text-primary animate-spin" },
  query_ready: { symbol: "✓", color: "text-primary" },
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceStatusBar({
  state,
  micPermission,
  duration,
  className,
}: VoiceStatusBarProps) {
  const indicator = stateIndicator[state];

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 text-xs text-muted-foreground",
        className
      )}
    >
      {/* Mic permission */}
      <span className="inline-flex items-center gap-1.5">
        {micPermission === "granted" ? (
          <Mic className="h-3 w-3 text-success" />
        ) : micPermission === "denied" ? (
          <MicOff className="h-3 w-3 text-destructive" />
        ) : (
          <AlertCircle className="h-3 w-3 text-warning" />
        )}
        {micPermission === "granted"
          ? "Mic connected"
          : micPermission === "denied"
            ? "Mic denied"
            : "Mic not yet requested"}
      </span>

      <span className="h-3 w-px bg-border" />

      {/* Current state */}
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("font-mono text-xs", indicator.color)}>
          {indicator.symbol}
        </span>
        {stateLabel[state]}
      </span>

      {/* Duration */}
      {duration !== undefined && duration > 0 && (
        <>
          <span className="h-3 w-px bg-border" />
          <span className="font-mono text-xs tabular-nums">
            {formatDuration(duration)}
          </span>
        </>
      )}
    </div>
  );
}
