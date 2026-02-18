"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bot,
  Shield,
  Activity,
  Hash,
  Globe,
  Key,
  Calendar,
} from "lucide-react";
import type { Agent } from "@/lib/types";
import { format } from "date-fns";

interface AgentDetailProps {
  agent: Agent;
  onBack: () => void;
}

export function AgentDetail({ agent, onBack }: AgentDetailProps) {
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to agents
      </button>

      <div className="rounded-md border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border bg-surface-raised">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal/15 flex items-center justify-center glow-teal">
              <Bot size={22} className="text-teal" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-foreground">{agent.name}</h2>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    agent.status === "active"
                      ? "bg-teal/15 text-teal border-teal/20"
                      : agent.status === "pending"
                        ? "bg-amber/15 text-amber border-amber/20"
                        : "bg-danger/15 text-danger border-danger/20"
                  }`}
                >
                  {agent.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{agent.organization}</div>
              <div className="text-xs text-muted-foreground mt-1">{agent.description}</div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          {[
            { icon: Shield, label: "Trust Score", value: agent.trustScore.toFixed(1), color: "text-teal" },
            { icon: Activity, label: "Success Rate", value: `${agent.successRate}%`, color: "text-teal" },
            { icon: Hash, label: "Transactions", value: agent.totalTransactions.toString(), color: "text-amber" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="p-4 text-center">
                <Icon size={14} className="mx-auto text-muted-foreground mb-1" />
                <div className={`text-lg font-mono font-bold ${m.color}`}>{m.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3">
              CAPABILITIES
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.map((cap) => (
                <Badge
                  key={cap}
                  variant="outline"
                  className="text-[11px] font-mono bg-teal/5 text-teal-dim border-teal/15"
                >
                  {cap}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
                <Globe size={12} />
                API ENDPOINT
              </h4>
              <div className="bg-surface-raised rounded p-2.5 font-mono text-[11px] text-muted-foreground break-all">
                {agent.apiEndpoint}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
                <Key size={12} />
                PUBLIC KEY
              </h4>
              <div className="bg-surface-raised rounded p-2.5 font-mono text-[11px] text-muted-foreground break-all">
                {agent.publicKey}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              Created {format(new Date(agent.createdAt), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1.5">
              Updated {format(new Date(agent.updatedAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
