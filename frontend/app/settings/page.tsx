"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/api";
import { SystemSettings } from "@/lib/types";
import { Settings, Save, CheckCircle2, Mic, Layers, Cpu, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) {
    return (
      <div className="rounded-2xl border border-border p-8 text-center text-muted-foreground font-mono text-xs">
        Loading system configuration settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold uppercase tracking-wider">
            <Settings className="h-4 w-4" />
            <span>SYSTEM CONFIGURATION</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Engine Settings
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure voice STT providers, hybrid retrieval top-k, RRF parameters, reranking thresholds, and LLM generators
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? "Saved Configuration" : "Save Configuration"}</span>
        </button>
      </div>

      <div className="space-y-6 font-mono text-xs">
        {/* VOICE SECTION */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold border-b border-border pb-3">
            <Mic className="h-4 w-4 text-emerald-400" />
            <span>VOICE & STT PROVIDERS</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-muted-foreground mb-1">STT Provider</label>
              <select
                value={settings.sttProvider}
                onChange={(e) => setSettings({ ...settings, sttProvider: e.target.value as any })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              >
                <option value="Hosted">Hosted Whisper v3</option>
                <option value="Local">Local Whisper.cpp</option>
                <option value="Hybrid">Hybrid Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Fallback Provider</label>
              <select
                value={settings.sttFallback}
                onChange={(e) => setSettings({ ...settings, sttFallback: e.target.value as any })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              >
                <option value="Local">Local Whisper.cpp</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* RETRIEVAL SECTION */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold border-b border-border pb-3">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>HYBRID RETRIEVAL & FUSION</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-muted-foreground mb-1">Dense Top-K</label>
              <input
                type="number"
                value={settings.denseTopK}
                onChange={(e) => setSettings({ ...settings, denseTopK: parseInt(e.target.value) || 10 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Sparse BM25 Top-K</label>
              <input
                type="number"
                value={settings.sparseTopK}
                onChange={(e) => setSettings({ ...settings, sparseTopK: parseInt(e.target.value) || 10 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">RRF Constant (k)</label>
              <input
                type="number"
                value={settings.rrfK}
                onChange={(e) => setSettings({ ...settings, rrfK: parseInt(e.target.value) || 60 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* RERANKING & GUARDRAILS SECTION */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold border-b border-border pb-3">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>RERANKING & GUARDRAILS</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-muted-foreground mb-1">Reranking Mode</label>
              <select
                value={settings.rerankingMode}
                onChange={(e) => setSettings({ ...settings, rerankingMode: e.target.value as any })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              >
                <option value="Adaptive">Adaptive Reranking</option>
                <option value="Always">Always Rerank</option>
                <option value="Never">Never Rerank</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Rerank Threshold</label>
              <input
                type="number"
                step="0.01"
                value={settings.rerankingThreshold}
                onChange={(e) => setSettings({ ...settings, rerankingThreshold: parseFloat(e.target.value) || 0.72 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Abstention Threshold</label>
              <input
                type="number"
                step="0.01"
                value={settings.abstentionThreshold}
                onChange={(e) => setSettings({ ...settings, abstentionThreshold: parseFloat(e.target.value) || 0.72 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* GENERATION SECTION */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold border-b border-border pb-3">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>GENERATION & GROUNDING</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-muted-foreground mb-1">Generator LLM Model</label>
              <input
                type="text"
                value={settings.generationModel}
                onChange={(e) => setSettings({ ...settings, generationModel: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Temperature</label>
              <input
                type="number"
                step="0.1"
                value={settings.generationTemperature}
                onChange={(e) => setSettings({ ...settings, generationTemperature: parseFloat(e.target.value) || 0.0 })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground font-medium focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
