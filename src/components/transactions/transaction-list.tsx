"use client";

import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";
import type { Transaction, Agent } from "@/lib/types";
import { format } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
  agents: Agent[];
  onSelect: (tx: Transaction) => void;
}

function statusConfig(status: string) {
  switch (status) {
    case "completed":
      return { icon: CheckCircle2, color: "text-teal", bg: "bg-teal/10 border-teal/20", label: "Completed" };
    case "in_escrow":
      return { icon: Lock, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", label: "In Escrow" };
    case "executing":
      return { icon: Loader2, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", label: "Executing" };
    case "disputed":
      return { icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10 border-danger/20", label: "Disputed" };
    case "pending":
      return { icon: Clock, color: "text-amber", bg: "bg-amber/10 border-amber/20", label: "Pending" };
    default:
      return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", label: status };
  }
}

export function TransactionList({ transactions, agents, onSelect }: TransactionListProps) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  return (
    <div className="animate-fade-in delay-2 rounded-md border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-mono font-semibold tracking-[0.15em] text-muted-foreground">
          TRANSACTION LEDGER
        </h3>
        <p className="text-sm text-foreground mt-1">{transactions.length} transactions</p>
      </div>
      <div className="divide-y divide-border/50">
        {transactions.map((tx) => {
          const consumer = agentMap.get(tx.consumerId);
          const provider = agentMap.get(tx.providerId);
          const sc = statusConfig(tx.status);
          const StatusIcon = sc.icon;

          return (
            <div
              key={tx.id}
              onClick={() => onSelect(tx)}
              className="p-4 hover:bg-surface-raised cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-surface-overlay flex items-center justify-center">
                    <ArrowLeftRight size={14} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground font-medium">
                      {consumer?.name || "Unknown"}{" "}
                      <span className="text-muted-foreground mx-1">&rarr;</span>{" "}
                      {provider?.name || "Unknown"}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {tx.id.slice(0, 16)}...
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-amber">
                    ${tx.amount.toFixed(2)}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono ${sc.bg} ${sc.color} mt-0.5`}
                  >
                    <StatusIcon size={10} className="mr-1" />
                    {sc.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground ml-11">
                <span>{format(new Date(tx.startedAt), "MMM d, HH:mm")}</span>
                {tx.completedAt && (
                  <span className="text-teal">
                    Completed {format(new Date(tx.completedAt), "MMM d, HH:mm")}
                  </span>
                )}
                <span className="ml-auto font-mono">{tx.executionLog.length} events</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
