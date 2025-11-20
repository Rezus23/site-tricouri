// src/lib/mobilpay/encrypt.ts
import forge from "node-forge";

function readPublicKey(maybeCertPem: string) {
  if (
    maybeCertPem.includes("BEGIN PUBLIC KEY") ||
    maybeCertPem.includes("BEGIN RSA PUBLIC KEY")
  ) {
    return forge.pki.publicKeyFromPem(maybeCertPem);
  }
  if (maybeCertPem.includes("BEGIN CERTIFICATE")) {
    const cert = forge.pki.certificateFromPem(maybeCertPem);
    return cert.publicKey;
  }
  throw new Error(
    'PEM header type is not "PUBLIC KEY", "RSA PUBLIC KEY" or "CERTIFICATE".'
  );
}

export function encrypt(xml: string, opts?: { publicKeyPem?: string }) {
  const pem = opts?.publicKeyPem || process.env.MOBILPAY_PUBLIC_KEY_PEM;
  if (!pem) {
    throw new Error("MOBILPAY_PUBLIC_KEY_PEM lipsă în env");
  }

  

  // restul logicii tale de criptare (AES random key + RSA etc.)
  // și la final returnezi:
  return {
    env_key: "...",
    data: "...",
    iv: "...",
    cipher: "...",
  };
}
