import { NextResponse } from "next/server";
import { getAgents } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getAgents());
}
