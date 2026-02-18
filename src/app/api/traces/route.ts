import { NextResponse } from "next/server";
import { getTraces } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  let traces = getTraces();
  if (agentId) traces = traces.filter((t) => t.agentId === agentId);
  if (status) traces = traces.filter((t) => t.status === status);
  traces = traces.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, limit);

  return NextResponse.json(traces);
}
