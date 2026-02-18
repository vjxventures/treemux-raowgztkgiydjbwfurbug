import { v4 as uuid } from "uuid";
import type {
  AgentVersion,
  Trace,
  TraceStep,
  EvalRun,
  EvalCaseResult,
  EvalDataset,
  DashboardMetrics,
  Alert,
  StepType,
  TraceStatus,
  EvalResult,
} from "./types";

// --- Helpers ---
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isoAgo(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3600000).toISOString();
}

// --- Agents ---
const agentNames = [
  "Customer Support Bot",
  "Code Review Agent",
  "Data Pipeline Orchestrator",
  "Invoice Processor",
  "Research Assistant",
  "Sales Qualification Agent",
  "Compliance Checker",
  "Document Summarizer",
];

const agentDescriptions: Record<string, string> = {
  "Customer Support Bot": "Handles tier-1 customer inquiries with tool access to knowledge base, ticketing, and CRM",
  "Code Review Agent": "Reviews pull requests for security vulnerabilities, style violations, and logical errors",
  "Data Pipeline Orchestrator": "Manages ETL workflows, data validation, and pipeline scheduling across cloud services",
  "Invoice Processor": "Extracts, validates, and reconciles invoice data against purchase orders and contracts",
  "Research Assistant": "Conducts multi-source research with citation tracking and fact verification",
  "Sales Qualification Agent": "Qualifies inbound leads using BANT framework with CRM and enrichment tool access",
  "Compliance Checker": "Audits documents and transactions against regulatory frameworks (SOX, GDPR, HIPAA)",
  "Document Summarizer": "Generates structured summaries from long-form documents with key entity extraction",
};

export function generateAgents(): AgentVersion[] {
  return agentNames.map((name, i) => ({
    id: uuid(),
    agentId: `agent-${i + 1}`,
    agentName: name,
    version: `${randomBetween(1, 3)}.${randomBetween(0, 9)}.${randomBetween(0, 20)}`,
    status: i < 6 ? "active" as const : randomItem(["active", "paused", "deprecated"] as const),
    description: agentDescriptions[name] || "",
    createdAt: isoAgo(randomBetween(24, 720)),
    config: { model: randomItem(["gpt-4o", "claude-3.5-sonnet", "claude-opus-4", "gemini-2.0"]), temperature: randomFloat(0, 1) },
    traceCount: randomBetween(100, 50000),
    passRate: randomFloat(85, 99.5),
    avgLatency: randomBetween(200, 5000),
    p99Latency: randomBetween(5000, 30000),
    errorRate: randomFloat(0.1, 5),
  }));
}

// --- Traces ---
const stepTypes: StepType[] = ["llm_call", "tool_call", "api_call", "decision", "human_review"];
const stepNames: Record<StepType, string[]> = {
  llm_call: ["Generate Response", "Classify Intent", "Extract Entities", "Summarize Context", "Plan Next Step"],
  tool_call: ["Search Knowledge Base", "Query Database", "Send Email", "Create Ticket", "Update CRM"],
  api_call: ["Fetch User Profile", "POST /api/webhook", "GET /api/orders", "Stripe Charge", "Slack Notify"],
  decision: ["Route to Agent", "Approve/Reject", "Escalate to Human", "Select Tool", "Determine Priority"],
  human_review: ["Manager Approval", "Compliance Review", "Quality Check"],
  error: ["Timeout Error", "API Error", "Validation Error"],
};

function generateSteps(traceId: string, count: number): TraceStep[] {
  let currentTime = Date.now() - randomBetween(1, 48) * 3600000;
  return Array.from({ length: count }, (_, i) => {
    const type = randomItem(stepTypes);
    const duration = randomBetween(50, 3000);
    const step: TraceStep = {
      id: uuid(),
      traceId,
      index: i,
      type,
      name: randomItem(stepNames[type]),
      input: type === "llm_call"
        ? `{"messages": [{"role": "user", "content": "Sample input for step ${i}"}], "model": "gpt-4o"}`
        : `{"query": "sample_param_${i}", "limit": 10}`,
      output: type === "llm_call"
        ? `{"content": "Generated response for step ${i} with relevant information...", "tokens": ${randomBetween(100, 2000)}}`
        : `{"results": [{"id": "${uuid()}", "score": ${randomFloat(0.7, 1)}}], "count": ${randomBetween(1, 50)}}`,
      startedAt: new Date(currentTime).toISOString(),
      endedAt: new Date(currentTime + duration).toISOString(),
      durationMs: duration,
      tokenCount: type === "llm_call" ? randomBetween(100, 4000) : undefined,
      cost: type === "llm_call" ? randomFloat(0.001, 0.15) : undefined,
    };
    currentTime += duration + randomBetween(10, 200);
    return step;
  });
}

