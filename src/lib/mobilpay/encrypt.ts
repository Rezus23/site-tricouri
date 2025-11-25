import forge from "node-forge";

/**
 * Criptare RC4 care suportă UTF-8 (Buffer based)
 */
function rc4(key: Buffer, input: Buffer): Buffer {
  const s: number[] = [];
  let j = 0;
  let x: number;

  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }

  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }

  let i = 0;
  j = 0;
  const output = Buffer.alloc(input.length);

  for (let y = 0; y < input.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    output[y] = input[y] ^ s[(s[i] + s[j]) % 256];
  }

  return output;
}

export function encrypt(
  xml: string,
  opts?: { publicKeyPem?: string }
) {
  let pem = opts?.publicKeyPem || process.env.MOBILPAY_PUBLIC_KEY_PEM;

  if (!pem) {
    throw new Error("MOBILPAY_PUBLIC_KEY_PEM lipsă în fișierul .env");
  }

  // Reparăm formatarea certificatului
  pem = pem.replace(/\\n/g, '\n');

  try {
    // 1. Generăm cheia RC4 (16 bytes)
    // Folosim Buffer direct pentru siguranță
    const randomKeyBuffer = Buffer.from(forge.random.getBytesSync(16), 'binary');

    // 2. Pregătim XML-ul ca Buffer UTF-8 (pentru a suporta diacritice: ă, î, ș, ț)
    const xmlBuffer = Buffer.from(xml, 'utf8');

    // 3. Criptăm XML-ul cu funcția noastră manuală RC4
    const encryptedDataBuffer = rc4(randomKeyBuffer, xmlBuffer);
    
    // Convertim rezultatul în Base64
    const encryptedData = encryptedDataBuffer.toString('base64');

    // 4. Criptăm cheia RC4 folosind RSA
    const cert = forge.pki.certificateFromPem(pem);
    const publicKey = cert.publicKey as forge.pki.rsa.PublicKey;

    // RSA encrypt pe cheia raw
    // Convertim Buffer-ul cheii în string binary pentru forge
    const randomKeyBinaryString = randomKeyBuffer.toString('binary');
    const encryptedKeyRaw = publicKey.encrypt(randomKeyBinaryString, 'RSAES-PKCS1-V1_5' as any);
    const encryptedKey = forge.util.encode64(encryptedKeyRaw);

    return {
      env_key: encryptedKey,
      data: encryptedData,
      iv: "",
      cipher: "rc4",
    };

  } catch (error: any) {
    console.error("Eroare la criptare Netopia:", error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}