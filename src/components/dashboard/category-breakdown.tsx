"use client";

import type { MarketplaceStats } from "@/lib/types";

interface CategoryBreakdownProps {
  stats: MarketplaceStats;
}

export function CategoryBreakdown({ stats }: CategoryBreakdownProps) {
  const maxCount = Math.max(...stats.topCategories.map((c) => c.count));
  const colors = ["#0ff5d4", "#f5a623", "#7c6aef", "#3b82f6", "#f5424b", "#0bb89e", "#c4851c"];

  return (
    <div className="animate-fade-in delay-4 rounded-md border bg-card p-5">
      <h3 className="text-xs font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-1">
        SERVICE CATEGORIES
      </h3>
      <p className="text-sm text-foreground mb-4">Distribution by type</p>
      <div className="space-y-3">
        {stats.topCategories.map((cat, i) => (
          <div key={cat.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground">{cat.name}</span>
              <span className="font-mono text-muted-foreground">{cat.count}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(cat.count / maxCount) * 100}%`,
                  backgroundColor: colors[i % colors.length],
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
