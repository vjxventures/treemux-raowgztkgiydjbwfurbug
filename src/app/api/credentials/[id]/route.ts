import { NextResponse } from "next/server";
import { getCredential, updateCredentialStatus, getAuditLog } from "@/lib/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const credential = getCredential(id);
  if (!credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }
  const auditEntries = getAuditLog(id);
  return NextResponse.json({ credential, auditEntries });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!["active", "suspended", "revoked"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = updateCredentialStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, status });
}
