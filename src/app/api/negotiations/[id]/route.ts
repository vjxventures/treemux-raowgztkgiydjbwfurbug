import { NextRequest, NextResponse } from "next/server";
import { negotiationStore } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const neg = negotiationStore.getById(id);
  if (!neg) return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
  return NextResponse.json(neg);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (body.message) {
    const updated = negotiationStore.addMessage(id, body.message);
    if (!updated) return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (body.status) {
    const updated = negotiationStore.updateStatus(id, body.status, body.terms);
    if (!updated) return NextResponse.json({ error: "Negotiation not found" }, { status: 404 });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid update" }, { status: 400 });
}
