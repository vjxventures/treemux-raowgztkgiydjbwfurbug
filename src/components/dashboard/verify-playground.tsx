"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Zap, Terminal, Copy, ChevronDown } from "lucide-react";
import type { AgentCredential, VerificationResult } from "@/lib/types";

export function VerifyPlayground() {
  const [credentials, setCredentials] = useState<AgentCredential[]>([]);
  const [selectedDID, setSelectedDID] = useState("");
  const [action, setAction] = useState("payment.authorize");
  const [target, setTarget] = useState("transfer:TXN-demo-001");
  const [amount, setAmount] = useState("5000");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showCurl, setShowCurl] = useState(false);

  useEffect(() => {
    fetch("/api/credentials")
      .then((r) => r.json())
      .then((data) => {
        const creds = data.credentials || [];
        setCredentials(creds);
        if (creds.length > 0) setSelectedDID(creds[0].agentDID);
      });
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentDID: selectedDID,
          action,
          target,
          parameters: { amount: parseFloat(amount) || 0 },
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        verified: false,
        agentDID: selectedDID,
        permissions: [],
        constraintsPassed: false,
        policyEvaluations: [],
        authorityChainValid: false,
        reason: "Network error",
      });
    }
    setVerifying(false);
  };

  const curlCommand = `curl -X POST /api/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentDID": "${selectedDID}",
    "action": "${action}",
    "target": "${target}",
    "parameters": { "amount": ${amount} },
    "timestamp": "${new Date().toISOString()}"
  }'`;

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="data-label mb-1">VERIFICATION PLAYGROUND</p>
          <p className="text-sm text-muted-foreground">
            Test agent authorization in real-time
          </p>
        </div>
        <Zap className="w-4 h-4 text-atp-cyan opacity-60" />
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="data-label block mb-1.5">Agent</label>
            <Select value={selectedDID} onValueChange={setSelectedDID}>
              <SelectTrigger className="font-mono text-xs bg-secondary/50 border-border">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((c) => (
                  <SelectItem key={c.agentDID} value={c.agentDID} className="font-mono text-xs">
                    {c.agentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="data-label block mb-1.5">Action</label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="font-mono text-xs bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment.authorize" className="font-mono text-xs">payment.authorize</SelectItem>
                <SelectItem value="payment.initiate" className="font-mono text-xs">payment.initiate</SelectItem>
                <SelectItem value="contract.negotiate" className="font-mono text-xs">contract.negotiate</SelectItem>
                <SelectItem value="contract.sign" className="font-mono text-xs">contract.sign</SelectItem>
                <SelectItem value="api.invoke" className="font-mono text-xs">api.invoke</SelectItem>
                <SelectItem value="data.read" className="font-mono text-xs">data.read</SelectItem>
                <SelectItem value="data.write" className="font-mono text-xs">data.write</SelectItem>
                <SelectItem value="data.delete" className="font-mono text-xs">data.delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="data-label block mb-1.5">Target</label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="font-mono text-xs bg-secondary/50 border-border"
              placeholder="transfer:TXN-001"
            />
          </div>

          <div>
            <label className="data-label block mb-1.5">Amount (USD)</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono text-xs bg-secondary/50 border-border"
              placeholder="5000"
              type="number"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleVerify}
            disabled={verifying || !selectedDID}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs tracking-wider"
          >
            {verifying ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                VERIFYING
              </span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                VERIFY AUTHORIZATION
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="font-mono text-[10px] text-muted-foreground"
            onClick={() => setShowCurl(!showCurl)}
          >
            <Terminal className="w-3 h-3 mr-1" /> cURL
            <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showCurl ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {showCurl && (
          <div className="relative bg-atp-zinc-950 border border-border rounded p-3 animate-fade-up">
            <pre className="font-mono text-[10px] text-zinc-400 overflow-x-auto whitespace-pre">{curlCommand}</pre>
            <button
              className="absolute top-2 right-2 text-zinc-600 hover:text-zinc-400 transition-colors"
              onClick={() => navigator.clipboard?.writeText(curlCommand)}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`rounded border p-4 animate-fade-up ${
              result.verified
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {result.verified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-mono text-sm font-semibold ${result.verified ? "text-emerald-400" : "text-red-400"}`}>
                {result.verified ? "AUTHORIZED" : "DENIED"}
              </span>
              {result.reason && (
                <span className="font-mono text-xs text-muted-foreground ml-2">— {result.reason}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div>
                <p className="text-zinc-600 mb-1">Authority Chain</p>
                <Badge variant="outline" className={`${result.authorityChainValid ? "text-emerald-400 border-emerald-500/20" : "text-red-400 border-red-500/20"} text-[9px]`}>
                  {result.authorityChainValid ? "VALID" : "INVALID"}
                </Badge>
              </div>
              <div>
                <p className="text-zinc-600 mb-1">Constraints</p>
                <Badge variant="outline" className={`${result.constraintsPassed ? "text-emerald-400 border-emerald-500/20" : "text-red-400 border-red-500/20"} text-[9px]`}>
                  {result.constraintsPassed ? "ALL PASSED" : "VIOLATION"}
                </Badge>
              </div>
              <div>
                <p className="text-zinc-600 mb-1">Policy Evaluations</p>
                <div className="flex gap-1 flex-wrap">
                  {result.policyEvaluations.map((pe, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={`${pe.passed ? "text-emerald-400 border-emerald-500/20" : "text-red-400 border-red-500/20"} text-[9px]`}
                    >
                      {pe.constraintType}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
