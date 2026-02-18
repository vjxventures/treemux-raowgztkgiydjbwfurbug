/**
 * ATP Cryptographic Primitives
 * Ed25519 key generation, signing, and verification for agent identity
 */
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

// Ed25519 requires sha512 sync
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export interface KeyPair {
  publicKey: string; // hex
  privateKey: string; // hex
}

export function generateKeyPair(): KeyPair {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = ed.getPublicKey(privateKey);
  return {
    publicKey: bytesToHex(publicKey),
    privateKey: bytesToHex(privateKey),
  };
}

export function sign(message: string, privateKey: string): string {
  const msgBytes = new TextEncoder().encode(message);
  const sig = ed.sign(msgBytes, hexToBytes(privateKey));
  return bytesToHex(sig);
}

export function verify(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const msgBytes = new TextEncoder().encode(message);
    return ed.verify(hexToBytes(signature), msgBytes, hexToBytes(publicKey));
  } catch {
    return false;
  }
}

export function hashData(data: string): string {
  const bytes = new TextEncoder().encode(data);
  return bytesToHex(sha256(bytes));
}

/**
 * Derives a deterministic agent DID from a public key
 * Format: did:atp:<hex-encoded-sha256-of-pubkey>
 */
export function deriveDID(publicKey: string): string {
  const hash = hashData(publicKey);
  return `did:atp:${hash.slice(0, 40)}`;
}
