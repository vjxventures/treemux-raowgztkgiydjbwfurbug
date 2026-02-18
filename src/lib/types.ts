/**
 * ATP Core Type Definitions
 * Agent Trust Protocol data structures
 */

/** Organization that issues agent credentials */
export interface Organization {
  id: string;
  name: string;
  did: string;
  publicKey: string;
  createdAt: string;
}

/** A human or system principal within an organization */
export interface Principal {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: "admin" | "developer" | "operator";
  did: string;
  publicKey: string;
  createdAt: string;
}

/** Policy constraint on agent authority */
export interface PolicyConstraint {
  type: "spending_limit" | "api_scope" | "time_bound" | "rate_limit" | "geo_fence";
  params: Record<string, unknown>;
}

/** An issued agent credential with delegated authority */
export interface AgentCredential {
  id: string;
  orgId: string;
  issuerId: string; // Principal who issued
  agentName: string;
  agentDID: string;
  agentPublicKey: string;
  status: "active" | "suspended" | "revoked";
  permissions: string[];
  constraints: PolicyConstraint[];
  issuedAt: string;
  expiresAt: string;
  /** Signature of the credential by the issuer */
  issuerSignature: string;
  /** Authority chain: org → principal → agent */
  authorityChain: AuthorityLink[];
}

/** A link in the delegation chain */
export interface AuthorityLink {
  fromDID: string;
  toDID: string;
  delegatedPermissions: string[];
  signature: string;
  timestamp: string;
}

/** A recorded agent action in the audit log */
export interface AuditEntry {
  id: string;
  credentialId: string;
  agentDID: string;
  action: string;
  target: string;
  parameters: Record<string, unknown>;
  result: "success" | "denied" | "error";
  policyEvaluations: PolicyEvaluation[];
  timestamp: string;
  /** Hash of previous entry for tamper evidence */
  previousHash: string;
  /** Hash of this entry */
  entryHash: string;
}

/** Result of evaluating a policy constraint */
export interface PolicyEvaluation {
  constraintType: string;
  passed: boolean;
  reason?: string;
}

/** Verification request payload */
export interface VerificationRequest {
  agentDID: string;
  action: string;
  target: string;
  parameters: Record<string, unknown>;
  signature: string; // Agent's signature over the request
  timestamp: string;
}

/** Verification response */
export interface VerificationResult {
  verified: boolean;
  agentDID: string;
  credentialId?: string;
  permissions: string[];
  constraintsPassed: boolean;
  policyEvaluations: PolicyEvaluation[];
  authorityChainValid: boolean;
  reason?: string;
}

/** Transaction record for economic trust */
export interface Transaction {
  id: string;
  agentDID: string;
  credentialId: string;
  type: "payment" | "api_call" | "contract" | "data_access";
  amount?: number;
  currency?: string;
  counterpartyDID?: string;
  status: "pending" | "completed" | "failed" | "disputed";
  createdAt: string;
  completedAt?: string;
}

/** Dashboard analytics */
export interface AnalyticsSummary {
  totalAgents: number;
  activeAgents: number;
  totalTransactions: number;
  totalAuditEntries: number;
  transactionsByType: Record<string, number>;
  verificationsToday: number;
  deniedToday: number;
  policyViolationsToday: number;
}

/** Available permission scopes */
export const PERMISSION_SCOPES = [
  "payments:read",
  "payments:write",
  "payments:authorize",
  "contracts:read",
  "contracts:negotiate",
  "contracts:sign",
  "api:discover",
  "api:invoke",
  "data:read",
  "data:write",
  "data:delete",
  "agents:discover",
  "agents:negotiate",
  "identity:prove",
] as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];
