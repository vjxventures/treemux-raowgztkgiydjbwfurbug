"use client";

import { useEffect, useState } from "react";
import { Shield, Bot, Activity, AlertTriangle } from "lucide-react";
import type { AnalyticsSummary } from "@/lib/types";

export function StatsCards() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-md p-5 animate-pulse h-[106px]" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "ACTIVE AGENTS",
      value: stats.activeAgents,
      total: stats.totalAgents,
      icon: Bot,
      color: "text-atp-emerald",
      bgGlow: "rgba(16, 185, 129, 0.08)",
    },
    {
      label: "VERIFICATIONS",
      value: stats.verificationsToday,
      sub: "today",
      icon: Shield,
      color: "text-atp-cyan",
      bgGlow: "rgba(6, 182, 212, 0.08)",
    },
    {
      label: "TRANSACTIONS",
      value: stats.totalTransactions,
      icon: Activity,
      color: "text-atp-violet",
      bgGlow: "rgba(139, 92, 246, 0.08)",
    },
    {
      label: "POLICY VIOLATIONS",
      value: stats.policyViolationsToday,
      sub: "today",
      icon: AlertTriangle,
      color: stats.policyViolationsToday > 0 ? "text-atp-amber" : "text-atp-emerald",
      bgGlow: stats.policyViolationsToday > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(16, 185, 129, 0.08)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-md p-5 relative overflow-hidden animate-fade-up"
          style={{ animationDelay: `${i * 80}ms`, background: `linear-gradient(135deg, #18181b, ${card.bgGlow})` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="data-label mb-2">{card.label}</p>
              <p className="text-2xl font-mono font-semibold tracking-tight text-foreground">
                {card.value}
                {card.total !== undefined && (
                  <span className="text-sm text-muted-foreground font-normal ml-1">/ {card.total}</span>
                )}
              </p>
              {card.sub && (
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{card.sub}</p>
              )}
            </div>
            <card.icon className={`w-5 h-5 ${card.color} opacity-70`} />
          </div>
        </div>
      ))}
    </div>
  );
}
