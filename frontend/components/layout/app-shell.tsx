"use client";

import { Sidebar } from "./sidebar";
import { SystemStatus } from "./system-status";
import { Layers } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/30 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace:
            </span>
            <span className="text-xs font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/50">
              Research Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <SystemStatus />
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
