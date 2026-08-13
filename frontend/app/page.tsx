"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, FileText, Sparkles, ShieldCheck, ArrowRight, Plus } from "lucide-react";

export default function LandingPage() {
  const [workspaceName, setWorkspaceName] = useState("Research Workspace");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Brand Header */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-mono text-xs font-semibold text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        <span>PROVABLE GROUNDED RAG SYSTEM</span>
      </div>

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        ◈ VOICERAG
      </h1>

      <p className="mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
        Voice → Hybrid Retrieval (Dense + Sparse RRF) → Adaptive Rerank → Guardrails → Grounded Answer
      </p>

      {/* Create Workspace Card */}
      <div className="mt-10 w-full max-w-md rounded-2xl border border-border bg-card/60 p-8 shadow-2xl backdrop-blur-md text-left">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Create Workspace
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Initialize a research workspace for your documents
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-foreground mb-1.5">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
              placeholder="e.g. Research Papers"
            />
          </div>

          <Link
            href="/documents"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
          >
            <span>Create Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 4 Pillars */}
      <div className="mt-16 grid grid-cols-2 gap-4 max-w-3xl sm:grid-cols-4 font-mono text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/30 p-4">
          <FileText className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-foreground">Documents</span>
          <span className="text-[10px]">Multi-format Chunking</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/30 p-4">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <span className="font-semibold text-foreground">Retrieval</span>
          <span className="text-[10px]">Dense + BM25 RRF</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/30 p-4">
          <Mic className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold text-foreground">Voice</span>
          <span className="text-[10px]">Low-latency STT</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/30 p-4">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          <span className="font-semibold text-foreground">Grounding</span>
          <span className="text-[10px]">Zero Hallucination</span>
        </div>
      </div>
    </div>
  );
}
