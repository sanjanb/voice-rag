"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Activity,
  BarChart3,
  FlaskConical,
  Network,
  Settings,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";

const workspaceLinks = [
  { href: "/", label: "Workspace", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/ask", label: "Ask", icon: MessageSquare },
  { href: "/runs", label: "Runs", icon: Activity },
];

const evaluationLinks = [
  { href: "/benchmarks", label: "Benchmarks", icon: BarChart3 },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
];

const systemLinks = [
  { href: "/architecture", label: "Architecture", icon: Network },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderNavGroup = (title: string, links: typeof workspaceLinks) => (
    <div className="space-y-1 py-2">
      <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </div>
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Mic className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground">VoiceRAG</span>
          <span className="text-[10px] font-mono text-muted-foreground">v0.1.0 · Engine</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 px-3 py-4 overflow-y-auto">
        {renderNavGroup("Workspace", workspaceLinks)}
        {renderNavGroup("Evaluation", evaluationLinks)}
        {renderNavGroup("System", systemLinks)}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-border p-3 text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center justify-between">
          <span>Vector DB</span>
          <span className="text-emerald-500 font-semibold">Qdrant</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>Embeddings</span>
          <span>1536d</span>
        </div>
      </div>
    </aside>
  );
}
