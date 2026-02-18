"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  FlaskConical,
  LayoutDashboard,
  Settings,
  Workflow,
  Zap,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  id: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, id: "dashboard" },
  { label: "Traces", icon: <Workflow size={18} />, id: "traces" },
  { label: "Agents", icon: <Box size={18} />, id: "agents" },
  { label: "Evaluations", icon: <FlaskConical size={18} />, id: "evals" },
  { label: "Sandbox", icon: <Zap size={18} />, id: "sandbox" },
  { label: "Alerts", icon: <Bell size={18} />, id: "alerts", badge: "3" },
];

const bottomItems: NavItem[] = [
  { label: "Analytics", icon: <BarChart3 size={18} />, id: "analytics" },
  { label: "Settings", icon: <Settings size={18} />, id: "settings" },
];

export function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-probe-border bg-probe-surface">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-probe-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-probe-green/10 border border-probe-green/20">
          <Activity size={14} className="text-probe-green" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight text-probe-text">
            AgentProbe
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        <p className="px-2 pb-2 pt-1 text-[10px] font-medium uppercase tracking-widest text-probe-text-dim">
          Monitor
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
              activeTab === item.id
                ? "bg-probe-green/10 text-probe-green"
                : "text-probe-text-dim hover:bg-probe-surface-2 hover:text-probe-text"
            )}
          >
            <span
              className={cn(
                activeTab === item.id ? "text-probe-green" : "text-probe-text-dim"
              )}
            >
              {item.icon}
            </span>
            {item.label}
            {item.badge && (
              <span className="ml-auto flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-probe-red/15 px-1 text-[10px] font-semibold text-probe-red">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-probe-border px-3 py-3 space-y-0.5">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
              activeTab === item.id
                ? "bg-probe-green/10 text-probe-green"
                : "text-probe-text-dim hover:bg-probe-surface-2 hover:text-probe-text"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="border-t border-probe-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-probe-green animate-pulse-dot" />
          <span className="text-[11px] text-probe-text-dim">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
