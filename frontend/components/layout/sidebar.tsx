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

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const renderNavGroup = (title: string, links: typeof workspaceLinks) => (
    <div className="space-y-1 py-2">
      <div className="px-3 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">[</span> {title} <span className="text-primary">]</span>
      </div>
      {links.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-primary/10 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/15">
          <Mic className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground">VoiceRAG</span>
          <span className="font-mono text-[10px] text-muted-foreground">v0.1.0 · Engine</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {renderNavGroup("Workspace", workspaceLinks)}
        {renderNavGroup("Evaluation", evaluationLinks)}
        {renderNavGroup("System", systemLinks)}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-sidebar-border p-3 font-mono text-[10px] text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Vector DB</span>
          <span className="font-bold text-success">Qdrant</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>Embeddings</span>
          <span>1536d</span>
        </div>
      </div>
    </div>
  );
}
