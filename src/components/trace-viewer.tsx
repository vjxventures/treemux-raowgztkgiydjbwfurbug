"use client";

import { cn } from "@/lib/utils";
import type { Trace, TraceStep, StepType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Wrench,
  Globe,
  GitBranch,
  User,
  AlertTriangle,
  ChevronDown,
  Clock,
  Coins,
  Hash,
} from "lucide-react";
import { useState } from "react";

const stepIcons: Record<StepType, React.ReactNode> = {
  llm_call: <Brain size={14} />,
  tool_call: <Wrench size={14} />,
  api_call: <Globe size={14} />,
  decision: <GitBranch size={14} />,
  human_review: <User size={14} />,
  error: <AlertTriangle size={14} />,
};

const stepColors: Record<StepType, string> = {
  llm_call: "text-probe-blue bg-probe-blue/10 border-probe-blue/20",
  tool_call: "text-probe-green bg-probe-green/10 border-probe-green/20",
  api_call: "text-probe-cyan bg-probe-cyan/10 border-probe-cyan/20",
  decision: "text-probe-amber bg-probe-amber/10 border-probe-amber/20",
  human_review: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  error: "text-probe-red bg-probe-red/10 border-probe-red/20",
};

const barColors: Record<StepType, string> = {
  llm_call: "bg-probe-blue",
  tool_call: "bg-probe-green",
  api_call: "bg-probe-cyan",
  decision: "bg-probe-amber",
  human_review: "bg-purple-400",
  error: "bg-probe-red",
};

function StepRow({ step, maxDuration }: { step: TraceStep; maxDuration: number }) {
  const [expanded, setExpanded] = useState(false);
  const widthPercent = Math.max((step.durationMs / maxDuration) * 100, 2);

  return (
    <div className="group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-probe-surface-2 transition-colors text-left"
      >
        {/* Step index */}
        <span className="w-6 text-[11px] font-mono text-probe-text-dim text-right">
          {step.index}
        </span>

        {/* Icon */}
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded border",
            stepColors[step.type]
          )}
        >
          {stepIcons[step.type]}
        </span>

        {/* Name */}
        <span className="w-44 truncate text-[13px] font-medium text-probe-text">
          {step.name}
        </span>

        {/* Type badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-mono px-1.5 py-0 h-5",
            stepColors[step.type]
          )}
        >
          {step.type}
        </Badge>

        {/* Waterfall bar */}
        <div className="flex-1 mx-2">
          <div className="h-5 relative rounded-sm bg-probe-surface-3 overflow-hidden">
            <div
              className={cn("h-full rounded-sm animate-waterfall opacity-60", barColors[step.type])}
              style={{ width: `${widthPercent}%` }}
            />
            <span className="absolute right-1.5 top-0.5 text-[10px] font-mono text-probe-text-dim">
              {step.durationMs}ms
            </span>
          </div>
        </div>

        {/* Tokens / cost */}
        <div className="flex items-center gap-3 w-28">
          {step.tokenCount && (
            <span className="flex items-center gap-1 text-[11px] text-probe-text-dim font-mono">
              <Hash size={10} />
              {step.tokenCount.toLocaleString()}
            </span>
          )}
          {step.cost && (
            <span className="flex items-center gap-1 text-[11px] text-probe-text-dim font-mono">
              <Coins size={10} />
              ${step.cost.toFixed(3)}
            </span>
          )}
        </div>

        {/* Expand */}
        <ChevronDown
          size={14}
          className={cn(
            "text-probe-text-dim transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="mx-4 mb-2 ml-14 space-y-2 rounded border border-probe-border bg-probe-surface p-3 animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-probe-text-dim mb-1">
                Input
              </p>
              <pre className="rounded bg-probe-surface-2 p-2 text-[11px] text-probe-text font-mono leading-relaxed overflow-auto max-h-32">
                {(() => {
                  try { return JSON.stringify(JSON.parse(step.input), null, 2); } catch { return step.input; }
                })()}
              </pre>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-probe-text-dim mb-1">
                Output
              </p>
              <pre className="rounded bg-probe-surface-2 p-2 text-[11px] text-probe-text font-mono leading-relaxed overflow-auto max-h-32">
                {(() => {
                  try { return JSON.stringify(JSON.parse(step.output), null, 2); } catch { return step.output; }
                })()}
              </pre>
            </div>
          </div>
          <div className="flex gap-4 pt-1">
            <span className="text-[10px] text-probe-text-dim">
              Started: {new Date(step.startedAt).toLocaleTimeString()}
            </span>
            <span className="text-[10px] text-probe-text-dim">
              Ended: {new Date(step.endedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TraceViewer({ trace, onClose }: { trace: Trace; onClose: () => void }) {
  const maxDuration = Math.max(...trace.steps.map((s) => s.durationMs));

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-[75vw] max-w-5xl flex-col bg-probe-surface border-l border-probe-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-probe-border px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-probe-text">Trace Detail</h2>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-mono",
                  trace.status === "completed"
                    ? "text-probe-green border-probe-green/30"
                    : trace.status === "failed"
                    ? "text-probe-red border-probe-red/30"
                    : trace.status === "running"
                    ? "text-probe-amber border-probe-amber/30"
                    : "text-probe-text-dim border-probe-border"
                )}
              >
                {trace.status}
              </Badge>
            </div>
            <p className="text-[11px] font-mono text-probe-text-dim">{trace.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-probe-text-dim hover:bg-probe-surface-2 hover:text-probe-text"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-5 gap-px border-b border-probe-border bg-probe-border">
          {[
            { label: "Agent", value: trace.agentName },
            { label: "Duration", value: `${(trace.totalDurationMs / 1000).toFixed(2)}s` },
            { label: "Steps", value: trace.stepCount.toString() },
            { label: "Tokens", value: trace.totalTokens.toLocaleString() },
            { label: "Cost", value: `$${trace.totalCost.toFixed(4)}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-probe-surface-1 px-4 py-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-probe-text-dim">
                {stat.label}
              </p>
              <p className="mt-0.5 text-sm font-mono font-medium text-probe-text">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Input / Output */}
        <div className="grid grid-cols-2 gap-px border-b border-probe-border bg-probe-border">
          <div className="bg-probe-surface-1 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-probe-text-dim mb-1">Input</p>
            <p className="text-[12px] text-probe-text leading-relaxed">{trace.input}</p>
          </div>
          <div className="bg-probe-surface-1 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-probe-text-dim mb-1">
              {trace.error ? "Error" : "Output"}
            </p>
            <p
              className={cn(
                "text-[12px] leading-relaxed",
                trace.error ? "text-probe-red" : "text-probe-text"
              )}
            >
              {trace.error || trace.output || "—"}
            </p>
          </div>
        </div>

        {/* Waterfall */}
        <div className="flex items-center gap-2 border-b border-probe-border px-4 py-2">
          <Clock size={12} className="text-probe-text-dim" />
          <span className="text-[11px] font-medium text-probe-text-dim">
            Step Waterfall
          </span>
          <span className="text-[10px] font-mono text-probe-text-dim ml-auto">
            Total: {(trace.totalDurationMs / 1000).toFixed(2)}s
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          {trace.steps.map((step) => (
            <StepRow key={step.id} step={step} maxDuration={maxDuration} />
          ))}
        </div>

        {/* Tags */}
        {trace.tags.length > 0 && (
          <div className="flex items-center gap-2 border-t border-probe-border px-4 py-2">
            {trace.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] font-mono text-probe-text-dim border-probe-border"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
