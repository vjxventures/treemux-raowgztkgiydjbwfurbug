import { v4 as uuid } from "uuid";
import type {
  Agent,
  ServiceListing,
  Negotiation,
  Transaction,
  Dispute,
  EscrowAccount,
  MarketplaceStats,
  NegotiationTerms,
} from "./types";

// In-memory store (simulates database)
const agents: Map<string, Agent> = new Map();
const services: Map<string, ServiceListing> = new Map();
const negotiations: Map<string, Negotiation> = new Map();
const transactions: Map<string, Transaction> = new Map();
const disputes: Map<string, Dispute> = new Map();
const escrows: Map<string, EscrowAccount> = new Map();

function seedData() {
  if (agents.size > 0) return;

  const orgs = [
    "Meridian Capital", "Nexus Logistics", "Vertex AI Labs",
    "Stratos Financial", "Quantum DevOps", "Prism Analytics",
    "Atlas Procurement", "Forge Payments", "Helix Data",
    "Cipher Security"
  ];

  const categories = [
    "Data Enrichment", "Document Processing", "Risk Assessment",
    "Payment Processing", "Code Review", "Translation",
    "Compliance Check", "Fraud Detection", "Market Analysis",
    "Customer Support"
  ];

  const capabilities = [
    "natural-language-processing", "document-ocr", "financial-analysis",
    "code-generation", "data-transformation", "sentiment-analysis",
    "risk-scoring", "payment-routing", "translation-multilingual",
    "anomaly-detection", "report-generation", "api-orchestration",
    "contract-analysis", "supply-chain-optimization", "kyc-verification"
  ];

  // Create agents
  const agentIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const id = uuid();
    agentIds.push(id);
    const successRate = 85 + Math.random() * 14;
    const totalTx = Math.floor(50 + Math.random() * 500);
    agents.set(id, {
      id,
      name: `${orgs[i]} Agent ${String.fromCharCode(65 + i)}`,
      organization: orgs[i],
      description: `Specialized autonomous agent for ${categories[i % categories.length].toLowerCase()} operations. Certified for enterprise-grade workflows.`,
      capabilities: [
        capabilities[i % capabilities.length],
        capabilities[(i + 3) % capabilities.length],
        capabilities[(i + 7) % capabilities.length],
      ],
      apiEndpoint: `https://api.${orgs[i].toLowerCase().replace(/\s/g, "")}.io/v1/agent`,
      publicKey: `pk_${uuid().replace(/-/g, "").slice(0, 32)}`,
      trustScore: Number((70 + Math.random() * 29).toFixed(1)),
      totalTransactions: totalTx,
      successRate: Number(successRate.toFixed(1)),
      status: i < 8 ? "active" : "pending",
      createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Create services
  const serviceNames = [
    "Invoice Data Extraction", "Credit Risk Scoring", "Multi-Language Translation",
    "Smart Contract Audit", "Freight Rate Optimization", "KYC Document Verification",
    "Anomaly Detection Pipeline", "Payment Reconciliation", "Market Sentiment Analysis",
    "API Integration Testing", "Procurement Bid Analysis", "Compliance Report Generator",
    "Customer Churn Prediction", "Supply Chain Risk Monitor", "Code Vulnerability Scanner"
  ];

  for (let i = 0; i < 15; i++) {
    const id = uuid();
    const providerId = agentIds[i % agentIds.length];
    services.set(id, {
      id,
      providerId,
      name: serviceNames[i],
      description: `Enterprise-grade ${serviceNames[i].toLowerCase()} service with guaranteed SLAs and audit trails. Designed for high-throughput autonomous agent consumption.`,
      category: categories[i % categories.length],
      capabilities: [
        capabilities[i % capabilities.length],
        capabilities[(i + 5) % capabilities.length],
      ],
      inputSchema: { type: "object", properties: { data: { type: "string" } } },
      outputSchema: { type: "object", properties: { result: { type: "string" } } },
      pricing: {
        type: ["per_call", "per_token", "flat_rate", "negotiable"][i % 4] as "per_call" | "per_token" | "flat_rate" | "negotiable",
        basePrice: Number((0.01 + Math.random() * 2).toFixed(2)),
        currency: "USD",
        volumeDiscounts: [
          { threshold: 1000, discount: 0.1 },
          { threshold: 10000, discount: 0.2 },
        ],
      },
      sla: {
        maxLatencyMs: [200, 500, 1000, 2000][i % 4],
        uptimeGuarantee: [99.9, 99.95, 99.99][i % 3],
        maxRetries: 3,
        timeoutMs: [5000, 10000, 30000][i % 3],
      },
      status: i < 13 ? "listed" : "unlisted",
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      totalUsage: Math.floor(100 + Math.random() * 5000),
      createdAt: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Create negotiations
  const serviceIds = Array.from(services.keys());
  const negotiationStatuses: Array<"proposed" | "counter" | "accepted" | "rejected"> = ["proposed", "counter", "accepted", "rejected"];
  for (let i = 0; i < 8; i++) {
    const id = uuid();
    const serviceId = serviceIds[i % serviceIds.length];
    const service = services.get(serviceId)!;
    const consumerId = agentIds[(i + 3) % agentIds.length];
    const providerId = service.providerId;
    const status = negotiationStatuses[i % 4];
    const terms: NegotiationTerms = {
      price: Number((service.pricing.basePrice * (0.8 + Math.random() * 0.4)).toFixed(2)),
      currency: "USD",
      volume: Math.floor(100 + Math.random() * 1000),
      duration: ["30d", "60d", "90d"][i % 3],
      sla: service.sla,
    };

    negotiations.set(id, {
      id,
      serviceId,
      consumerId,
      providerId,
      status,
      proposedTerms: terms,
      counterTerms: status === "counter" ? { ...terms, price: Number((terms.price * 1.15).toFixed(2)) } : undefined,
      finalTerms: status === "accepted" ? terms : undefined,
      messages: [
        {
          id: uuid(),
          senderId: consumerId,
          content: `Requesting ${service.name} at volume of ${terms.volume} calls over ${terms.duration}.`,
          terms,
          timestamp: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
  }

  // Create transactions
  const txStatuses: Array<"completed" | "in_escrow" | "executing" | "disputed"> = ["completed", "in_escrow", "executing", "disputed"];
  const negotiationIds = Array.from(negotiations.keys());
  for (let i = 0; i < 12; i++) {
    const id = uuid();
    const negId = negotiationIds[i % negotiationIds.length];
    const neg = negotiations.get(negId)!;
    const status = txStatuses[i % 4];
    const amount = Number((10 + Math.random() * 500).toFixed(2));
    const startedAt = new Date(Date.now() - Math.random() * 30 * 86400000);

    const tx: Transaction = {
      id,
      negotiationId: negId,
      serviceId: neg.serviceId,
      consumerId: neg.consumerId,
      providerId: neg.providerId,
      status,
      amount,
      currency: "USD",
      executionLog: [
        {
          timestamp: startedAt.toISOString(),
          event: "Transaction initiated",
          details: `Escrow funded with $${amount}`,
          status: "info",
        },
        {
          timestamp: new Date(startedAt.getTime() + 1000).toISOString(),
          event: "Service execution started",
          details: "Provider agent acknowledged and began processing",
          status: "info",
        },
      ],
      startedAt: startedAt.toISOString(),
      completedAt: status === "completed" ? new Date(startedAt.getTime() + 60000 + Math.random() * 300000).toISOString() : undefined,
    };

    // Create escrow for in_escrow and executing
    if (status === "in_escrow" || status === "executing") {
      const escrowId = uuid();
      escrows.set(escrowId, {
        id: escrowId,
        transactionId: id,
        amount,
        currency: "USD",
        fundedBy: neg.consumerId,
        releaseTo: neg.providerId,
        status: status === "in_escrow" ? "funded" : "funded",
        createdAt: startedAt.toISOString(),
      });
      tx.escrowId = escrowId;
    }

    // Create dispute for disputed
    if (status === "disputed") {
      const disputeId = uuid();
      disputes.set(disputeId, {
        id: disputeId,
        transactionId: id,
        filedBy: neg.consumerId,
        against: neg.providerId,
        reason: ["SLA violation - latency exceeded", "Incorrect output format", "Partial results returned"][i % 3],
        evidence: ["execution_log", "response_payload"],
        status: "open",
        createdAt: new Date().toISOString(),
      });
      tx.disputeId = disputeId;
    }

    if (status === "completed") {
      tx.executionLog.push({
        timestamp: tx.completedAt!,
        event: "Transaction completed",
        details: "All deliverables verified. Escrow released to provider.",
        status: "success",
      });
    }

    transactions.set(id, tx);
  }
}

// Initialize
seedData();

// --- CRUD Operations ---

export const agentStore = {
  getAll: () => Array.from(agents.values()),
  getById: (id: string) => agents.get(id),
  create: (data: Omit<Agent, "id" | "createdAt" | "updatedAt" | "trustScore" | "totalTransactions" | "successRate">) => {
    const agent: Agent = {
      ...data,
      id: uuid(),
      trustScore: 50,
      totalTransactions: 0,
      successRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    agents.set(agent.id, agent);
    return agent;
  },
  update: (id: string, data: Partial<Agent>) => {
    const existing = agents.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    agents.set(id, updated);
    return updated;
  },
};

export const serviceStore = {
  getAll: () => Array.from(services.values()),
  getById: (id: string) => services.get(id),
  getByProvider: (providerId: string) => Array.from(services.values()).filter(s => s.providerId === providerId),
  getByCategory: (category: string) => Array.from(services.values()).filter(s => s.category === category),
  search: (query: string) => {
    const q = query.toLowerCase();
    return Array.from(services.values()).filter(
      s => s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.capabilities.some(c => c.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q)
    );
  },
  create: (data: Omit<ServiceListing, "id" | "createdAt" | "updatedAt" | "rating" | "totalUsage">) => {
    const service: ServiceListing = {
      ...data,
      id: uuid(),
      rating: 0,
      totalUsage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    services.set(service.id, service);
    return service;
  },
};

export const negotiationStore = {
  getAll: () => Array.from(negotiations.values()),
  getById: (id: string) => negotiations.get(id),
  getByAgent: (agentId: string) =>
    Array.from(negotiations.values()).filter(n => n.consumerId === agentId || n.providerId === agentId),
  create: (data: Omit<Negotiation, "id" | "createdAt" | "updatedAt" | "messages">) => {
    const neg: Negotiation = {
      ...data,
      id: uuid(),
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    negotiations.set(neg.id, neg);
    return neg;
  },
  addMessage: (id: string, msg: Omit<import("./types").NegotiationMessage, "id" | "timestamp">) => {
    const neg = negotiations.get(id);
    if (!neg) return null;
    neg.messages.push({ ...msg, id: uuid(), timestamp: new Date().toISOString() });
    neg.updatedAt = new Date().toISOString();
    return neg;
  },
  updateStatus: (id: string, status: import("./types").NegotiationStatus, terms?: NegotiationTerms) => {
    const neg = negotiations.get(id);
    if (!neg) return null;
    neg.status = status;
    if (status === "counter" && terms) neg.counterTerms = terms;
    if (status === "accepted") neg.finalTerms = terms || neg.proposedTerms;
    neg.updatedAt = new Date().toISOString();
    return neg;
  },
};

export const transactionStore = {
  getAll: () => Array.from(transactions.values()),
  getById: (id: string) => transactions.get(id),
  getByAgent: (agentId: string) =>
    Array.from(transactions.values()).filter(t => t.consumerId === agentId || t.providerId === agentId),
  create: (data: Omit<Transaction, "id" | "startedAt" | "executionLog">) => {
    const tx: Transaction = {
      ...data,
      id: uuid(),
      executionLog: [
        { timestamp: new Date().toISOString(), event: "Transaction created", details: `Amount: $${data.amount}`, status: "info" },
      ],
      startedAt: new Date().toISOString(),
    };
    transactions.set(tx.id, tx);
    return tx;
  },
  updateStatus: (id: string, status: import("./types").TransactionStatus) => {
    const tx = transactions.get(id);
    if (!tx) return null;
    tx.status = status;
    tx.executionLog.push({
      timestamp: new Date().toISOString(),
      event: `Status changed to ${status}`,
      details: `Transaction ${id} updated`,
      status: status === "completed" ? "success" : status === "disputed" ? "error" : "info",
    });
    if (status === "completed") tx.completedAt = new Date().toISOString();
    return tx;
  },
};

export const disputeStore = {
  getAll: () => Array.from(disputes.values()),
  getById: (id: string) => disputes.get(id),
  create: (data: Omit<Dispute, "id" | "createdAt" | "status">) => {
    const dispute: Dispute = {
      ...data,
      id: uuid(),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    disputes.set(dispute.id, dispute);
    return dispute;
  },
};

export const escrowStore = {
  getAll: () => Array.from(escrows.values()),
  getById: (id: string) => escrows.get(id),
  getByTransaction: (txId: string) => Array.from(escrows.values()).find(e => e.transactionId === txId),
};

export function getMarketplaceStats(): MarketplaceStats {
  const allTx = Array.from(transactions.values());
  const totalVolume = allTx.reduce((sum, t) => sum + t.amount, 0);

  // Group transactions by day
  const byDay = new Map<string, { count: number; volume: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    byDay.set(key, { count: 0, volume: 0 });
  }
  for (const tx of allTx) {
    const day = tx.startedAt.split("T")[0];
    const existing = byDay.get(day);
    if (existing) {
      existing.count++;
      existing.volume += tx.amount;
    }
  }

  // Top categories
  const catCount = new Map<string, number>();
  for (const s of services.values()) {
    catCount.set(s.category, (catCount.get(s.category) || 0) + 1);
  }

  return {
    totalAgents: agents.size,
    totalServices: services.size,
    totalTransactions: transactions.size,
    totalVolume: Number(totalVolume.toFixed(2)),
    activeNegotiations: Array.from(negotiations.values()).filter(n => n.status === "proposed" || n.status === "counter").length,
    avgTrustScore: Number(
      (Array.from(agents.values()).reduce((s, a) => s + a.trustScore, 0) / agents.size).toFixed(1)
    ),
    transactionsByDay: Array.from(byDay.entries()).map(([date, data]) => ({ date, ...data })),
    topCategories: Array.from(catCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
}
