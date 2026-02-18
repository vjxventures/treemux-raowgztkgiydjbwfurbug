import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentDID = searchParams.get("agentDID") || undefined;
  const transactions = getTransactions(agentDID);
  return NextResponse.json({ transactions: transactions.reverse() });
}
