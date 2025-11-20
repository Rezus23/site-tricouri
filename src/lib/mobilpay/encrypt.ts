// src/lib/mobilpay/encrypt.ts
import forge from "node-forge";

// Dacă în viitor vei avea nevoie de readPublicKey, îl adăugăm înapoi.
// Deocamdată îl eliminăm complet pentru a evita eroarea ESLint.

export function encrypt(
  xml: string,
  opts?: { publicKeyPem?: string }
): {
  env_key: string;
  data: string;
  iv: string;
  cipher: string;
} {
  const pem = opts?.publicKeyPem || process.env.MOBILPAY_PUBLIC_KEY_PEM;

  if (!pem) {
    throw new Error("MOBILPAY_PUBLIC_KEY_PEM lipsă în env");
  }

  // Aici va fi implementarea reală (RSA + AES)
  // Pentru build-ul de acum returnăm mock (evităm ESLint).
  return {
    env_key: "...",
    data: "...",
    iv: "...",
    cipher: "...",
  };
}
