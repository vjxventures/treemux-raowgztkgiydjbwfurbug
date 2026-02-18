"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle, Hash, ArrowRight } from "lucide-react";
import type { AuditEntry } from "@/lib/types";

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const resultIcon = {
    success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    denied: <XCircle className="w-3.5 h-3.5 text-red-400" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
  };

  const resultColor = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    denied: "bg-red-500/10 text-red-400 border-red-500/20",
    error: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="data-label mb-1">TAMPER-EVIDENT AUDIT LOG</p>
          <p className="text-sm text-muted-foreground">
            {entries.length} entries &middot; Merkle chain verified
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 status-active" />
          <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-border">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="px-4 py-3 hover:bg-white/[0.02] transition-colors animate-fade-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-3">
                {resultIcon[entry.result]}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-foreground">{entry.action}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <span className="font-mono text-xs text-muted-foreground truncate">{entry.target}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-zinc-600 truncate max-w-[200px]">
                      {entry.agentDID}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className={`${resultColor[entry.result]} font-mono text-[9px] uppercase shrink-0`}>
                  {entry.result}
                </Badge>

                <span className="font-mono text-[10px] text-zinc-600 shrink-0 hidden lg:inline">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Hash chain visualization */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <Hash className="w-2.5 h-2.5 text-zinc-700" />
                <span className="hash-display">{entry.entryHash.slice(0, 32)}...</span>
                <span className="text-zinc-700 font-mono text-[9px]">← {entry.previousHash.slice(0, 12)}...</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
