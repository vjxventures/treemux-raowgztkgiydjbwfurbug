"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, ShieldCheck, ShieldOff, ShieldAlert, ChevronRight } from "lucide-react";
import type { AgentCredential, AuditEntry } from "@/lib/types";
import { CredentialDetail } from "./credential-detail";

export function CredentialsTable() {
  const [credentials, setCredentials] = useState<AgentCredential[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credentials")
      .then((r) => r.json())
      .then((data) => {
        setCredentials(data.credentials || []);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/credentials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: status as AgentCredential["status"] } : c))
    );
  };

  const statusConfig = {
    active: { icon: ShieldCheck, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    suspended: { icon: ShieldAlert, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    revoked: { icon: ShieldOff, color: "bg-red-500/10 text-red-400 border-red-500/20" },
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border-b border-border animate-pulse">
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="data-label mb-1">AGENT CREDENTIALS</p>
          <p className="text-sm text-muted-foreground">
            {credentials.length} issued &middot; {credentials.filter((c) => c.status === "active").length} active
          </p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {credentials.map((cred, i) => {
          const cfg = statusConfig[cred.status];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={cred.id}
              className="px-4 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setSelectedId(selectedId === cred.id ? null : cred.id)}
            >
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                <StatusIcon className={`w-4 h-4 ${cred.status === "active" ? "text-emerald-400" : cred.status === "suspended" ? "text-amber-400" : "text-red-400"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{cred.agentName}</p>
                <p className="font-mono text-xs text-muted-foreground truncate mt-0.5">{cred.agentDID}</p>
              </div>

              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                {cred.permissions.slice(0, 3).map((p) => (
                  <Badge key={p} variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                    {p}
                  </Badge>
                ))}
                {cred.permissions.length > 3 && (
                  <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                    +{cred.permissions.length - 3}
                  </Badge>
                )}
              </div>

              <Badge variant="outline" className={`${cfg.color} font-mono text-[10px] uppercase shrink-0`}>
                {cred.status}
              </Badge>

              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedId === cred.id ? "rotate-90" : ""}`} />
            </div>
          );
        })}
      </div>

      {selectedId && (
        <div className="border-t border-border">
          <CredentialDetail
            credentialId={selectedId}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}
    </div>
  );
}
