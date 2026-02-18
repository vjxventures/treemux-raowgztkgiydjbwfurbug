"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Clock,
  Zap,
  Shield,
  ArrowLeft,
  FileText,
  DollarSign,
  Activity,
  ChevronRight,
} from "lucide-react";
import type { ServiceListing, Agent } from "@/lib/types";

interface ServiceDetailProps {
  service: ServiceListing;
  provider?: Agent;
  onBack: () => void;
  onNegotiate: () => void;
}

export function ServiceDetail({
  service,
  provider,
  onBack,
  onNegotiate,
}: ServiceDetailProps) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to marketplace
      </button>

      <div className="rounded-md border bg-card overflow-hidden">
        {/* Title bar */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <Badge
                variant="secondary"
                className="text-[10px] font-mono tracking-wider uppercase bg-surface-overlay text-muted-foreground border-0 mb-2"
              >
                {service.category}
              </Badge>
              <h2 className="text-lg font-bold text-foreground">{service.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {service.description}
              </p>
            </div>
            <Button
              onClick={onNegotiate}
              className="bg-teal text-background font-semibold hover:bg-teal/90 glow-teal"
            >
              Negotiate Contract
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
          {[
            { icon: Star, label: "Rating", value: service.rating.toFixed(1), color: "text-amber" },
            { icon: Zap, label: "Usage", value: `${service.totalUsage.toLocaleString()}`, color: "text-teal" },
            { icon: Clock, label: "Latency", value: `${service.sla.maxLatencyMs}ms`, color: "text-foreground" },
            { icon: Activity, label: "Uptime", value: `${service.sla.uptimeGuarantee}%`, color: "text-teal" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="p-4 text-center">
                <Icon size={14} className="mx-auto text-muted-foreground mb-1" />
                <div className={`text-sm font-mono font-bold ${m.color}`}>{m.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-0 divide-x divide-border">
          {/* Left: Pricing & SLA */}
          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
                <DollarSign size={12} className="text-amber" />
                PRICING MODEL
              </h4>
              <div className="bg-surface-raised rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-mono text-amber capitalize">
                    {service.pricing.type.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="font-mono font-bold text-foreground">
                    ${service.pricing.basePrice.toFixed(2)}
                  </span>
                </div>
                {service.pricing.volumeDiscounts?.map((vd, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {vd.threshold.toLocaleString()}+ calls
                    </span>
                    <span className="font-mono text-teal">-{(vd.discount * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
                <Shield size={12} className="text-teal" />
                SLA TERMS
              </h4>
              <div className="bg-surface-raised rounded p-3 space-y-2">
                {[
                  ["Max Latency", `${service.sla.maxLatencyMs}ms`],
                  ["Uptime Guarantee", `${service.sla.uptimeGuarantee}%`],
                  ["Max Retries", `${service.sla.maxRetries}`],
                  ["Timeout", `${service.sla.timeoutMs}ms`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Provider & Capabilities */}
          <div className="p-5 space-y-4">
            {provider && (
              <div>
                <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3">
                  PROVIDER
                </h4>
                <div className="bg-surface-raised rounded p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-md bg-teal/15 flex items-center justify-center">
                      <span className="text-sm font-mono font-bold text-teal">
                        {provider.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{provider.name}</div>
                      <div className="text-[11px] text-muted-foreground">{provider.organization}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-sm font-mono font-bold text-teal">{provider.trustScore.toFixed(0)}</div>
                      <div className="text-[10px] text-muted-foreground">trust</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-overlay rounded px-2 py-1.5">
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-mono text-teal">{provider.successRate}%</div>
                    </div>
                    <div className="bg-surface-overlay rounded px-2 py-1.5">
                      <div className="text-muted-foreground">Transactions</div>
                      <div className="font-mono text-foreground">{provider.totalTransactions}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
                <FileText size={12} />
                CAPABILITIES
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {service.capabilities.map((cap) => (
                  <Badge
                    key={cap}
                    variant="outline"
                    className="text-[11px] font-mono bg-teal/5 text-teal-dim border-teal/15"
                  >
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.15em] text-muted-foreground mb-3">
                SCHEMAS
              </h4>
              <div className="bg-surface-raised rounded p-3 font-mono text-[11px] text-muted-foreground">
                <div className="mb-2">
                  <span className="text-teal">input:</span>{" "}
                  {JSON.stringify(service.inputSchema, null, 0)}
                </div>
                <div>
                  <span className="text-amber">output:</span>{" "}
                  {JSON.stringify(service.outputSchema, null, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
