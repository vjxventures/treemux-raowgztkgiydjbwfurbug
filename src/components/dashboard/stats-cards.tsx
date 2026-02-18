"use client";

import { Bot, Layers, ArrowLeftRight, DollarSign, Handshake, Shield } from "lucide-react";
import type { MarketplaceStats } from "@/lib/types";

interface StatsCardsProps {
  stats: MarketplaceStats;
}

const formatNumber = (n: number) => n.toLocaleString();
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "AGENTS",
      value: formatNumber(stats.totalAgents),
      icon: Bot,
      accent: "teal" as const,
      sub: `${stats.avgTrustScore} avg trust`,
    },
    {
      label: "SERVICES",
      value: formatNumber(stats.totalServices),
      icon: Layers,
      accent: "teal" as const,
      sub: `${stats.topCategories.length} categories`,
    },
    {
      label: "TRANSACTIONS",
      value: formatNumber(stats.totalTransactions),
      icon: ArrowLeftRight,
      accent: "amber" as const,
      sub: "all time",
    },
    {
      label: "VOLUME",
      value: formatCurrency(stats.totalVolume),
      icon: DollarSign,
      accent: "amber" as const,
      sub: "total processed",
    },
    {
      label: "NEGOTIATIONS",
      value: formatNumber(stats.activeNegotiations),
      icon: Handshake,
      accent: "teal" as const,
      sub: "active now",
    },
    {
      label: "TRUST SCORE",
      value: stats.avgTrustScore.toString(),
      icon: Shield,
      accent: "teal" as const,
      sub: "network avg",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isTeal = card.accent === "teal";
        return (
          <div
            key={card.label}
            className={`animate-fade-in delay-${i + 1} relative overflow-hidden rounded-md border bg-card p-4 transition-all duration-300 hover:border-opacity-40 ${isTeal ? "hover:border-teal/30" : "hover:border-amber/30"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-semibold tracking-[0.2em] text-muted-foreground">
                {card.label}
              </span>
              <Icon
                size={14}
                className={isTeal ? "text-teal" : "text-amber"}
                strokeWidth={2}
              />
            </div>
            <div className={`text-xl font-bold font-mono tracking-tight ${isTeal ? "text-teal" : "text-amber"}`}>
              {card.value}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">{card.sub}</div>
            <div
              className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-[0.03] ${isTeal ? "bg-teal" : "bg-amber"}`}
            />
          </div>
        );
      })}
    </div>
  );
}