export function generateTraces(agents: AgentVersion[], count: number = 50): Trace[] {
  const statuses: TraceStatus[] = ["completed", "completed", "completed", "completed", "failed", "running", "timeout"];
  const tags = ["production", "staging", "canary", "regression-test", "ci-cd", "manual"];

  return Array.from({ length: count }, () => {
    const agent = randomItem(agents);
    const stepCount = randomBetween(3, 12);
    const traceId = uuid();
    const steps = generateSteps(traceId, stepCount);
    const status = randomItem(statuses);
    const totalDuration = steps.reduce((sum, s) => sum + s.durationMs, 0);
    const totalTokens = steps.reduce((sum, s) => sum + (s.tokenCount || 0), 0);
    const totalCost = steps.reduce((sum, s) => sum + (s.cost || 0), 0);

    return {
      id: traceId,
      agentId: agent.agentId,
      agentVersion: agent.version,
      agentName: agent.agentName,
      sessionId: uuid(),
      status,
      startedAt: steps[0].startedAt,
      endedAt: status !== "running" ? steps[steps.length - 1].endedAt : undefined,
      totalDurationMs: totalDuration,
      totalTokens,
      totalCost: parseFloat(totalCost.toFixed(4)),
      stepCount,
      steps,
      input: "Process incoming customer request regarding account billing inquiry",
      output: status === "completed" ? "Successfully processed request and sent response to customer" : undefined,
      error: status === "failed" ? "Tool call failed: API timeout after 30000ms" : status === "timeout" ? "Agent execution exceeded maximum duration of 120s" : undefined,
      tags: [randomItem(tags), ...(Math.random() > 0.5 ? [randomItem(tags)] : [])],
      metadata: { environment: randomItem(["prod", "staging"]), region: randomItem(["us-east-1", "eu-west-1"]) },
    };
  });
}

// --- Eval Datasets & Runs ---
export function generateDatasets(): EvalDataset[] {
  return [
    { id: uuid(), name: "Customer Support Golden Set", description: "200 curated customer inquiries with expected responses", caseCount: 200, createdAt: isoAgo(720), updatedAt: isoAgo(48), tags: ["support", "production"] },
    { id: uuid(), name: "Code Review Security Cases", description: "150 code snippets with known security vulnerabilities", caseCount: 150, createdAt: isoAgo(480), updatedAt: isoAgo(24), tags: ["security", "code-review"] },
    { id: uuid(), name: "Invoice Extraction Benchmark", description: "500 invoices across 20 formats with ground truth extractions", caseCount: 500, createdAt: isoAgo(360), updatedAt: isoAgo(72), tags: ["extraction", "finance"] },
    { id: uuid(), name: "Adversarial Prompt Injection", description: "100 prompt injection attempts that agents should refuse", caseCount: 100, createdAt: isoAgo(240), updatedAt: isoAgo(12), tags: ["security", "adversarial"] },
    { id: uuid(), name: "Multi-turn Conversation Flows", description: "75 multi-turn dialogues testing context retention", caseCount: 75, createdAt: isoAgo(168), updatedAt: isoAgo(6), tags: ["conversation", "context"] },
  ];
}

export function generateEvalRuns(agents: AgentVersion[], datasets: EvalDataset[]): EvalRun[] {
  return Array.from({ length: 12 }, (_, i) => {
    const agent = randomItem(agents);
    const dataset = randomItem(datasets);
    const totalCases = dataset.caseCount;
    const passed = randomBetween(Math.floor(totalCases * 0.7), totalCases);
    const failed = randomBetween(0, totalCases - passed);
    const warned = randomBetween(0, Math.min(5, totalCases - passed - failed));
    const skipped = totalCases - passed - failed - warned;

    const results: EvalCaseResult[] = Array.from({ length: Math.min(totalCases, 20) }, (_, j) => {
      const result: EvalResult = j < Math.floor(20 * (passed / totalCases)) ? "pass" : j < Math.floor(20 * ((passed + failed) / totalCases)) ? "fail" : "warn";
      return {
        id: uuid(),
        caseId: uuid(),
        caseName: `Case ${j + 1}: ${randomItem(["Basic query", "Edge case", "Complex scenario", "Adversarial input", "Multi-step"])}`,
        result,
        actualOutput: result === "pass" ? "Expected output matched" : "Output diverged from expected",
        score: result === "pass" ? randomFloat(0.85, 1) : result === "warn" ? randomFloat(0.5, 0.85) : randomFloat(0, 0.5),
        durationMs: randomBetween(500, 15000),
        assertions: [
          { type: "contains", passed: result === "pass", expected: "expected_keyword", actual: result === "pass" ? "expected_keyword found" : "keyword missing" },
          { type: "semantic_similarity", passed: result !== "fail", expected: "threshold: 0.8", actual: `similarity: ${randomFloat(0.3, 1)}` },
        ],
        traceId: uuid(),
      };
    });

    return {
      id: uuid(),
      agentId: agent.agentId,
      agentVersion: agent.version,
      datasetId: dataset.id,
      datasetName: dataset.name,
      status: i === 0 ? "running" : "completed",
      startedAt: isoAgo(i * 12 + randomBetween(0, 6)),
      endedAt: i === 0 ? undefined : isoAgo(i * 12 + randomBetween(0, 3)),
      totalCases,
      passedCases: passed,
      failedCases: failed,
      warnCases: warned,
      skippedCases: skipped,
      results,
      triggeredBy: randomItem(["manual", "ci_cd", "schedule", "regression"]),
    };
  });
}

