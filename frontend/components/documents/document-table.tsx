"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Document {
  id: string;
  name: string;
  type: string;
  status: "processing" | "ready" | "failed" | "uploading";
  chunks: number;
  date: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

type SortKey = "name" | "type" | "status" | "chunks" | "date";

const statusConfig: Record<Document["status"], { label: string; variant: "warning" | "success" | "danger" }> = {
  processing: { label: "Processing", variant: "warning" },
  ready: { label: "Ready", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  uploading: { label: "Uploading", variant: "warning" },
};

const statusDot: Record<Document["status"], string> = {
  processing: "bg-accent",
  ready: "bg-success",
  failed: "bg-destructive",
  uploading: "bg-accent",
};

interface DocumentTableProps {
  documents: Document[];
  onRowClick?: (doc: Document) => void;
}

export function DocumentTable({ documents, onRowClick }: DocumentTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "name" || key === "type");
    }
  };

  const sorted = [...documents].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "chunks") {
      cmp = a.chunks - b.chunks;
    } else {
      cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
    }
    return sortAsc ? cmp : -cmp;
  });

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded border border-dashed py-16 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-mono text-xs font-bold text-foreground">[No Documents]</p>
        <p className="mt-1 text-xs text-muted-foreground">Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent">
            {(["name", "type", "status", "chunks", "date"] as SortKey[]).map((key) => (
              <TableHead key={key}>
                <button
                  onClick={() => toggleSort(key)}
                  className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  {key === "chunks" ? "Chunks" : key.charAt(0).toUpperCase() + key.slice(1)}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((doc) => {
            const cfg = statusConfig[doc.status];
            return (
              <TableRow
                key={doc.id}
                onClick={() => onRowClick?.(doc)}
                className="cursor-pointer border-b border-border/50 hover:bg-muted/50"
              >
                <TableCell className="font-mono text-sm font-medium">{doc.name}</TableCell>
                <TableCell>
                  <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                    {doc.type}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={cfg.variant} className="gap-1.5 font-mono text-[10px] font-bold">
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[doc.status])} />
                    {cfg.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-muted-foreground">{doc.chunks}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{doc.date}</TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
