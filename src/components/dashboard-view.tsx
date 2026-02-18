"use client";

import { useEffect, useState } from "react";
import type { DashboardMetrics } from "@/lib/types";
import { MetricCard } from "./metric-card";
import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  Box,
  FlaskConical,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-probe-border bg-probe-surface-1 p-4",
        className
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-probe-text-dim mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

export function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setMetrics);
  }, []);

  if (!metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-probe-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Top metrics */}
      <div className="grid grid-cols-6 gap-3">
        <MetricCard
          label="Traces (24h)"
          value={metrics.tracesLast24h.toLocaleString()}
          trend={metrics.tracesTrend}
          icon={<Activity size={16} />}
        />
        <MetricCard
          label="Avg Latency"
          value={`${(metrics.avgLatency / 1000).toFixed(2)}s`}
          trend={metrics.latencyTrend}
          icon={<Clock size={16} />}
        />
        <MetricCard
          label="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          trend={metrics.errorRateTrend}
          icon={<AlertTriangle size={16} />}
        />
        <MetricCard
          label="Total Cost"
          value={`$${metrics.totalCost.toFixed(2)}`}
          trend={metrics.costTrend}
          icon={<DollarSign size={16} />}
        />
        <MetricCard
          label="Active Agents"
          value={metrics.activeAgents.toString()}
          icon={<Box size={16} />}
        />
        <MetricCard
          label="Eval Pass Rate"
          value={`${metrics.evalPassRate.toFixed(1)}%`}
          trend={metrics.evalPassRateTrend}
          icon={<FlaskConical size={16} />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-3">
        <ChartCard title="Trace Volume (24h)">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={metrics.traceVolumeTimeSeries}>
              <defs>
                <linearGradient id="traceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={{ stroke: "#2a2e35" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1c1f23",
                  border: "1px solid #2a2e35",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#e4e7eb",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#22c55e"
                strokeWidth={1.5}
                fill="url(#traceGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Latency Percentiles (24h)">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={metrics.latencyTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={{ stroke: "#2a2e35" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1c1f23",
                  border: "1px solid #2a2e35",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#e4e7eb",
                }}
              />
              <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-3 gap-3">
        <ChartCard title="Error Rate (24h)">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={metrics.errorTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "#6b7280" }}
                axisLine={{ stroke: "#2a2e35" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1c1f23",
                  border: "1px solid #2a2e35",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#e4e7eb",
                }}
              />
              <Bar dataKey="errors" fill="#ef4444" radius={[2, 2, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost (24h)">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={metrics.costTimeSeries}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "#6b7280" }}
                axisLine={{ stroke: "#2a2e35" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1c1f23",
                  border: "1px solid #2a2e35",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#e4e7eb",
                }}
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#costGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Agents */}
        <ChartCard title="Top Agents by Volume">
          <div className="space-y-2.5">
            {metrics.topAgentsByTraces.map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-2">
                <span className="w-4 text-[10px] font-mono text-probe-text-dim text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-probe-text truncate">
                      {agent.name}
                    </span>
                    <span className="text-[10px] font-mono text-probe-text-dim ml-2">
                      {agent.traces.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-probe-surface-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-probe-green animate-waterfall"
                      style={{
                        width: `${(agent.traces / metrics.topAgentsByTraces[0].traces) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent Alerts */}
      <ChartCard title="Recent Alerts">
        <div className="space-y-1">
          {metrics.recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 rounded px-3 py-2 hover:bg-probe-surface-2 transition-colors"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  alert.severity === "critical"
                    ? "bg-probe-red animate-pulse-dot"
                    : alert.severity === "warning"
                    ? "bg-probe-amber"
                    : "bg-probe-blue"
                )}
              />
              <span className="text-[12px] font-medium text-probe-text flex-1">
                {alert.title}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-mono",
                  alert.severity === "critical"
                    ? "text-probe-red border-probe-red/30"
                    : alert.severity === "warning"
                    ? "text-probe-amber border-probe-amber/30"
                    : "text-probe-blue border-probe-blue/30"
                )}
              >
                {alert.severity}
              </Badge>
              <span className="text-[10px] text-probe-text-dim font-mono">
                {alert.agentName}
              </span>
              <span className="text-[10px] text-probe-text-dim">
                {new Date(alert.triggeredAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
