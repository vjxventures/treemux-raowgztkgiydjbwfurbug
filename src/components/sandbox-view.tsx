"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Play,
  RotateCcw,
  Pause,
  Terminal,
  Zap,
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react";

type SimulationStatus = "idle" | "running" | "completed" | "failed";

interface SimScenario {
  id: string;
  name: string;
  description: string;
  category: "regression" | "adversarial" | "load" | "chaos";
  steps: number;
}

const scenarios: SimScenario[] = [
  { id: "1", name: "Standard Customer Query Flow", description: "Simulates a typical 5-step customer support interaction", category: "regression", steps: 5 },
  { id: "2", name: "Prompt Injection Attack", description: "Tests agent resilience against 20 known prompt injection patterns", category: "adversarial", steps: 20 },
  { id: "3", name: "High Concurrency Load", description: "Simulates 100 concurrent agent sessions with shared state", category: "load", steps: 100 },
  { id: "4", name: "API Timeout Cascade", description: "Simulates cascading failures from external API timeouts", category: "chaos", steps: 8 },
  { id: "5", name: "Multi-turn Context Retention", description: "Validates context window management across 15 conversation turns", category: "regression", steps: 15 },
  { id: "6", name: "Tool Call Error Recovery", description: "Tests graceful degradation when tools return unexpected errors", category: "chaos", steps: 12 },
];

const categoryColors = {
  regression: "text-probe-blue border-probe-blue/30 bg-probe-blue/10",
  adversarial: "text-probe-red border-probe-red/30 bg-probe-red/10",
  load: "text-probe-amber border-probe-amber/30 bg-probe-amber/10",
  chaos: "text-purple-400 border-purple-400/30 bg-purple-400/10",
};

