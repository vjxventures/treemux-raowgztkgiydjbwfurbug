"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCard,
  Globe,
  FileText,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type { Transaction } from "@/lib/types";

export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((data) => {
        setTransactions(data.transactions || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const typeConfig = {
    payment: { icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    api_call: { icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    contract: { icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10" },
    data_access: { icon: Database, color: "text-amber-400", bg: "bg-amber-500/10" },
  };

  const statusConfig = {
    completed: { icon: ArrowUpRight, color: "text-emerald-400", label: "COMPLETED" },
    pending: { icon: Clock, color: "text-amber-400", label: "PENDING" },
    failed: { icon: ArrowDownRight, color: "text-red-400", label: "FAILED" },
    disputed: { icon: AlertTriangle, color: "text-red-400", label: "DISPUTED" },
  };

  const totalVolume = transactions
    .filter((t) => t.status === "completed" && t.amount)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="data-label mb-1">AGENT TRANSACTIONS</p>
          <p className="text-sm text-muted-foreground">
            {transactions.length} total &middot; ${totalVolume.toLocaleString()} volume
          </p>
        </div>
      </div>

      <ScrollArea className="h-[360px]">
        <div className="divide-y divide-border">
          {transactions.map((txn, i) => {
            const tc = typeConfig[txn.type];
            const sc = statusConfig[txn.status];
            const TypeIcon = tc.icon;
            const StatusIcon = sc.icon;
            return (
              <div
                key={txn.id}
                className="px-4 py-3 hover:bg-white/[0.02] transition-colors animate-fade-up"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded ${tc.bg} flex items-center justify-center shrink-0`}>
                    <TypeIcon className={`w-3.5 h-3.5 ${tc.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground capitalize">{txn.type.replace("_", " ")}</span>
                      <span className="font-mono text-[10px] text-zinc-600 truncate">{txn.agentDID.slice(0, 28)}...</span>
                    </div>
                    <p className="font-mono text-[10px] text-zinc-600 mt-0.5">
                      {new Date(txn.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {txn.amount && (
                    <span className="font-mono text-xs text-foreground font-medium shrink-0">
                      ${txn.amount.toLocaleString()}
                    </span>
                  )}

                  <Badge variant="outline" className={`${sc.color} border-current/20 font-mono text-[9px] shrink-0`}>
                    <StatusIcon className="w-2.5 h-2.5 mr-1" />
                    {sc.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
