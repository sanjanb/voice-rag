"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, Send, Loader2 } from "lucide-react";

interface TranscriptPreviewProps {
  transcript: string;
  isTranscribing: boolean;
  onSubmit: (query: string) => void;
  onReRecord: () => void;
  className?: string;
}

export function TranscriptPreview({
  transcript,
  isTranscribing,
  onSubmit,
  onReRecord,
  className,
}: TranscriptPreviewProps) {
  const [edited, setEdited] = useState(transcript);

  useEffect(() => {
    setEdited(transcript);
  }, [transcript]);

  if (isTranscribing) {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="font-mono text-xs text-muted-foreground">[Transcribing audio...]</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative">
        <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          [Transcribed Query]
        </label>
        <textarea
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          rows={3}
          className="w-full resize-none rounded border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Your transcribed question will appear here..."
        />
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onReRecord}
          className="gap-2 rounded border-border bg-muted font-mono text-xs font-bold hover:bg-muted/80"
        >
          <RotateCcw className="h-4 w-4" />
          [Re-record]
        </Button>
        <Button
          onClick={() => onSubmit(edited)}
          disabled={!edited.trim()}
          className="gap-2 rounded bg-primary px-4 font-mono text-xs font-bold text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
          [Ask]
        </Button>
      </div>
    </div>
  );
}
