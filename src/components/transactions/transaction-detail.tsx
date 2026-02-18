"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { Transaction, Agent, EscrowAccount } from "@/lib/types";
import { format } from "date-fns";

interface TransactionDetailProps {
  transaction: Transaction;
  agents: Agent[];
  escrow?: EscrowAccount;
  onBack: () => void;
}

function logStatusIcon(status: string) {
  switch (status) {
    case "success": return <CheckCircle2 size={12} className="text-teal" />;
    case "warning": return <AlertTriangle size={12} className="text-amber" />;
    case "error": return <AlertCircle size={12} className="text-danger" />;
    default: return <Info size={12} className="text-blue-400" />;
  }
}

export function TransactionDetail({
  transaction: tx,
  agents,
  escrow,
  onBack,
}: TransactionDetailProps) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const consumer = agentMap.get(tx.consumerId);
  const provider = agentMap.get(tx.providerId);

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to transactions
      </button>

      <div className="rounded-md border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-surface-overlay flex items-center justify-center">
                <ArrowLeftRight size={18} className="text-teal" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Transaction</h2>
                <div className="text-[11px] font-mono text-muted-foreground">{tx.id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold text-amber">
                ${tx.amount.toFixed(2)}
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono mt-1 ${
                  tx.status === "completed"
                    ? "bg-teal/15 text-teal border-teal/20"
                    : tx.status === "disputed"
                      ? "bg-danger/15 text-danger border-danger/20"
                      : "bg-blue-400/15 text-blue-400 border-blue-400/20"
                }`}
              >
                {tx.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          {[
            { label: "CONSUMER", agent: consumer, side: "from" },
            { label: "PROVIDER", agent: provider, side: "to" },
          ].map(({ label, agent }) => (
            <div key={label} className="p-4">
              <div className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground mb-2">
                {label}
              </div>
              {agent ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal/10 flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-teal">
                      {agent.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{agent.name}</div>
                    <div className="text-[10px] text-muted-foreground">{agent.organization}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Unknown agent</div>
              )}
            </div>
          ))}
        </div>

        {/* Escrow info */}
        {escrow && (
          <div className="p-4 border-b border-border bg-surface-raised">
            <div className="text-[10px] font-mono font-semibold tracking-wider text-muted-foreground mb-2">
              ESCROW
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-mono font-bold text-amber">${escrow.amount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-mono text-teal capitalize">{escrow.status}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Created</div>
                <div className="font-mono text-foreground">
                  {format(new Date(escrow.createdAt), "MMM d, HH:mm")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Execution log */}
        <div className="p-5">
          <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-4">
            EXECUTION LOG
          </h4>
          <div className="space-y-0">
            {tx.executionLog.map((entry, i) => (
              <div key={i} className="flex gap-3 relative">
                {/* Timeline line */}
                {i < tx.executionLog.length - 1 && (
                  <div className="absolute left-[8px] top-[20px] bottom-0 w-px bg-border" />
                )}
                <div className="mt-1 z-10">{logStatusIcon(entry.status)}</div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{entry.event}</span>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {format(new Date(entry.timestamp), "MMM d, HH:mm:ss")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{entry.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
