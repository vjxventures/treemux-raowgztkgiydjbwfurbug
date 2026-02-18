import { NextRequest, NextResponse } from "next/server";
import { disputeStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json(disputeStore.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dispute = disputeStore.create(body);
  return NextResponse.json(dispute, { status: 201 });
}
