"use client";

import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  ArrowRight,
  Check,
  X,
  Clock,
  MessageSquare,
} from "lucide-react";
import type { Negotiation, Agent, ServiceListing } from "@/lib/types";
import { format } from "date-fns";

interface NegotiationPanelProps {
  negotiations: Negotiation[];
  agents: Agent[];
  services: ServiceListing[];
}

function statusBadge(status: string) {
  switch (status) {
    case "proposed":
      return { color: "bg-blue-400/10 text-blue-400 border-blue-400/20", icon: Clock };
    case "counter":
      return { color: "bg-amber/10 text-amber border-amber/20", icon: MessageSquare };
    case "accepted":
      return { color: "bg-teal/10 text-teal border-teal/20", icon: Check };
    case "rejected":
      return { color: "bg-danger/10 text-danger border-danger/20", icon: X };
    default:
      return { color: "bg-muted text-muted-foreground", icon: Clock };
  }
}

export function NegotiationPanel({
  negotiations,
  agents,
  services,
}: NegotiationPanelProps) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  return (
    <div className="animate-fade-in delay-2 rounded-md border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-mono font-semibold tracking-[0.15em] text-muted-foreground">
          ACTIVE NEGOTIATIONS
        </h3>
        <p className="text-sm text-foreground mt-1">{negotiations.length} negotiations</p>
      </div>
      <div className="divide-y divide-border/50">
        {negotiations.map((neg) => {
          const consumer = agentMap.get(neg.consumerId);
          const provider = agentMap.get(neg.providerId);
          const service = serviceMap.get(neg.serviceId);
          const sb = statusBadge(neg.status);
          const StatusIcon = sb.icon;

          return (
            <div key={neg.id} className="p-4 hover:bg-surface-raised transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-surface-overlay flex items-center justify-center">
                    <Handshake size={14} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {service?.name || "Unknown Service"}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {consumer?.name || "Unknown"}
                      <ArrowRight size={8} />
                      {provider?.name || "Unknown"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] font-mono ${sb.color}`}>
                  <StatusIcon size={10} className="mr-1" />
                  {neg.status}
                </Badge>
              </div>

              {/* Terms */}
              <div className="ml-10 mt-2 bg-surface-raised rounded p-2.5 grid grid-cols-4 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-mono font-bold text-amber">
                    ${neg.proposedTerms.price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Volume</div>
                  <div className="font-mono text-foreground">{neg.proposedTerms.volume}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-mono text-foreground">{neg.proposedTerms.duration}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Messages</div>
                  <div className="font-mono text-foreground">{neg.messages.length}</div>
                </div>
              </div>

              {neg.counterTerms && (
                <div className="ml-10 mt-1.5 bg-amber/5 border border-amber/10 rounded p-2.5 text-xs">
                  <span className="text-amber font-mono font-semibold">Counter:</span>{" "}
                  <span className="text-muted-foreground">
                    ${neg.counterTerms.price.toFixed(2)} / {neg.counterTerms.volume} calls / {neg.counterTerms.duration}
                  </span>
                </div>
              )}

              <div className="ml-10 mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Created {format(new Date(neg.createdAt), "MMM d")}</span>
                <span>Expires {format(new Date(neg.expiresAt), "MMM d")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
