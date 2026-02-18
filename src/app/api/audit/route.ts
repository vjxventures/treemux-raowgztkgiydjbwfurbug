import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const credentialId = searchParams.get("credentialId") || undefined;
  const entries = getAuditLog(credentialId);
  return NextResponse.json({ entries: entries.reverse() });
}
