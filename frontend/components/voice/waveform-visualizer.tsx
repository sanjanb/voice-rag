"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
  className?: string;
}

export function WaveformVisualizer({
  analyserNode,
  isRecording,
  className,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl || !analyserNode || !isRecording) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const node = analyserNode;
    const dpr = window.devicePixelRatio || 1;

    function setupCanvas() {
      if (!canvasEl || !ctx) return { width: 0, height: 0 };
      const rect = canvasEl.getBoundingClientRect();
      canvasEl.width = rect.width * dpr;
      canvasEl.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      return rect;
    }

    let rect = setupCanvas();

    const handleResize = () => {
      rect = setupCanvas();
    };
    window.addEventListener("resize", handleResize);

    const bufferLength = node.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      if (!ctx) return;
      animFrameRef.current = requestAnimationFrame(draw);
      node.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Gradient stroke
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.15)");
      gradient.addColorStop(0.3, "rgba(59, 130, 246, 0.8)");
      gradient.addColorStop(0.5, "rgba(96, 165, 250, 1)");
      gradient.addColorStop(0.7, "rgba(59, 130, 246, 0.8)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.15)");

      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = rect.width / (bufferLength - 1);
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * rect.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else if (i === 1) {
          ctx.lineTo(x, y);
        } else {
          // Smooth curve using quadratic bezier
          const prevX = x - sliceWidth;
          const prevV = dataArray[i - 1] / 128.0;
          const prevY = (prevV * rect.height) / 2;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + y) / 2);
        }
        x += sliceWidth;
      }

      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();

      // Subtle fill below the line
      ctx.lineTo(rect.width, rect.height);
      ctx.lineTo(0, rect.height);
      ctx.closePath();

      const fillGradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      fillGradient.addColorStop(0, "rgba(59, 130, 246, 0.08)");
      fillGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = fillGradient;
      ctx.fill();
    }

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyserNode, isRecording]);

  return (
    <div className={cn("w-full overflow-hidden rounded-lg", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ height: "100px" }}
      />
    </div>
  );
}
