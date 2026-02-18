/**
 * ATP In-Memory Store
 * Uses globalThis for state persistence across Next.js module reloads.
 * In production, this would be backed by a database with Merkle tree audit logs.
 */
import { v4 as uuid } from "uuid";
import {
  generateKeyPair,
  deriveDID,
  sign,
  hashData,
} from "./crypto";
import type {
  Organization,
  Principal,
  AgentCredential,
  AuditEntry,
  PolicyConstraint,
  AuthorityLink,
  Transaction,
  AnalyticsSummary,
} from "./types";

// --- In-memory state using globalThis for Next.js module persistence ---
interface ATPState {
  organizations: Organization[];
  principals: Principal[];
  credentials: AgentCredential[];
  auditLog: AuditEntry[];
  transactions: Transaction[];
  seeded: boolean;
}

const GLOBAL_KEY = Symbol.for("__atp_store__");

function getState(): ATPState {
  const g = globalThis as unknown as Record<symbol, ATPState>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      organizations: [],
      principals: [],
      credentials: [],
      auditLog: [],
      transactions: [],
      seeded: false,
    };
  }
  return g[GLOBAL_KEY];
}

export function ensureSeeded() {
  const state = getState();
  if (state.seeded) return;
  state.seeded = true;
  seedDemoData();
}

