"use client";

import { useEffect, useState } from "react";
import type { EvalRun, EvalDataset } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Play,
  Database,
} from "lucide-react";

function EvalRunCard({ run }: { run: EvalRun }) {
  const [expanded, setExpanded] = useState(false);
  const passRate = run.totalCases > 0 ? ((run.passedCases / run.totalCases) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-md border border-probe-border bg-probe-surface-1 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-4 py-3 hover:bg-probe-surface-2 transition-colors text-left"
      >
        {/* Status indicator */}
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            run.status === "running"
              ? "bg-probe-amber animate-pulse-dot"
              : parseFloat(passRate) >= 90
              ? "bg-probe-green"
              : parseFloat(passRate) >= 70
              ? "bg-probe-amber"
              : "bg-probe-red"
          )}
        />

        {/* Dataset name */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-probe-text truncate">
            {run.datasetName}
          </p>
          <p className="text-[10px] font-mono text-probe-text-dim">
            Agent: {run.agentVersion} &middot; {run.triggeredBy}
          </p>
        </div>

        {/* Results bar */}
        <div className="flex items-center gap-2 w-64">
          <div className="flex-1 h-2 rounded-full bg-probe-surface-3 overflow-hidden flex">
            <div
              className="h-full bg-probe-green"
              style={{ width: `${(run.passedCases / run.totalCases) * 100}%` }}
            />
            <div
              className="h-full bg-probe-amber"
              style={{ width: `${(run.warnCases / run.totalCases) * 100}%` }}
            />
            <div
              className="h-full bg-probe-red"
              style={{ width: `${(run.failedCases / run.totalCases) * 100}%` }}
            />
          </div>
          <span className={cn(
            "text-[12px] font-mono font-semibold w-14 text-right",
            parseFloat(passRate) >= 90 ? "text-probe-green" : parseFloat(passRate) >= 70 ? "text-probe-amber" : "text-probe-red"
          )}>
            {passRate}%
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-probe-green font-mono">
            <CheckCircle size={12} /> {run.passedCases}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-probe-red font-mono">
            <XCircle size={12} /> {run.failedCases}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-probe-amber font-mono">
            <AlertTriangle size={12} /> {run.warnCases}
          </span>
        </div>

        <span className="text-[10px] text-probe-text-dim w-24 text-right">
          {new Date(run.startedAt).toLocaleString()}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            "text-probe-text-dim transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-probe-border animate-fade-up">
          {/* Results table */}
          <div className="grid grid-cols-[1fr_80px_80px_200px] gap-2 px-4 py-2 bg-probe-surface-2 text-[10px] font-medium uppercase tracking-wider text-probe-text-dim">
            <span>Test Case</span>
            <span>Result</span>
            <span>Score</span>
            <span>Assertions</span>
          </div>
          <div className="max-h-64 overflow-auto">
            {run.results.map((result) => (
              <div
                key={result.id}
                className="grid grid-cols-[1fr_80px_80px_200px] gap-2 px-4 py-2 border-b border-probe-border hover:bg-probe-surface-2 transition-colors"
              >
                <span className="text-[12px] text-probe-text truncate">
                  {result.caseName}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-mono w-fit",
                    result.result === "pass"
                      ? "text-probe-green border-probe-green/30"
                      : result.result === "fail"
                      ? "text-probe-red border-probe-red/30"
                      : "text-probe-amber border-probe-amber/30"
                  )}
                >
                  {result.result}
                </Badge>
                <span className={cn(
                  "text-[12px] font-mono",
                  result.score >= 0.8 ? "text-probe-green" : result.score >= 0.5 ? "text-probe-amber" : "text-probe-red"
                )}>
                  {(result.score * 100).toFixed(0)}%
                </span>
                <div className="flex items-center gap-1.5">
                  {result.assertions.map((a, j) => (
                    <span
                      key={j}
                      className={cn(
                        "inline-flex h-5 items-center gap-0.5 rounded px-1.5 text-[10px] font-mono",
                        a.passed
                          ? "bg-probe-green/10 text-probe-green"
                          : "bg-probe-red/10 text-probe-red"
                      )}
                    >
                      {a.passed ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {a.type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function EvalsView() {
  const [evalRuns, setEvalRuns] = useState<EvalRun[]>([]);
  const [datasets, setDatasets] = useState<EvalDataset[]>([]);

  useEffect(() => {
    fetch("/api/evals/runs")
      .then((r) => r.json())
      .then(setEvalRuns);
    fetch("/api/datasets")
      .then((r) => r.json())
      .then(setDatasets);
  }, []);

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Datasets */}
      <div className="rounded-md border border-probe-border bg-probe-surface-1 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database size={14} className="text-probe-text-dim" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim">
            Evaluation Datasets
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              className="rounded border border-probe-border bg-probe-surface p-3 hover:border-probe-green/20 transition-colors"
            >
              <p className="text-[12px] font-medium text-probe-text truncate">{ds.name}</p>
              <p className="text-[10px] text-probe-text-dim mt-0.5 line-clamp-2">{ds.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-mono text-probe-green">{ds.caseCount} cases</span>
                <span className="text-[10px] text-probe-text-dim ml-auto">
                  Updated {new Date(ds.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Eval Runs */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim">
          Evaluation Runs
        </span>
        <button className="flex items-center gap-1.5 rounded-md bg-probe-green/10 border border-probe-green/20 px-3 py-1.5 text-[12px] font-medium text-probe-green hover:bg-probe-green/20 transition-colors">
          <Play size={12} />
          New Run
        </button>
      </div>

      <div className="space-y-2">
        {evalRuns.map((run) => (
          <EvalRunCard key={run.id} run={run} />
        ))}
      </div>
    </div>
  );
}
