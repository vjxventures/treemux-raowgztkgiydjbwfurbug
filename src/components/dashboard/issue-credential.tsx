"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Key, Copy, CheckCircle2 } from "lucide-react";
import { PERMISSION_SCOPES } from "@/lib/types";

interface IssuedResult {
  credential: { id: string; agentName: string; agentDID: string };
  agentKeys: { publicKey: string; privateKey: string; did: string };
}

export function IssueCredential({ onIssued }: { onIssued?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [constraintType, setConstraintType] = useState("spending_limit");
  const [constraintValue, setConstraintValue] = useState("10000");
  const [constraints, setConstraints] = useState<Array<{ type: string; params: Record<string, unknown> }>>([]);
  const [issuing, setIssuing] = useState(false);
  const [result, setResult] = useState<IssuedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const addConstraint = () => {
    const params: Record<string, unknown> = {};
    switch (constraintType) {
      case "spending_limit":
        params.maxPerTransaction = parseFloat(constraintValue) || 10000;
        params.currency = "USD";
        break;
      case "rate_limit":
        params.maxRequestsPerMinute = parseInt(constraintValue) || 100;
        break;
      case "time_bound":
        params.expiresIn = constraintValue || "90d";
        break;
      case "api_scope":
        params.allowedDomains = [constraintValue || "*"];
        break;
      case "geo_fence":
        params.allowedRegions = constraintValue.split(",").map((s) => s.trim());
        break;
    }
    setConstraints((prev) => [...prev, { type: constraintType, params }]);
  };

  const handleIssue = async () => {
    if (!name || selectedPerms.length === 0) return;
    setIssuing(true);
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: name,
          permissions: selectedPerms,
          constraints,
        }),
      });
      const data = await res.json();
      setResult(data);
      onIssued?.();
    } catch {
      // handle error
    }
    setIssuing(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard?.writeText(JSON.stringify(result.agentKeys, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setName("");
    setSelectedPerms([]);
    setConstraints([]);
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs tracking-wider">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          ISSUE CREDENTIAL
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-wider text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            {result ? "CREDENTIAL ISSUED" : "ISSUE AGENT CREDENTIAL"}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 animate-fade-up">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-mono text-sm text-emerald-400">Credential issued successfully</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div>
                  <span className="text-muted-foreground">Agent: </span>
                  <span className="text-foreground">{result.credential.agentName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">DID: </span>
                  <span className="text-zinc-400 text-[10px]">{result.agentKeys.did}</span>
                </div>
              </div>
            </div>

            <div className="bg-atp-zinc-950 border border-border rounded p-3 relative">
              <p className="data-label mb-2 text-amber-400">AGENT KEYS — SAVE THESE SECURELY</p>
              <pre className="font-mono text-[10px] text-zinc-400 whitespace-pre-wrap break-all">
{JSON.stringify(result.agentKeys, null, 2)}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <Button onClick={() => { setOpen(false); reset(); }} className="w-full font-mono text-xs" variant="outline">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="data-label block mb-1.5">Agent Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-mono text-xs bg-secondary/50 border-border"
                placeholder="e.g., Invoice Processing Agent"
              />
            </div>

            <div>
              <label className="data-label block mb-2">Permissions</label>
              <div className="flex flex-wrap gap-1.5">
                {PERMISSION_SCOPES.map((perm) => (
                  <Badge
                    key={perm}
                    variant="outline"
                    className={`font-mono text-[10px] cursor-pointer transition-colors ${
                      selectedPerms.includes(perm)
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "text-muted-foreground border-border hover:border-zinc-600"
                    }`}
                    onClick={() => togglePerm(perm)}
                  >
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="data-label block mb-2">Policy Constraints</label>
              <div className="flex gap-2 mb-2">
                <Select value={constraintType} onValueChange={setConstraintType}>
                  <SelectTrigger className="font-mono text-xs bg-secondary/50 border-border w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spending_limit" className="font-mono text-xs">Spending Limit</SelectItem>
                    <SelectItem value="rate_limit" className="font-mono text-xs">Rate Limit</SelectItem>
                    <SelectItem value="time_bound" className="font-mono text-xs">Time Bound</SelectItem>
                    <SelectItem value="api_scope" className="font-mono text-xs">API Scope</SelectItem>
                    <SelectItem value="geo_fence" className="font-mono text-xs">Geo Fence</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={constraintValue}
                  onChange={(e) => setConstraintValue(e.target.value)}
                  className="font-mono text-xs bg-secondary/50 border-border flex-1"
                  placeholder="Value"
                />
                <Button variant="outline" size="sm" onClick={addConstraint} className="font-mono text-xs">
                  Add
                </Button>
              </div>
              {constraints.length > 0 && (
                <div className="space-y-1">
                  {constraints.map((c, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/30 rounded px-2 py-1 font-mono text-[10px]">
                      <span className="text-foreground uppercase">{c.type}</span>
                      <span className="text-muted-foreground">{JSON.stringify(c.params)}</span>
                      <button
                        className="text-zinc-600 hover:text-red-400 ml-2"
                        onClick={() => setConstraints((prev) => prev.filter((_, j) => j !== i))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleIssue}
              disabled={issuing || !name || selectedPerms.length === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs tracking-wider"
            >
              {issuing ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  GENERATING KEYS...
                </span>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 mr-1.5" />
                  ISSUE CREDENTIAL
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
