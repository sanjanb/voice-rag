"use client";

import { Sidebar } from "./sidebar";
import { SystemStatus } from "./system-status";
import { Layers, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground hover:bg-muted/80 lg:hidden"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace:
            </span>
            <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground">
              Research Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <SystemStatus />
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
