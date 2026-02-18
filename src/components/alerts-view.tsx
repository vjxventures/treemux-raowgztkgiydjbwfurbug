"use client";

import { useEffect, useState } from "react";
import type { Alert } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
} from "lucide-react";

const severityConfig = {
  critical: {
    icon: <XCircle size={16} />,
    color: "text-probe-red",
    bg: "bg-probe-red/10",
    border: "border-probe-red/20",
    glow: "glow-red",
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    color: "text-probe-amber",
    bg: "bg-probe-amber/10",
    border: "border-probe-amber/20",
    glow: "glow-amber",
  },
  info: {
    icon: <Info size={16} />,
    color: "text-probe-blue",
    bg: "bg-probe-blue/10",
    border: "border-probe-blue/20",
    glow: "",
  },
};

export function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then(setAlerts);
  }, []);

  const active = alerts.filter((a) => !a.resolvedAt);
  const resolved = alerts.filter((a) => a.resolvedAt);

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Active alerts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell size={14} className="text-probe-red" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim">
            Active Alerts ({active.length})
          </span>
        </div>
        <div className="space-y-2">
          {active.map((alert) => {
            const cfg = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-md border bg-probe-surface-1 p-4 transition-all",
                  cfg.border,
                  cfg.glow
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn("mt-0.5", cfg.color)}>{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[14px] font-medium text-probe-text">
                        {alert.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-mono", cfg.color, cfg.border)}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-[12px] text-probe-text-dim leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-mono text-probe-text-dim">
                        Agent: {alert.agentName}
                      </span>
                      <span className="text-[10px] font-mono text-probe-text-dim">
                        Metric: {alert.metric}
                      </span>
                      <span className="text-[10px] font-mono text-probe-text-dim">
                        Threshold: {alert.threshold.toFixed(1)} | Actual: {alert.actualValue.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-probe-text-dim ml-auto">
                        {new Date(alert.triggeredAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button className="rounded px-2.5 py-1 text-[11px] font-medium text-probe-text-dim border border-probe-border hover:bg-probe-surface-3 hover:text-probe-text transition-colors">
                    Acknowledge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={14} className="text-probe-green" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim">
              Resolved ({resolved.length})
            </span>
          </div>
          <div className="space-y-2">
            {resolved.map((alert) => (
              <div
                key={alert.id}
                className="rounded-md border border-probe-border bg-probe-surface-1 p-4 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-probe-green" />
                  <span className="text-[13px] text-probe-text">{alert.title}</span>
                  <Badge variant="outline" className="text-[10px] font-mono text-probe-green border-probe-green/30">
                    resolved
                  </Badge>
                  <span className="text-[10px] text-probe-text-dim ml-auto">
                    Resolved {new Date(alert.resolvedAt!).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
