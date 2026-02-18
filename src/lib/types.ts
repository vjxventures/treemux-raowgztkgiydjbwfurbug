// Core domain types for AgentProbe

export type TraceStatus = "running" | "completed" | "failed" | "timeout";
export type StepType = "llm_call" | "tool_call" | "api_call" | "decision" | "human_review" | "error";
export type EvalResult = "pass" | "fail" | "warn" | "skip";
export type AgentStatus = "active" | "paused" | "deprecated" | "archived";
export type Severity = "critical" | "warning" | "info";

export interface AgentVersion {
  id: string;
  agentId: string;
  agentName: string;
  version: string;
  status: AgentStatus;
  description: string;
  createdAt: string;
  config: Record<string, unknown>;
  traceCount: number;
  passRate: number;
  avgLatency: number;
  p99Latency: number;
  errorRate: number;
}

export interface TraceStep {
  id: string;
  traceId: string;
  index: number;
  type: StepType;
  name: string;
  input: string;
  output: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  tokenCount?: number;
  cost?: number;
  metadata?: Record<string, unknown>;
  error?: string;
}

export interface Trace {
  id: string;
  agentId: string;
  agentVersion: string;
  agentName: string;
  sessionId: string;
  status: TraceStatus;
  startedAt: string;
  endedAt?: string;
  totalDurationMs: number;
  totalTokens: number;
  totalCost: number;
  stepCount: number;
  steps: TraceStep[];
  input: string;
  output?: string;
  error?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface EvalCase {
  id: string;
  name: string;
  description: string;
  input: string;
  expectedOutput: string;
  assertions: EvalAssertion[];
  tags: string[];
}

export interface EvalAssertion {
  type: "exact_match" | "contains" | "regex" | "semantic_similarity" | "json_schema" | "custom";
  value: string;
  weight: number;
}

export interface EvalRun {
  id: string;
  agentId: string;
  agentVersion: string;
  datasetId: string;
  datasetName: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  endedAt?: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  warnCases: number;
  skippedCases: number;
  results: EvalCaseResult[];
  triggeredBy: "manual" | "ci_cd" | "schedule" | "regression";
}

export interface EvalCaseResult {
  id: string;
  caseId: string;
  caseName: string;
  result: EvalResult;
  actualOutput: string;
  score: number;
  durationMs: number;
  assertions: {
    type: string;
    passed: boolean;
    expected: string;
    actual: string;
  }[];
  traceId?: string;
}

export interface EvalDataset {
  id: string;
  name: string;
  description: string;
  caseCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Alert {
  id: string;
  agentId: string;
  agentName: string;
  severity: Severity;
  title: string;
  description: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metric: string;
  threshold: number;
  actualValue: number;
}

export interface DashboardMetrics {
  totalTraces: number;
  tracesLast24h: number;
  tracesTrend: number; // percentage change
  avgLatency: number;
  latencyTrend: number;
  errorRate: number;
  errorRateTrend: number;
  totalCost: number;
  costTrend: number;
  activeAgents: number;
  evalPassRate: number;
  evalPassRateTrend: number;
  latencyTimeSeries: { time: string; p50: number; p95: number; p99: number }[];
  errorTimeSeries: { time: string; errors: number; total: number }[];
  traceVolumeTimeSeries: { time: string; count: number }[];
  costTimeSeries: { time: string; cost: number }[];
  topAgentsByTraces: { name: string; traces: number; passRate: number }[];
  recentAlerts: Alert[];
}
