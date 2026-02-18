"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardView } from "@/components/dashboard-view";
import { TracesView } from "@/components/traces-view";
import { AgentsView } from "@/components/agents-view";
import { EvalsView } from "@/components/evals-view";
import { SandboxView } from "@/components/sandbox-view";
import { AlertsView } from "@/components/alerts-view";
import {
  Activity,
  Clock,
} from "lucide-react";

const tabTitles: Record<string, string> = {
  dashboard: "Dashboard",
  traces: "Traces",
  agents: "Agents",
  evals: "Evaluations",
  sandbox: "Sandbox Simulation",
  alerts: "Alerts",
  analytics: "Analytics",
  settings: "Settings",
};

const tabDescriptions: Record<string, string> = {
  dashboard: "Real-time overview of agent performance and reliability metrics",
  traces: "Inspect individual agent execution traces with step-by-step waterfall visualization",
  agents: "Manage agent versions, configurations, and performance baselines",
  evals: "Run evaluation suites, review results, and track regression across agent versions",
  sandbox: "Simulate agent behavior in isolated environments with adversarial and load testing",
  alerts: "Monitor and respond to reliability incidents and threshold violations",
  analytics: "Deep analysis of agent performance trends and cost optimization",
  settings: "Configure integrations, thresholds, and team access controls",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-probe-surface">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-56 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-probe-border bg-probe-surface/80 backdrop-blur-md px-6">
          <div>
            <h1 className="text-[15px] font-semibold text-probe-text">
              {tabTitles[activeTab]}
            </h1>
            <p className="text-[11px] text-probe-text-dim">
              {tabDescriptions[activeTab]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-md border border-probe-border bg-probe-surface-1 px-2.5 py-1.5">
              <Activity size={12} className="text-probe-green animate-pulse-dot" />
              <span className="text-[11px] font-mono text-probe-text-dim">Live</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-probe-border bg-probe-surface-1 px-2.5 py-1.5">
              <Clock size={12} className="text-probe-text-dim" />
              <span className="text-[11px] font-mono text-probe-text-dim">Last 24h</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "traces" && <TracesView />}
          {activeTab === "agents" && <AgentsView />}
          {activeTab === "evals" && <EvalsView />}
          {activeTab === "sandbox" && <SandboxView />}
          {activeTab === "alerts" && <AlertsView />}
          {activeTab === "analytics" && (
            <div className="flex h-64 items-center justify-center rounded-md border border-probe-border bg-probe-surface-1">
              <p className="text-[13px] text-probe-text-dim">Analytics view coming soon</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="flex h-64 items-center justify-center rounded-md border border-probe-border bg-probe-surface-1">
              <p className="text-[13px] text-probe-text-dim">Settings view coming soon</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