export function SandboxView() {
  const [selectedScenario, setSelectedScenario] = useState<SimScenario | null>(null);
  const [simStatus, setSimStatus] = useState<SimulationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const runSimulation = (scenario: SimScenario) => {
    setSelectedScenario(scenario);
    setSimStatus("running");
    setProgress(0);
    setLogs(["[SANDBOX] Initializing simulation environment..."]);

    const logMessages = [
      `[SANDBOX] Loading scenario: ${scenario.name}`,
      "[SANDBOX] Provisioning isolated agent instance...",
      "[SANDBOX] Connecting mock tool endpoints...",
      `[SANDBOX] Executing step 1/${scenario.steps}...`,
      "[AGENT] Processing input: 'Simulated user request'",
      "[TOOL] search_knowledge_base() called with query='test'",
      "[TOOL] Response: 3 results found (234ms)",
      "[AGENT] Generating response with context...",
      `[SANDBOX] Executing step 2/${scenario.steps}...`,
      "[AGENT] Tool call: create_ticket({priority: 'high'})",
      "[TOOL] Ticket created: TK-4892",
      "[EVAL] Assertion 'contains_ticket_id': PASS",
      "[EVAL] Assertion 'response_time < 3s': PASS",
      "[SANDBOX] Simulation completed successfully",
      `[RESULT] ${scenario.steps}/${scenario.steps} steps passed`,
      "[RESULT] Avg response time: 1.23s",
      "[RESULT] Total tokens: 4,521",
      "[RESULT] Cost: $0.0342",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logMessages.length) {
        setLogs((prev) => [...prev, logMessages[i]]);
        setProgress(Math.min(((i + 1) / logMessages.length) * 100, 100));
        i++;
      } else {
        clearInterval(interval);
        setSimStatus("completed");
      }
    }, 400);
  };

  return (
    <div className="grid grid-cols-[1fr_1.2fr] gap-3 h-[calc(100vh-160px)] animate-fade-up">
      {/* Scenarios Panel */}
      <div className="rounded-md border border-probe-border bg-probe-surface-1 flex flex-col">
        <div className="flex items-center gap-2 border-b border-probe-border px-4 py-3">
          <Zap size={14} className="text-probe-amber" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim">
            Simulation Scenarios
          </span>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario);
                setSimStatus("idle");
                setLogs([]);
                setProgress(0);
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded px-3 py-3 text-left transition-colors",
                selectedScenario?.id === scenario.id
                  ? "bg-probe-surface-3 border border-probe-green/20"
                  : "hover:bg-probe-surface-2 border border-transparent"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[13px] font-medium text-probe-text truncate">
                    {scenario.name}
                  </p>
                </div>
                <p className="text-[11px] text-probe-text-dim line-clamp-2">
                  {scenario.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-mono", categoryColors[scenario.category])}
                  >
                    {scenario.category}
                  </Badge>
                  <span className="text-[10px] font-mono text-probe-text-dim">
                    {scenario.steps} steps
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-probe-text-dim mt-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Execution Panel */}
      <div className="rounded-md border border-probe-border bg-probe-surface-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-probe-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-probe-green" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim">
              Sandbox Execution
            </span>
          </div>
          {selectedScenario && (
            <div className="flex items-center gap-2">
              {simStatus === "idle" && (
                <button
                  onClick={() => runSimulation(selectedScenario)}
                  className="flex items-center gap-1.5 rounded-md bg-probe-green/10 border border-probe-green/20 px-3 py-1.5 text-[12px] font-medium text-probe-green hover:bg-probe-green/20 transition-colors"
                >
                  <Play size={12} />
                  Run
                </button>
              )}
              {simStatus === "running" && (
                <button className="flex items-center gap-1.5 rounded-md bg-probe-amber/10 border border-probe-amber/20 px-3 py-1.5 text-[12px] font-medium text-probe-amber">
                  <Pause size={12} />
                  Running...
                </button>
              )}
              {(simStatus === "completed" || simStatus === "failed") && (
                <button
                  onClick={() => runSimulation(selectedScenario)}
                  className="flex items-center gap-1.5 rounded-md bg-probe-surface-3 border border-probe-border px-3 py-1.5 text-[12px] font-medium text-probe-text hover:bg-probe-surface-2 transition-colors"
                >
                  <RotateCcw size={12} />
                  Re-run
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress */}
        {selectedScenario && simStatus !== "idle" && (
          <div className="border-b border-probe-border px-4 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-probe-text-dim">
                {simStatus === "running" ? "Executing..." : simStatus === "completed" ? "Completed" : "Failed"}
              </span>
              <span className="text-[11px] font-mono text-probe-text-dim">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-probe-surface-3 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  simStatus === "completed"
                    ? "bg-probe-green"
                    : simStatus === "failed"
                    ? "bg-probe-red"
                    : "bg-probe-amber"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Console Output */}
        <div className="flex-1 overflow-auto p-4 font-mono">
          {!selectedScenario ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <Shield size={32} className="text-probe-text-dim mx-auto" />
                <p className="text-[13px] text-probe-text-dim">Select a scenario to begin simulation</p>
                <p className="text-[11px] text-probe-text-dim">
                  Sandbox provides isolated execution environments for testing agent behavior
                </p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <Play size={24} className="text-probe-green mx-auto" />
                <p className="text-[13px] text-probe-text-dim">Ready to run: {selectedScenario.name}</p>
                <p className="text-[11px] text-probe-text-dim">
                  Click &ldquo;Run&rdquo; to start the simulation
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-[11px] leading-relaxed",
                    log.includes("[SANDBOX]")
                      ? "text-probe-cyan"
                      : log.includes("[AGENT]")
                      ? "text-probe-blue"
                      : log.includes("[TOOL]")
                      ? "text-probe-green"
                      : log.includes("[EVAL]") && log.includes("PASS")
                      ? "text-probe-green"
                      : log.includes("[EVAL]") && log.includes("FAIL")
                      ? "text-probe-red"
                      : log.includes("[RESULT]")
                      ? "text-probe-amber"
                      : log.includes("[ERROR]")
                      ? "text-probe-red"
                      : "text-probe-text-dim"
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {log}
                </div>
              ))}
              {simStatus === "running" && (
                <span className="inline-block w-2 h-4 bg-probe-green animate-pulse-dot" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
