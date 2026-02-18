"use client";

import { useEffect, useState } from "react";
import type { Trace } from "@/lib/types";
import { TraceViewer } from "./trace-viewer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Search,
  Filter,
} from "lucide-react";

const statusConfig = {
  completed: { icon: <CheckCircle size={14} />, color: "text-probe-green", bg: "bg-probe-green/10" },
  failed: { icon: <XCircle size={14} />, color: "text-probe-red", bg: "bg-probe-red/10" },
  running: { icon: <Loader2 size={14} className="animate-spin" />, color: "text-probe-amber", bg: "bg-probe-amber/10" },
  timeout: { icon: <Clock size={14} />, color: "text-probe-text-dim", bg: "bg-probe-surface-3" },
};

export function TracesView() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/traces?limit=60")
      .then((r) => r.json())
      .then(setTraces);
  }, []);

  const filtered = traces.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (searchQuery && !t.agentName.toLowerCase().includes(searchQuery.toLowerCase()) && !t.id.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-3 animate-fade-up">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-probe-text-dim" />
          <input
            type="text"
            placeholder="Search by agent name or trace ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-probe-border bg-probe-surface-1 py-2 pl-9 pr-3 text-[13px] text-probe-text placeholder:text-probe-text-dim focus:border-probe-green/30 focus:outline-none focus:ring-1 focus:ring-probe-green/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-probe-border bg-probe-surface-1 p-0.5">
          {["all", "completed", "failed", "running", "timeout"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                filterStatus === status
                  ? "bg-probe-surface-3 text-probe-text"
                  : "text-probe-text-dim hover:text-probe-text"
              )}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-[11px] font-mono text-probe-text-dim">
          {filtered.length} traces
        </div>
      </div>

      {/* Trace list */}
      <div className="rounded-md border border-probe-border bg-probe-surface-1 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_120px_80px_80px_80px_120px] gap-3 border-b border-probe-border bg-probe-surface-2 px-4 py-2">
          <span className="w-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-probe-text-dim">Agent</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-probe-text-dim">Status</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-probe-text-dim">Duration</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-probe-text-dim">Steps</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-probe-text-dim">Cost</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-probe-text-dim">Time</span>
        </div>

        {/* Rows */}
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
          {filtered.map((trace, i) => {
            const cfg = statusConfig[trace.status];
            return (
              <button
                key={trace.id}
                onClick={() => setSelectedTrace(trace)}
                className="grid w-full grid-cols-[auto_1fr_120px_80px_80px_80px_120px] gap-3 border-b border-probe-border px-4 py-2.5 text-left hover:bg-probe-surface-2 transition-colors"
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <span className={cn("flex h-6 w-6 items-center justify-center rounded", cfg.bg, cfg.color)}>
                  {cfg.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-probe-text truncate">{trace.agentName}</p>
                  <p className="text-[10px] font-mono text-probe-text-dim truncate">{trace.id.substring(0, 12)}...</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] font-mono w-fit", cfg.color, `border-current/30`)}
                >
                  {trace.status}
                </Badge>
                <span className="text-[12px] font-mono text-probe-text self-center">
                  {(trace.totalDurationMs / 1000).toFixed(1)}s
                </span>
                <span className="text-[12px] font-mono text-probe-text-dim self-center">
                  {trace.stepCount}
                </span>
                <span className="text-[12px] font-mono text-probe-text-dim self-center">
                  ${trace.totalCost.toFixed(3)}
                </span>
                <span className="text-[11px] text-probe-text-dim self-center">
                  {new Date(trace.startedAt).toLocaleTimeString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTrace && (
        <TraceViewer trace={selectedTrace} onClose={() => setSelectedTrace(null)} />
      )}
    </div>
  );
}
