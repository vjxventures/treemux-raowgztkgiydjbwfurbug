"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle2, Eye } from "lucide-react";
import type { Dispute, Agent } from "@/lib/types";
import { format } from "date-fns";

interface DisputeListProps {
  disputes: Dispute[];
  agents: Agent[];
}

function disputeStatusConfig(status: string) {
  switch (status) {
    case "open":
      return { icon: AlertTriangle, color: "bg-danger/10 text-danger border-danger/20" };
    case "under_review":
      return { icon: Eye, color: "bg-amber/10 text-amber border-amber/20" };
    case "resolved":
      return { icon: CheckCircle2, color: "bg-teal/10 text-teal border-teal/20" };
    default:
      return { icon: Clock, color: "bg-muted text-muted-foreground" };
  }
}

export function DisputeList({ disputes, agents }: DisputeListProps) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  if (disputes.length === 0) {
    return (
      <div className="animate-fade-in delay-2 rounded-md border bg-card p-8 text-center">
        <CheckCircle2 size={24} className="mx-auto text-teal mb-2" />
        <p className="text-sm text-foreground">No active disputes</p>
        <p className="text-xs text-muted-foreground mt-1">All transactions are running smoothly</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in delay-2 rounded-md border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-mono font-semibold tracking-[0.15em] text-muted-foreground">
          DISPUTE RESOLUTION
        </h3>
        <p className="text-sm text-foreground mt-1">{disputes.length} disputes</p>
      </div>
      <div className="divide-y divide-border/50">
        {disputes.map((dispute) => {
          const filer = agentMap.get(dispute.filedBy);
          const target = agentMap.get(dispute.against);
          const sc = disputeStatusConfig(dispute.status);
          const StatusIcon = sc.icon;

          return (
            <div key={dispute.id} className="p-4 hover:bg-surface-raised transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-danger/10 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-danger" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{dispute.reason}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {dispute.id.slice(0, 16)}...
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] font-mono ${sc.color}`}>
                  <StatusIcon size={10} className="mr-1" />
                  {dispute.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="ml-11 mt-1 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Filed by</div>
                  <div className="text-foreground">{filer?.name || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Against</div>
                  <div className="text-foreground">{target?.name || "Unknown"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Filed</div>
                  <div className="font-mono text-foreground">
                    {format(new Date(dispute.createdAt), "MMM d, HH:mm")}
                  </div>
                </div>
              </div>
              <div className="ml-11 mt-2 flex gap-1.5">
                {dispute.evidence.map((e) => (
                  <span
                    key={e}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-overlay text-muted-foreground"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