// --- Dashboard Metrics ---
export function generateDashboardMetrics(agents: AgentVersion[], alerts: Alert[]): DashboardMetrics {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(Date.now() - (23 - i) * 3600000);
    return `${d.getHours().toString().padStart(2, "0")}:00`;
  });

  return {
    totalTraces: randomBetween(100000, 500000),
    tracesLast24h: randomBetween(5000, 20000),
    tracesTrend: randomFloat(-10, 25),
    avgLatency: randomBetween(800, 3000),
    latencyTrend: randomFloat(-15, 10),
    errorRate: randomFloat(0.5, 4),
    errorRateTrend: randomFloat(-20, 5),
    totalCost: randomFloat(100, 5000),
    costTrend: randomFloat(-5, 30),
    activeAgents: agents.filter((a) => a.status === "active").length,
    evalPassRate: randomFloat(88, 98),
    evalPassRateTrend: randomFloat(-3, 5),
    latencyTimeSeries: hours.map((time) => ({
      time,
      p50: randomBetween(300, 1200),
      p95: randomBetween(1500, 5000),
      p99: randomBetween(5000, 15000),
    })),
    errorTimeSeries: hours.map((time) => ({
      time,
      errors: randomBetween(5, 80),
      total: randomBetween(200, 1000),
    })),
    traceVolumeTimeSeries: hours.map((time) => ({
      time,
      count: randomBetween(200, 1200),
    })),
    costTimeSeries: hours.map((time) => ({
      time,
      cost: randomFloat(5, 50),
    })),
    topAgentsByTraces: agents.slice(0, 5).map((a) => ({
      name: a.agentName,
      traces: randomBetween(1000, 10000),
      passRate: randomFloat(85, 99),
    })),
    recentAlerts: alerts.slice(0, 5),
  };
}

// --- Alerts ---
export function generateAlerts(agents: AgentVersion[]): Alert[] {
  const alertTemplates = [
    { title: "Error rate spike detected", metric: "error_rate", severity: "critical" as const },
    { title: "P99 latency exceeded threshold", metric: "p99_latency", severity: "warning" as const },
    { title: "Eval pass rate degradation", metric: "eval_pass_rate", severity: "critical" as const },
    { title: "Cost anomaly detected", metric: "hourly_cost", severity: "warning" as const },
    { title: "Agent timeout rate increase", metric: "timeout_rate", severity: "warning" as const },
    { title: "Token usage spike", metric: "token_usage", severity: "info" as const },
    { title: "New agent version deployed", metric: "deployment", severity: "info" as const },
    { title: "Regression detected in eval suite", metric: "regression", severity: "critical" as const },
  ];

  return alertTemplates.map((tmpl, i) => {
    const agent = randomItem(agents);
    return {
      id: uuid(),
      agentId: agent.agentId,
      agentName: agent.agentName,
      severity: tmpl.severity,
      title: tmpl.title,
      description: `${tmpl.title} for ${agent.agentName} v${agent.version}. Current value exceeds configured threshold.`,
      triggeredAt: isoAgo(randomBetween(1, 48)),
      acknowledgedAt: i < 3 ? isoAgo(randomBetween(0, 1)) : undefined,
      resolvedAt: i < 2 ? isoAgo(0) : undefined,
      metric: tmpl.metric,
      threshold: randomFloat(1, 100),
      actualValue: randomFloat(50, 200),
    };
  });
}

// --- Singleton data store ---
let _agents: AgentVersion[] | null = null;
let _traces: Trace[] | null = null;
let _datasets: EvalDataset[] | null = null;
let _evalRuns: EvalRun[] | null = null;
let _alerts: Alert[] | null = null;
let _metrics: DashboardMetrics | null = null;

export function getAgents() {
  if (!_agents) _agents = generateAgents();
  return _agents;
}

export function getTraces() {
  if (!_traces) _traces = generateTraces(getAgents(), 60);
  return _traces;
}

export function getDatasets() {
  if (!_datasets) _datasets = generateDatasets();
  return _datasets;
}

export function getEvalRuns() {
  if (!_evalRuns) _evalRuns = generateEvalRuns(getAgents(), getDatasets());
  return _evalRuns;
}

export function getAlerts() {
  if (!_alerts) _alerts = generateAlerts(getAgents());
  return _alerts;
}

export function getDashboardMetrics() {
  if (!_metrics) _metrics = generateDashboardMetrics(getAgents(), getAlerts());
  return _metrics;
}
