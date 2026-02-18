export type AgentStatus = "active" | "suspended" | "pending";
export type ServiceStatus = "listed" | "unlisted" | "deprecated";
export type NegotiationStatus = "proposed" | "counter" | "accepted" | "rejected" | "expired";
export type TransactionStatus = "pending" | "in_escrow" | "executing" | "completed" | "disputed" | "refunded";
export type DisputeStatus = "open" | "under_review" | "resolved";

export interface Agent {
  id: string;
  name: string;
  organization: string;
  description: string;
  capabilities: string[];
  apiEndpoint: string;
  publicKey: string;
  trustScore: number;
  totalTransactions: number;
  successRate: number;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  pricing: PricingModel;
  sla: SLATerms;
  status: ServiceStatus;
  rating: number;
  totalUsage: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingModel {
  type: "per_call" | "per_token" | "per_minute" | "flat_rate" | "negotiable";
  basePrice: number;
  currency: string;
  volumeDiscounts?: { threshold: number; discount: number }[];
}

export interface SLATerms {
  maxLatencyMs: number;
  uptimeGuarantee: number;
  maxRetries: number;
  timeoutMs: number;
}

export interface Negotiation {
  id: string;
  serviceId: string;
  consumerId: string;
  providerId: string;
  status: NegotiationStatus;
  proposedTerms: NegotiationTerms;
  counterTerms?: NegotiationTerms;
  finalTerms?: NegotiationTerms;
  messages: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface NegotiationTerms {
  price: number;
  currency: string;
  volume: number;
  duration: string;
  sla: SLATerms;
  customClauses?: string[];
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  content: string;
  terms?: NegotiationTerms;
  timestamp: string;
}

export interface Transaction {
  id: string;
  negotiationId: string;
  serviceId: string;
  consumerId: string;
  providerId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  escrowId?: string;
  executionLog: ExecutionEntry[];
  startedAt: string;
  completedAt?: string;
  disputeId?: string;
}

export interface ExecutionEntry {
  timestamp: string;
  event: string;
  details: string;
  status: "info" | "success" | "warning" | "error";
}

export interface Dispute {
  id: string;
  transactionId: string;
  filedBy: string;
  against: string;
  reason: string;
  evidence: string[];
  status: DisputeStatus;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface EscrowAccount {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  fundedBy: string;
  releaseTo: string;
  status: "funded" | "released" | "refunded" | "frozen";
  createdAt: string;
}

export interface MarketplaceStats {
  totalAgents: number;
  totalServices: number;
  totalTransactions: number;
  totalVolume: number;
  activeNegotiations: number;
  avgTrustScore: number;
  transactionsByDay: { date: string; count: number; volume: number }[];
  topCategories: { name: string; count: number }[];
}
