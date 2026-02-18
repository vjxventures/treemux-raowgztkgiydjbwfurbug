"use client";

import { useEffect, useState } from "react";
import type { AgentVersion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Settings,
  MoreHorizontal,
} from "lucide-react";

const statusColors = {
  active: "text-probe-green bg-probe-green/10 border-probe-green/20",
  paused: "text-probe-amber bg-probe-amber/10 border-probe-amber/20",
  deprecated: "text-probe-red bg-probe-red/10 border-probe-red/20",
  archived: "text-probe-text-dim bg-probe-surface-3 border-probe-border",
};

export function AgentsView() {
  const [agents, setAgents] = useState<AgentVersion[]>([]);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents);
  }, []);

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono text-probe-text-dim">
          {agents.length} agents registered
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="group rounded-md border border-probe-border bg-probe-surface-1 p-4 hover:border-probe-green/20 transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-probe-text">
                    {agent.agentName}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-mono", statusColors[agent.status])}
                  >
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-probe-text-dim mt-0.5 font-mono">
                  v{agent.version} &middot; {agent.agentId}
                </p>
              </div>
              <button className="p-1 rounded text-probe-text-dim hover:text-probe-text hover:bg-probe-surface-3 opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-[12px] text-probe-text-dim leading-relaxed mb-3 line-clamp-2">
              {agent.description}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2 rounded bg-probe-surface p-2">
              <div className="text-center">
                <p className="text-[10px] text-probe-text-dim mb-0.5">Traces</p>
                <p className="text-[13px] font-mono font-semibold text-probe-text">
                  {agent.traceCount.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-probe-text-dim mb-0.5">Pass Rate</p>
                <p className={cn(
                  "text-[13px] font-mono font-semibold",
                  agent.passRate >= 95 ? "text-probe-green" : agent.passRate >= 90 ? "text-probe-amber" : "text-probe-red"
                )}>
                  {agent.passRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-probe-text-dim mb-0.5">Avg Latency</p>
                <p className="text-[13px] font-mono font-semibold text-probe-text">
                  {(agent.avgLatency / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-probe-text-dim mb-0.5">Error Rate</p>
                <p className={cn(
                  "text-[13px] font-mono font-semibold",
                  agent.errorRate < 1 ? "text-probe-green" : agent.errorRate < 3 ? "text-probe-amber" : "text-probe-red"
                )}>
                  {agent.errorRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Model config */}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono text-probe-text-dim border-probe-border">
                {(agent.config as Record<string, string>).model}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-probe-text-dim border-probe-border">
                temp: {(agent.config as Record<string, number>).temperature}
              </Badge>
              <span className="text-[10px] text-probe-text-dim ml-auto">
                Created {new Date(agent.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
