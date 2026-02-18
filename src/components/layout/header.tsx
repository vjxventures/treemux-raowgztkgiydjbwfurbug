"use client";

import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-md bg-teal/15 flex items-center justify-center glow-teal">
            <Activity size={16} className="text-teal" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-teal pulse-ring" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              Agent<span className="text-teal">Exchange</span>
            </h1>
            <p className="text-[9px] font-mono tracking-[0.3em] text-muted-foreground uppercase">
              Agent-to-Agent Marketplace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            NETWORK ONLINE
          </div>
          <div className="h-6 w-px bg-border hidden md:block" />
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>v0.1.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}