function seedDemoData() {
  const state = getState();

  // Create demo org
  const orgKp = generateKeyPair();
  const org: Organization = {
    id: uuid(),
    name: "Meridian Financial",
    did: deriveDID(orgKp.publicKey),
    publicKey: orgKp.publicKey,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  };
  state.organizations.push(org);

  // Create demo principals
  const adminKp = generateKeyPair();
  const admin: Principal = {
    id: uuid(),
    orgId: org.id,
    name: "Sarah Chen",
    email: "sarah@meridian.io",
    role: "admin",
    did: deriveDID(adminKp.publicKey),
    publicKey: adminKp.publicKey,
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
  };

  const devKp = generateKeyPair();
  const dev: Principal = {
    id: uuid(),
    orgId: org.id,
    name: "Alex Rivera",
    email: "alex@meridian.io",
    role: "developer",
    did: deriveDID(devKp.publicKey),
    publicKey: devKp.publicKey,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  };
  state.principals.push(admin, dev);

  // Create demo agent credentials
  const agents = [
    {
      name: "Payment Processor Agent",
      permissions: ["payments:read", "payments:write", "payments:authorize"],
      constraints: [
        { type: "spending_limit" as const, params: { maxPerTransaction: 10000, currency: "USD", dailyLimit: 50000 } },
        { type: "rate_limit" as const, params: { maxRequestsPerMinute: 100 } },
        { type: "time_bound" as const, params: { validHours: "06:00-22:00", timezone: "America/New_York" } },
      ],
      status: "active" as const,
      issuer: admin,
      issuerKp: adminKp,
    },
    {
      name: "Contract Negotiation Agent",
      permissions: ["contracts:read", "contracts:negotiate", "api:discover", "agents:discover", "agents:negotiate"],
      constraints: [
        { type: "spending_limit" as const, params: { maxContractValue: 100000, currency: "USD" } },
        { type: "api_scope" as const, params: { allowedDomains: ["*.meridian.io", "api.partner.com"] } },
      ],
      status: "active" as const,
      issuer: admin,
      issuerKp: adminKp,
    },
    {
      name: "Data Analytics Agent",
      permissions: ["data:read", "api:invoke", "identity:prove"],
      constraints: [
        { type: "api_scope" as const, params: { allowedEndpoints: ["/analytics/*", "/reports/*"] } },
        { type: "rate_limit" as const, params: { maxRequestsPerMinute: 50 } },
        { type: "geo_fence" as const, params: { allowedRegions: ["US", "EU"] } },
      ],
      status: "active" as const,
      issuer: dev,
      issuerKp: devKp,
    },
    {
      name: "Vendor Onboarding Agent",
      permissions: ["contracts:read", "contracts:negotiate", "data:read", "data:write"],
      constraints: [
        { type: "spending_limit" as const, params: { maxPerTransaction: 5000, currency: "USD" } },
        { type: "time_bound" as const, params: { expiresIn: "90d" } },
      ],
      status: "suspended" as const,
      issuer: admin,
      issuerKp: adminKp,
    },
  ];

  for (const agentDef of agents) {
    const agentKp = generateKeyPair();
    const agentDid = deriveDID(agentKp.publicKey);
    const credId = uuid();

    const authorityChain: AuthorityLink[] = [
      {
        fromDID: org.did,
        toDID: agentDef.issuer.did,
        delegatedPermissions: agentDef.permissions,
        signature: sign(
          JSON.stringify({ from: org.did, to: agentDef.issuer.did, perms: agentDef.permissions }),
          orgKp.privateKey
        ),
        timestamp: agentDef.issuer.createdAt,
      },
      {
        fromDID: agentDef.issuer.did,
        toDID: agentDid,
        delegatedPermissions: agentDef.permissions,
        signature: sign(
          JSON.stringify({ from: agentDef.issuer.did, to: agentDid, perms: agentDef.permissions }),
          agentDef.issuerKp.privateKey
        ),
        timestamp: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
    ];

    const credPayload = JSON.stringify({
      id: credId,
      agentDID: agentDid,
      permissions: agentDef.permissions,
      constraints: agentDef.constraints,
    });

    const cred: AgentCredential = {
      id: credId,
      orgId: org.id,
      issuerId: agentDef.issuer.id,
      agentName: agentDef.name,
      agentDID: agentDid,
      agentPublicKey: agentKp.publicKey,
      status: agentDef.status,
      permissions: agentDef.permissions,
      constraints: agentDef.constraints as PolicyConstraint[],
      issuedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      expiresAt: new Date(Date.now() + 345 * 86400000).toISOString(),
      issuerSignature: sign(credPayload, agentDef.issuerKp.privateKey),
      authorityChain,
    };
    state.credentials.push(cred);
  }

  // Generate audit log entries
  const actions = [
    { action: "payment.initiate", target: "invoice:INV-2024-0847", result: "success" as const },
    { action: "payment.authorize", target: "transfer:TXN-9f3a2b", result: "success" as const },
    { action: "contract.negotiate", target: "contract:CTR-2024-112", result: "success" as const },
    { action: "api.invoke", target: "endpoint:/analytics/revenue", result: "success" as const },
    { action: "payment.authorize", target: "transfer:TXN-c4e1d8", result: "denied" as const },
    { action: "data.read", target: "dataset:customer-segments", result: "success" as const },
    { action: "contract.negotiate", target: "contract:CTR-2024-118", result: "success" as const },
    { action: "payment.initiate", target: "invoice:INV-2024-0912", result: "success" as const },
    { action: "api.invoke", target: "endpoint:/reports/quarterly", result: "success" as const },
    { action: "data.write", target: "record:vendor-profile-update", result: "denied" as const },
    { action: "payment.authorize", target: "transfer:TXN-8a2f1c", result: "success" as const },
    { action: "identity.prove", target: "verifier:partner-api.com", result: "success" as const },
    { action: "agents.discover", target: "registry:service-catalog", result: "success" as const },
    { action: "contract.sign", target: "contract:CTR-2024-115", result: "denied" as const },
    { action: "payment.initiate", target: "invoice:INV-2024-0955", result: "error" as const },
  ];

  let prevHash = hashData("genesis");
  for (let i = 0; i < actions.length; i++) {
    const credIdx = i % state.credentials.length;
    const cred = state.credentials[credIdx];
    const entry: AuditEntry = {
      id: uuid(),
      credentialId: cred.id,
      agentDID: cred.agentDID,
      action: actions[i].action,
      target: actions[i].target,
      parameters: {},
      result: actions[i].result,
      policyEvaluations: cred.constraints.map((c) => ({
        constraintType: c.type,
        passed: actions[i].result !== "denied",
        reason: actions[i].result === "denied" ? "Policy constraint violated" : undefined,
      })),
      timestamp: new Date(Date.now() - (actions.length - i) * 3600000).toISOString(),
      previousHash: prevHash,
      entryHash: "",
    };
    entry.entryHash = hashData(JSON.stringify({ ...entry, entryHash: "" }));
    prevHash = entry.entryHash;
    state.auditLog.push(entry);
  }

  // Generate transactions
  const txnTypes: Array<"payment" | "api_call" | "contract" | "data_access"> = ["payment", "api_call", "contract", "data_access"];
  for (let i = 0; i < 25; i++) {
    const credIdx = i % state.credentials.length;
    const cred = state.credentials[credIdx];
    const txnType = txnTypes[i % txnTypes.length];
    state.transactions.push({
      id: uuid(),
      agentDID: cred.agentDID,
      credentialId: cred.id,
      type: txnType,
      amount: txnType === "payment" ? Math.floor(Math.random() * 8000) + 500 : undefined,
      currency: txnType === "payment" ? "USD" : undefined,
      status: i < 22 ? "completed" : i === 22 ? "pending" : i === 23 ? "failed" : "disputed",
      createdAt: new Date(Date.now() - (25 - i) * 7200000).toISOString(),
      completedAt: i < 22 ? new Date(Date.now() - (25 - i) * 7200000 + 30000).toISOString() : undefined,
    });
  }
}

// --- Accessor functions ---

export function getOrganizations(): Organization[] {
  ensureSeeded();
  return [...getState().organizations];
}

export function getOrganization(id: string): Organization | undefined {
  ensureSeeded();
  return getState().organizations.find((o) => o.id === id);
}

export function getPrincipals(orgId?: string): Principal[] {
  ensureSeeded();
  const { principals } = getState();
  if (orgId) return principals.filter((p) => p.orgId === orgId);
  return [...principals];
}

export function getCredentials(orgId?: string): AgentCredential[] {
  ensureSeeded();
  const { credentials } = getState();
  if (orgId) return credentials.filter((c) => c.orgId === orgId);
  return [...credentials];
}

export function getCredential(id: string): AgentCredential | undefined {
  ensureSeeded();
  return getState().credentials.find((c) => c.id === id);
}

export function getCredentialByDID(did: string): AgentCredential | undefined {
  ensureSeeded();
  return getState().credentials.find((c) => c.agentDID === did);
}

export function getAuditLog(credentialId?: string): AuditEntry[] {
  ensureSeeded();
  const { auditLog } = getState();
  if (credentialId) return auditLog.filter((e) => e.credentialId === credentialId);
  return [...auditLog];
}

export function getTransactions(agentDID?: string): Transaction[] {
  ensureSeeded();
  const { transactions } = getState();
  if (agentDID) return transactions.filter((t) => t.agentDID === agentDID);
  return [...transactions];
}

export function addCredential(cred: AgentCredential): void {
  ensureSeeded();
  getState().credentials.push(cred);
}

export function updateCredentialStatus(id: string, status: AgentCredential["status"]): boolean {
  ensureSeeded();
  const cred = getState().credentials.find((c) => c.id === id);
  if (!cred) return false;
  cred.status = status;
  return true;
}

export function addAuditEntry(entry: AuditEntry): void {
  ensureSeeded();
  getState().auditLog.push(entry);
}

export function addTransaction(txn: Transaction): void {
  ensureSeeded();
  getState().transactions.push(txn);
}

export function getAnalytics(): AnalyticsSummary {
  ensureSeeded();
  const { credentials, transactions, auditLog } = getState();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const todayEntries = auditLog.filter((e) => e.timestamp >= todayStart);
  const txnByType: Record<string, number> = {};
  for (const t of transactions) {
    txnByType[t.type] = (txnByType[t.type] || 0) + 1;
  }

  return {
    totalAgents: credentials.length,
    activeAgents: credentials.filter((c) => c.status === "active").length,
    totalTransactions: transactions.length,
    totalAuditEntries: auditLog.length,
    transactionsByType: txnByType,
    verificationsToday: todayEntries.length,
    deniedToday: todayEntries.filter((e) => e.result === "denied").length,
    policyViolationsToday: todayEntries.filter((e) => e.result === "denied" || e.result === "error").length,
  };
}
