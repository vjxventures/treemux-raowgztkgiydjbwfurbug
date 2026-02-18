import { NextRequest, NextResponse } from "next/server";
import { serviceStore } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = serviceStore.getById(id);
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  return NextResponse.json(service);
}
