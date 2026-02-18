"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  format?: "number" | "percent" | "currency" | "duration";
  className?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  trendLabel = "vs last 24h",
  icon,
  className,
}: MetricCardProps) {
  const trendColor =
    trend === undefined
      ? "text-probe-text-dim"
      : trend > 0
      ? "text-probe-green"
      : trend < 0
      ? "text-probe-red"
      : "text-probe-text-dim";

  // For error rate and latency, negative trends are good (green)
  const isInvertedMetric = label.toLowerCase().includes("error") || label.toLowerCase().includes("latency");
  const effectiveTrendColor =
    trend === undefined
      ? "text-probe-text-dim"
      : isInvertedMetric
      ? trend > 0
        ? "text-probe-red"
        : "text-probe-green"
      : trend > 0
      ? "text-probe-green"
      : "text-probe-red";

  return (
    <div
      className={cn(
        "group relative rounded-md border border-probe-border bg-probe-surface-1 p-4 transition-all duration-200 hover:border-probe-green/20 hover:bg-probe-surface-2",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-probe-text font-mono">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-probe-surface-3 text-probe-text-dim group-hover:text-probe-green transition-colors">
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={cn("flex items-center gap-0.5 text-xs font-medium", effectiveTrendColor)}>
            {trend > 0 ? (
              <ArrowUp size={12} />
            ) : trend < 0 ? (
              <ArrowDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-[11px] text-probe-text-dim">{trendLabel}</span>
        </div>
      )}
      {/* Subtle top accent line */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-probe-green/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
