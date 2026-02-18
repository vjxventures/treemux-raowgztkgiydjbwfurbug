import { NextRequest, NextResponse } from "next/server";
import { negotiationStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (agentId) return NextResponse.json(negotiationStore.getByAgent(agentId));
  return NextResponse.json(negotiationStore.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const negotiation = negotiationStore.create(body);
  return NextResponse.json(negotiation, { status: 201 });
}
