"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MarketplaceStats } from "@/lib/types";

interface VolumeChartProps {
  stats: MarketplaceStats;
}

export function VolumeChart({ stats }: VolumeChartProps) {
  const data = stats.transactionsByDay.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  }));

  return (
    <div className="animate-fade-in delay-3 rounded-md border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-mono font-semibold tracking-[0.15em] text-muted-foreground">
            TRANSACTION VOLUME
          </h3>
          <p className="text-sm text-foreground mt-1">30-day activity</p>
        </div>
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal" />
            Volume ($)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber" />
            Count
          </span>
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ff5d4" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0ff5d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5a623" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f5a623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,245,212,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#6b7a8d", fontFamily: "var(--font-geist-mono)" }}
              axisLine={{ stroke: "rgba(15,245,212,0.12)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7a8d", fontFamily: "var(--font-geist-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#151b23",
                border: "1px solid rgba(15,245,212,0.2)",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "var(--font-geist-mono)",
                color: "#c8d1dc",
              }}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#0ff5d4"
              strokeWidth={2}
              fill="url(#tealGrad)"
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#f5a623"
              strokeWidth={1.5}
              fill="url(#amberGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
