import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCredentialByDID, addAuditEntry, getAuditLog } from "@/lib/store";
import { verify, hashData } from "@/lib/crypto";
import type { VerificationResult, PolicyEvaluation, AuditEntry } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentDID, action, target, parameters, signature, timestamp } = body;

    if (!agentDID || !action) {
      return NextResponse.json({ error: "agentDID and action are required" }, { status: 400 });
    }

    // Look up credential
    const credential = getCredentialByDID(agentDID);
    if (!credential) {
      const result: VerificationResult = {
        verified: false,
        agentDID,
        permissions: [],
        constraintsPassed: false,
        policyEvaluations: [],
        authorityChainValid: false,
        reason: "Unknown agent DID - no credential found",
      };
      return NextResponse.json(result, { status: 403 });
    }

    // Check credential status
    if (credential.status !== "active") {
      const result: VerificationResult = {
        verified: false,
        agentDID,
        credentialId: credential.id,
        permissions: credential.permissions,
        constraintsPassed: false,
        policyEvaluations: [],
        authorityChainValid: true,
        reason: `Credential is ${credential.status}`,
      };
      logVerification(credential.id, agentDID, action, target || "", parameters || {}, "denied", []);
      return NextResponse.json(result, { status: 403 });
    }

    // Check expiry
    if (new Date(credential.expiresAt) < new Date()) {
      const result: VerificationResult = {
        verified: false,
        agentDID,
        credentialId: credential.id,
        permissions: credential.permissions,
        constraintsPassed: false,
        policyEvaluations: [],
        authorityChainValid: true,
        reason: "Credential has expired",
      };
      logVerification(credential.id, agentDID, action, target || "", parameters || {}, "denied", []);
      return NextResponse.json(result, { status: 403 });
    }

    // Check permission scope
    const actionScope = action.replace(".", ":");
    const hasPermission = credential.permissions.some((p) => {
      const [domain, right] = p.split(":");
      const [actionDomain] = actionScope.split(":");
      return domain === actionDomain || p === actionScope;
    });

    // Evaluate policy constraints
    const policyEvals: PolicyEvaluation[] = credential.constraints.map((constraint) => {
      switch (constraint.type) {
        case "spending_limit": {
          const amount = (parameters?.amount as number) || 0;
          const max = (constraint.params.maxPerTransaction as number) || Infinity;
          const passed = amount <= max;
          return {
            constraintType: "spending_limit",
            passed,
            reason: passed ? undefined : `Amount ${amount} exceeds limit ${max}`,
          };
        }
        case "rate_limit": {
          // Simplified: always passes in demo
          return { constraintType: "rate_limit", passed: true };
        }
        case "time_bound": {
          return { constraintType: "time_bound", passed: true };
        }
        case "api_scope": {
          return { constraintType: "api_scope", passed: true };
        }
        case "geo_fence": {
          return { constraintType: "geo_fence", passed: true };
        }
        default:
          return { constraintType: constraint.type, passed: true };
      }
    });

    const allConstraintsPassed = policyEvals.every((e) => e.passed);

    // Verify signature if provided
    let signatureValid = true;
    if (signature) {
      const message = JSON.stringify({ agentDID, action, target, parameters, timestamp });
      signatureValid = verify(message, signature, credential.agentPublicKey);
    }

    // Verify authority chain
    const authorityChainValid = credential.authorityChain.length >= 2;

    const verified = hasPermission && allConstraintsPassed && signatureValid && authorityChainValid;
    const resultStatus = verified ? "success" : "denied";

    logVerification(credential.id, agentDID, action, target || "", parameters || {}, resultStatus, policyEvals);

    const result: VerificationResult = {
      verified,
      agentDID,
      credentialId: credential.id,
      permissions: credential.permissions,
      constraintsPassed: allConstraintsPassed,
      policyEvaluations: policyEvals,
      authorityChainValid,
      reason: !hasPermission
        ? "Action not permitted by credential scope"
        : !allConstraintsPassed
        ? "Policy constraint violation"
        : !signatureValid
        ? "Invalid signature"
        : undefined,
    };

    return NextResponse.json(result, { status: verified ? 200 : 403 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

function logVerification(
  credentialId: string,
  agentDID: string,
  action: string,
  target: string,
  parameters: Record<string, unknown>,
  result: "success" | "denied" | "error",
  policyEvaluations: PolicyEvaluation[]
) {
  const existingLog = getAuditLog();
  const prevHash = existingLog.length > 0
    ? existingLog[existingLog.length - 1].entryHash
    : hashData("genesis");

  const entry: AuditEntry = {
    id: uuid(),
    credentialId,
    agentDID,
    action,
    target,
    parameters,
    result,
    policyEvaluations,
    timestamp: new Date().toISOString(),
    previousHash: prevHash,
    entryHash: "",
  };
  entry.entryHash = hashData(JSON.stringify({ ...entry, entryHash: "" }));
  addAuditEntry(entry);
}
