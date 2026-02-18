"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Clock,
  Link2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Ban,
} from "lucide-react";
import type { AgentCredential, AuditEntry } from "@/lib/types";

interface Props {
  credentialId: string;
  onStatusChange: (id: string, status: string) => void;
}

export function CredentialDetail({ credentialId, onStatusChange }: Props) {
  const [credential, setCredential] = useState<AgentCredential | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/credentials/${credentialId}`)
      .then((r) => r.json())
      .then((data) => {
        setCredential(data.credential);
        setAuditEntries(data.auditEntries || []);
        setLoading(false);
      });
  }, [credentialId]);

  if (loading || !credential) {
    return <div className="p-6 animate-pulse"><div className="h-40 bg-muted rounded" /></div>;
  }

  const constraintLabels: Record<string, string> = {
    spending_limit: "Spending Limit",
    api_scope: "API Scope",
    time_bound: "Time Bound",
    rate_limit: "Rate Limit",
    geo_fence: "Geo Fence",
  };

  return (
    <div className="p-5 space-y-5 animate-fade-up bg-atp-zinc-950/50">
      {/* Header with actions */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-medium text-foreground">{credential.agentName}</h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">{credential.agentDID}</p>
        </div>
        <div className="flex gap-2">
          {credential.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 text-xs"
              onClick={() => onStatusChange(credential.id, "suspended")}
            >
              <Pause className="w-3 h-3 mr-1" /> Suspend
            </Button>
          )}
          {credential.status === "suspended" && (
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 text-xs"
              onClick={() => onStatusChange(credential.id, "active")}
            >
              <Play className="w-3 h-3 mr-1" /> Reactivate
            </Button>
          )}
          {credential.status !== "revoked" && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10 text-xs"
              onClick={() => onStatusChange(credential.id, "revoked")}
            >
              <Ban className="w-3 h-3 mr-1" /> Revoke
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Permissions */}
        <div className="space-y-2">
          <p className="data-label flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Permissions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {credential.permissions.map((p) => (
              <Badge key={p} variant="secondary" className="font-mono text-[10px] px-2 py-0.5 bg-emerald-500/5 text-emerald-400 border border-emerald-500/20">
                {p}
              </Badge>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-2">
          <p className="data-label flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" /> Policy Constraints
          </p>
          <div className="space-y-1.5">
            {credential.constraints.map((c, i) => (
              <div key={i} className="bg-secondary/50 rounded px-2.5 py-1.5 border border-border">
                <p className="font-mono text-[10px] text-foreground uppercase tracking-wider">
                  {constraintLabels[c.type] || c.type}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                  {Object.entries(c.params).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(" | ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <p className="data-label flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Lifecycle
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issued</span>
              <span className="text-foreground">{new Date(credential.issuedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span className="text-foreground">{new Date(credential.expiresAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signature</span>
              <span className="text-zinc-500 truncate ml-2 max-w-[120px]">{credential.issuerSignature.slice(0, 16)}...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authority Chain */}
      <div>
        <p className="data-label flex items-center gap-1.5 mb-3">
          <Link2 className="w-3 h-3" /> Authority Chain
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {credential.authorityChain.map((link, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className="bg-secondary/50 border border-border rounded px-3 py-2 max-w-[200px]">
                <p className="font-mono text-[10px] text-muted-foreground">FROM</p>
                <p className="font-mono text-[10px] text-foreground truncate">{link.fromDID.slice(0, 24)}...</p>
              </div>
              <div className="text-emerald-400 text-xs font-mono">→</div>
              <div className="bg-secondary/50 border border-border rounded px-3 py-2 max-w-[200px]">
                <p className="font-mono text-[10px] text-muted-foreground">TO</p>
                <p className="font-mono text-[10px] text-foreground truncate">{link.toDID.slice(0, 24)}...</p>
              </div>
              {i < credential.authorityChain.length - 1 && (
                <div className="text-zinc-600 text-xs font-mono">|</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Entries */}
      {auditEntries.length > 0 && (
        <div>
          <p className="data-label mb-2">RECENT ACTIVITY ({auditEntries.length} entries)</p>
          <div className="space-y-1">
            {auditEntries.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 font-mono text-[11px] py-1.5 px-2 rounded hover:bg-white/[0.02]">
                {entry.result === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : entry.result === "denied" ? (
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="text-foreground">{entry.action}</span>
                <span className="text-muted-foreground truncate">{entry.target}</span>
                <span className="text-zinc-600 ml-auto shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
