import { NextRequest, NextResponse } from "next/server";
import { transactionStore } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tx = transactionStore.getById(id);
  if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  return NextResponse.json(tx);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (body.status) {
    const tx = transactionStore.updateStatus(id, body.status);
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    return NextResponse.json(tx);
  }
  return NextResponse.json({ error: "Invalid update" }, { status: 400 });
}
