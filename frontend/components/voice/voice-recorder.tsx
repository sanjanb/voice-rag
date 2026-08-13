"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type RecorderState =
  | "idle"
  | "listening"
  | "recording"
  | "stopped"
  | "transcribing"
  | "query_ready";

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  onRecordingComplete?: (audioBlob: Blob) => void;
  state: RecorderState;
  onStateChange: (state: RecorderState) => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceRecorder({
  onTranscriptReady,
  onRecordingStart,
  onRecordingStop,
  onRecordingComplete,
  state,
  onStateChange,
}: VoiceRecorderProps) {
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [duration, setDuration] = useState(0);
  const [micPermission, setMicPermission] = useState<"prompt" | "granted" | "denied">("prompt");

  // Expose analyser for waveform
  useEffect(() => {
    // Store analyser on a data attribute for the waveform to pick up
    const el = document.getElementById("voice-recorder-host");
    if (el && analyserRef.current) {
      (el as any).__analyser = analyserRef.current;
    }
  }, [state]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    // Clear DOM analyser reference
    const el = document.getElementById("voice-recorder-host");
    if (el) {
      delete (el as any).__analyser;
    }

    // Pass audio blob to parent
    if (chunksRef.current.length > 0 && onRecordingComplete) {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      onRecordingComplete(audioBlob);
    }

    onRecordingStop();
    onStateChange("stopped");
  }, [onRecordingStop, onStateChange, onRecordingComplete]);

  const startRecording = useCallback(async () => {
    onStateChange("listening");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicPermission("granted");

      // Set up Web Audio API
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Expose analyser via DOM for waveform
      requestAnimationFrame(() => {
        const el = document.getElementById("voice-recorder-host");
        if (el) {
          (el as any).__analyser = analyser;
          // Dispatch event so waveform can pick it up
          el.dispatchEvent(new CustomEvent("analyser-ready", { detail: analyser }));
        }
      });

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      onStateChange("recording");
      onRecordingStart();

      // Start timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      setMicPermission("denied");
      onStateChange("idle");
    }
  }, [onRecordingStart, onStateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleClick = () => {
    if (state === "idle" || state === "query_ready") {
      startRecording();
    } else if (state === "recording") {
      stopRecording();
    }
  };

  const isRecording = state === "recording";
  const isListening = state === "listening";
  const isTranscribing = state === "transcribing";

  return (
    <div
      id="voice-recorder-host"
      className="flex flex-col items-center gap-6"
    >
      {/* Timer */}
      <AnimatePresence>
        {(isRecording || state === "stopped") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-mono text-2xl tabular-nums text-muted-foreground"
          >
            {formatTime(duration)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record button */}
      <div className="relative">
        {/* Pulse rings for recording */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-destructive/20"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-destructive/15"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.4,
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Listening pulse */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/15"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleClick}
          disabled={isTranscribing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            backgroundColor: isRecording
              ? "rgb(239, 68, 68)"
              : isListening
                ? "rgb(59, 130, 246)"
                : "transparent",
          }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 transition-shadow",
            isRecording
              ? "border-destructive shadow-[0_0_30px_rgba(239,68,68,0.3)]"
              : isListening
                ? "border-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                : "border-muted-foreground/30 hover:border-muted-foreground/50",
            isTranscribing && "pointer-events-none opacity-50"
          )}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          <AnimatePresence mode="wait">
            {isTranscribing ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </motion.div>
            ) : isRecording ? (
              <motion.div
                key="stop"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Square className="h-6 w-6 text-white fill-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Mic
                  className={cn(
                    "h-7 w-7",
                    isListening ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Hint text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-sm text-muted-foreground"
        >
          {state === "idle" && "Tap to start recording"}
          {state === "listening" && "Requesting microphone access…"}
          {state === "recording" && "Tap to stop recording"}
          {state === "stopped" && "Processing…"}
          {state === "transcribing" && "Transcribing audio…"}
          {state === "query_ready" && "Tap to record a new question"}
        </motion.p>
      </AnimatePresence>

      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {state === "recording" && "Recording started"}
        {state === "stopped" && "Recording stopped"}
        {state === "transcribing" && "Transcribing audio"}
        {state === "query_ready" && "Transcript ready"}
      </div>
    </div>
  );
}
