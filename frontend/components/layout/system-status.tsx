"use client";

import { useState, useEffect } from "react";
import { getHealthStatus } from "@/lib/api";
import { SystemStatus as SystemStatusType } from "@/lib/types";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatusType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    setIsRefreshing(true);
    const data = await getHealthStatus();
    setStatus(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const overall = status?.overall || "READY";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono font-medium transition-colors shadow-sm",
          overall === "READY"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
            : overall === "DEGRADED"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
        )}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              overall === "READY"
                ? "bg-emerald-400"
                : overall === "DEGRADED"
                  ? "bg-amber-400"
                  : "bg-red-400"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              overall === "READY"
                ? "bg-emerald-500"
                : overall === "DEGRADED"
                  ? "bg-amber-500"
                  : "bg-red-500"
            )}
          />
        </span>
        <span>{overall}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  System Health
                </h4>
              </div>
              <button
                onClick={fetchStatus}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Refresh Status"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {status?.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-foreground">{service.name}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    {service.status === "healthy" && (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Healthy</span>
                      </>
                    )}
                    {service.status === "degraded" && (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-amber-500">Degraded</span>
                      </>
                    )}
                    {service.status === "unavailable" && (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-destructive">Unavailable</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-2 text-[10px] font-mono text-muted-foreground text-right">
              Last checked: {status?.lastChecked || "Just now"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
