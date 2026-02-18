import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCredentials, addCredential, getOrganizations, getPrincipals } from "@/lib/store";
import { generateKeyPair, deriveDID, sign, hashData } from "@/lib/crypto";
import type { AgentCredential, PolicyConstraint, AuthorityLink } from "@/lib/types";

export async function GET() {
  const credentials = getCredentials();
  return NextResponse.json({ credentials });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentName, permissions, constraints } = body;

    if (!agentName || !permissions?.length) {
      return NextResponse.json({ error: "agentName and permissions are required" }, { status: 400 });
    }

    const orgs = getOrganizations();
    const org = orgs[0];
    if (!org) {
      return NextResponse.json({ error: "No organization found" }, { status: 500 });
    }

    const principals = getPrincipals(org.id);
    const issuer = principals[0];
    if (!issuer) {
      return NextResponse.json({ error: "No issuer found" }, { status: 500 });
    }

    // Generate agent keypair
    const agentKp = generateKeyPair();
    const agentDid = deriveDID(agentKp.publicKey);
    const credId = uuid();

    // Build authority chain
    const authorityChain: AuthorityLink[] = [
      {
        fromDID: org.did,
        toDID: issuer.did,
        delegatedPermissions: permissions,
        signature: hashData(JSON.stringify({ from: org.did, to: issuer.did, perms: permissions })),
        timestamp: new Date().toISOString(),
      },
      {
        fromDID: issuer.did,
        toDID: agentDid,
        delegatedPermissions: permissions,
        signature: hashData(JSON.stringify({ from: issuer.did, to: agentDid, perms: permissions })),
        timestamp: new Date().toISOString(),
      },
    ];

    const parsedConstraints: PolicyConstraint[] = (constraints || []).map((c: PolicyConstraint) => ({
      type: c.type,
      params: c.params || {},
    }));

    const credPayload = JSON.stringify({
      id: credId,
      agentDID: agentDid,
      permissions,
      constraints: parsedConstraints,
    });

    const issuerKp = generateKeyPair(); // In production, would use stored key
    const credential: AgentCredential = {
      id: credId,
      orgId: org.id,
      issuerId: issuer.id,
      agentName,
      agentDID: agentDid,
      agentPublicKey: agentKp.publicKey,
      status: "active",
      permissions,
      constraints: parsedConstraints,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      issuerSignature: sign(credPayload, issuerKp.privateKey),
      authorityChain,
    };

    addCredential(credential);

    return NextResponse.json({
      credential,
      agentKeys: {
        publicKey: agentKp.publicKey,
        privateKey: agentKp.privateKey,
        did: agentDid,
      },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
