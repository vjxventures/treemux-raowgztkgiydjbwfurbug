import { NextRequest, NextResponse } from "next/server";
import { agentStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json(agentStore.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const agent = agentStore.create(body);
  return NextResponse.json(agent, { status: 201 });
}
