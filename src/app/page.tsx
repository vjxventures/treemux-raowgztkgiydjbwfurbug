"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CredentialsTable } from "@/components/dashboard/credentials-table";
import { AuditLog } from "@/components/dashboard/audit-log";
import { VerifyPlayground } from "@/components/dashboard/verify-playground";
import { IssueCredential } from "@/components/dashboard/issue-credential";
import { TransactionsView } from "@/components/dashboard/transactions-view";
import { SDKDocs } from "@/components/dashboard/sdk-docs";
import {
  Shield,
  Bot,
  FileText,
  Activity,
  Zap,
  Code2,
  Hexagon,
} from "lucide-react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-border bg-atp-zinc-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Hexagon className="w-7 h-7 text-emerald-400" strokeWidth={1.5} />
              <Shield className="w-3.5 h-3.5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-mono text-sm font-semibold tracking-wider text-foreground">
                ATP
              </h1>
              <p className="font-mono text-[9px] text-muted-foreground tracking-[0.2em] uppercase -mt-0.5">
                Agent Trust Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-active" />
              <span className="font-mono text-[10px] text-emerald-400 tracking-wider">PROTOCOL ACTIVE</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-[10px] text-muted-foreground hidden md:block">
              Meridian Financial
            </span>
            <IssueCredential onIssued={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <StatsCards key={`stats-${refreshKey}`} />

        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList className="bg-card border border-border h-9 p-0.5 gap-0.5">
            <TabsTrigger
              value="agents"
              className="font-mono text-[11px] tracking-wider data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 gap-1.5 px-3"
            >
              <Bot className="w-3.5 h-3.5" />
              AGENTS
            </TabsTrigger>
            <TabsTrigger
              value="verify"
              className="font-mono text-[11px] tracking-wider data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 gap-1.5 px-3"
            >
              <Zap className="w-3.5 h-3.5" />
              VERIFY
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="font-mono text-[11px] tracking-wider data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-400 gap-1.5 px-3"
            >
              <FileText className="w-3.5 h-3.5" />
              AUDIT LOG
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="font-mono text-[11px] tracking-wider data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 gap-1.5 px-3"
            >
              <Activity className="w-3.5 h-3.5" />
              TRANSACTIONS
            </TabsTrigger>
            <TabsTrigger
              value="sdk"
              className="font-mono text-[11px] tracking-wider data-[state=active]:bg-zinc-500/10 data-[state=active]:text-zinc-300 gap-1.5 px-3"
            >
              <Code2 className="w-3.5 h-3.5" />
              SDK
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4">
            <CredentialsTable key={`creds-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="verify">
            <VerifyPlayground />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLog />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsView />
          </TabsContent>

          <TabsContent value="sdk">
            <SDKDocs />
          </TabsContent>
        </Tabs>

        {/* Protocol specification footer */}
        <footer className="border-t border-border pt-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="data-label mb-2">PROTOCOL PRIMITIVES</p>
              <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Ed25519 Agent Identity Keys
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  W3C DID-Compatible Identifiers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-violet-400" />
                  Cryptographic Authority Chains
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  Merkle Tree Audit Logs
                </li>
              </ul>
            </div>
            <div>
              <p className="data-label mb-2">TRUST MODEL</p>
              <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Organization → Principal → Agent Delegation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  Scoped Permission Model (14 scopes)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-violet-400" />
                  Policy Constraints (5 types)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  Stateless Verification API
                </li>
              </ul>
            </div>
            <div>
              <p className="data-label mb-2">COMPLIANCE</p>
              <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Full Action Audit Trail
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  Tamper-Evident Hash Chains
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-violet-400" />
                  Credential Lifecycle Management
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  Real-time Policy Enforcement
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <p className="font-mono text-[10px] text-zinc-600">
              ATP v0.1.0 — Agent Trust Protocol Specification Draft
            </p>
            <p className="font-mono text-[10px] text-zinc-600">
              Cryptographic primitives: Ed25519 + SHA-256
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
