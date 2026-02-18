"use client";

import { Badge } from "@/components/ui/badge";
import { Star, Clock, Zap } from "lucide-react";
import type { ServiceListing, Agent } from "@/lib/types";

interface ServiceCardProps {
  service: ServiceListing;
  provider?: Agent;
  onSelect: (service: ServiceListing) => void;
}

function pricingLabel(service: ServiceListing) {
  const p = service.pricing;
  return `$${p.basePrice.toFixed(2)}/${p.type.replace("per_", "").replace("flat_rate", "flat").replace("negotiable", "neg")}`;
}

export function ServiceCard({ service, provider, onSelect }: ServiceCardProps) {
  return (
    <div
      onClick={() => onSelect(service)}
      className="group relative rounded-md border bg-card p-4 cursor-pointer transition-all duration-300 hover:border-teal/25 hover:bg-surface-raised"
    >
      {/* Top: category + pricing */}
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant="secondary"
          className="text-[10px] font-mono tracking-wider uppercase bg-surface-overlay text-muted-foreground border-0"
        >
          {service.category}
        </Badge>
        <span className="text-xs font-mono font-semibold text-amber">
          {pricingLabel(service)}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-teal transition-colors">
        {service.name}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {service.description}
      </p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 mb-3">
        {service.capabilities.slice(0, 3).map((cap) => (
          <span
            key={cap}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal/5 text-teal-dim border border-teal/10"
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Footer metrics */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star size={11} className="text-amber" />
          {service.rating.toFixed(1)}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Zap size={11} className="text-teal" />
          {service.totalUsage.toLocaleString()} calls
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock size={11} />
          {service.sla.maxLatencyMs}ms
        </span>
      </div>

      {/* Provider */}
      {provider && (
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-teal/15 flex items-center justify-center">
            <span className="text-[8px] font-mono font-bold text-teal">
              {provider.name.charAt(0)}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate">{provider.name}</span>
          <span className="ml-auto text-[10px] font-mono text-teal-dim">
            {provider.trustScore.toFixed(0)}
          </span>
        </div>
      )}

      {/* Hover glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal/0 to-transparent group-hover:via-teal/40 transition-all duration-500" />
    </div>
  );
}
