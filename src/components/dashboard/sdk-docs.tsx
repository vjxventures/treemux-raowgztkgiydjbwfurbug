"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2, Terminal, Code2, Shield, Fingerprint, FileCheck } from "lucide-react";

const codeExamples = [
  {
    id: "install",
    title: "Installation",
    icon: Terminal,
    language: "bash",
    code: `npm install @atp/sdk
# or
bun add @atp/sdk`,
  },
  {
    id: "init",
    title: "Initialize Client",
    icon: Code2,
    language: "typescript",
    code: `import { ATPClient } from '@atp/sdk';

const atp = new ATPClient({
  orgId: 'org_meridian_financial',
  apiKey: process.env.ATP_API_KEY,
  endpoint: 'https://api.agenttrustprotocol.com',
});`,
  },
  {
    id: "issue",
    title: "Issue Agent Credential",
    icon: Fingerprint,
    language: "typescript",
    code: `// Issue a credential with scoped permissions
const { credential, agentKeys } = await atp.credentials.issue({
  agentName: 'Payment Processor Agent',
  permissions: [
    'payments:read',
    'payments:write',
    'payments:authorize',
  ],
  constraints: [
    {
      type: 'spending_limit',
      params: { maxPerTransaction: 10000, currency: 'USD' },
    },
    {
      type: 'rate_limit',
      params: { maxRequestsPerMinute: 100 },
    },
  ],
  expiresIn: '365d',
});

// Store agentKeys.privateKey securely
// The agent will use this to sign requests
console.log('Agent DID:', credential.agentDID);`,
  },
  {
    id: "verify",
    title: "Verify Agent Authorization",
    icon: Shield,
    language: "typescript",
    code: `// Verify an agent's authority before executing
const result = await atp.verify({
  agentDID: 'did:atp:a1b2c3d4e5f6...',
  action: 'payment.authorize',
  target: 'transfer:TXN-9f3a2b',
  parameters: { amount: 5000, currency: 'USD' },
  signature: agent.sign(requestPayload),
});

if (result.verified) {
  // Execute the payment
  console.log('Authority chain valid:', result.authorityChainValid);
  console.log('All constraints passed:', result.constraintsPassed);
} else {
  console.error('Denied:', result.reason);
  // result.policyEvaluations shows which constraints failed
}`,
  },
  {
    id: "audit",
    title: "Query Audit Log",
    icon: FileCheck,
    language: "typescript",
    code: `// Tamper-evident audit trail with Merkle chain
const log = await atp.audit.query({
  credentialId: credential.id,
  from: '2024-01-01',
  to: '2024-12-31',
});

for (const entry of log.entries) {
  console.log(entry.action, entry.result);
  console.log('Hash:', entry.entryHash);
  console.log('Previous:', entry.previousHash);
  // Verify chain integrity
  const valid = atp.audit.verifyChain(log.entries);
}`,
  },
];

export function SDKDocs() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="p-4 border-b border-border">
        <p className="data-label mb-1">SDK INTEGRATION</p>
        <p className="text-sm text-muted-foreground">
          TypeScript SDK for issuing credentials, verifying authority, and querying audit logs
        </p>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="font-mono text-[10px] text-cyan-400 border-cyan-500/20">
            TypeScript
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] text-violet-400 border-violet-500/20">
            Python (coming soon)
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] text-amber-400 border-amber-500/20">
            Go (coming soon)
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-border">
        {codeExamples.map((example, i) => {
          const Icon = example.icon;
          return (
            <div key={example.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="px-4 py-3 flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-xs text-foreground tracking-wider">{example.title}</span>
                <Badge variant="secondary" className="font-mono text-[9px] ml-auto">
                  {example.language}
                </Badge>
              </div>
              <div className="relative bg-atp-zinc-950 mx-3 mb-3 rounded border border-border overflow-hidden">
                <pre className="p-3 overflow-x-auto">
                  <code className="font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre">
                    {example.code}
                  </code>
                </pre>
                <button
                  className="absolute top-2 right-2 text-zinc-600 hover:text-zinc-400 transition-colors"
                  onClick={() => handleCopy(example.id, example.code)}
                >
                  {copiedId === example.id ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
