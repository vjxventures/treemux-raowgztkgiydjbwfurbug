"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink, Bot } from "lucide-react";
import type { Agent } from "@/lib/types";

interface AgentTableProps {
  agents: Agent[];
  onSelect: (agent: Agent) => void;
}

function statusColor(status: string) {
  switch (status) {
    case "active": return "bg-teal/15 text-teal border-teal/20";
    case "suspended": return "bg-danger/15 text-danger border-danger/20";
    case "pending": return "bg-amber/15 text-amber border-amber/20";
    default: return "bg-muted text-muted-foreground";
  }
}

export function AgentTable({ agents, onSelect }: AgentTableProps) {
  return (
    <div className="animate-fade-in delay-2 rounded-md border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-mono font-semibold tracking-[0.15em] text-muted-foreground">
          REGISTERED AGENTS
        </h3>
        <p className="text-sm text-foreground mt-1">{agents.length} agents in network</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              <th className="text-left p-3 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">Agent</th>
              <th className="text-left p-3 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">Organization</th>
              <th className="text-left p-3 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">Trust</th>
              <th className="text-left p-3 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">Success</th>
              <th className="text-left p-3 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">TXs</th>
              <th className="text-left p-3 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">Capabilities</th>
              <th className="text-left p-3 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr
                key={agent.id}
                onClick={() => onSelect(agent)}
                className="border-b border-border/50 hover:bg-surface-raised cursor-pointer transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-teal/10 flex items-center justify-center">
                      <Bot size={13} className="text-teal" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{agent.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">
                        {agent.id.slice(0, 12)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{agent.organization}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} className="text-teal" />
                    <span className="font-mono font-bold text-teal text-xs">{agent.trustScore.toFixed(0)}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs text-foreground">{agent.successRate}%</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{agent.totalTransactions}</td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {agent.capabilities.slice(0, 2).map((cap) => (
                      <span
                        key={cap}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-overlay text-muted-foreground"
                      >
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <span className="text-[9px] font-mono text-muted-foreground">
                        +{agent.capabilities.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className={`text-[10px] font-mono ${statusColor(agent.status)}`}>
                    {agent.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
