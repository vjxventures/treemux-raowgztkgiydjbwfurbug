import { NextRequest, NextResponse } from "next/server";
import { transactionStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (agentId) return NextResponse.json(transactionStore.getByAgent(agentId));
  return NextResponse.json(transactionStore.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tx = transactionStore.create(body);
  return NextResponse.json(tx, { status: 201 });
}
