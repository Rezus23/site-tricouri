import type { NextApiRequest, NextApiResponse } from "next";
import forge from "node-forge";
import { parseStringPromise } from "xml2js";
import { sendOrderConfirmation } from "@/lib/email";
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// --- 1. Init Firebase ---
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (e) {
    console.error("🔥 Eroare init Firebase:", e);
  }
}
const db = getFirestore();

// --- 2. Decriptare RC4 ---
function rc4Decrypt(key: Buffer, input: Buffer): Buffer {
  const s: number[] = [];
  let j = 0; let x: number;
  for (let i = 0; i < 256; i++) s[i] = i;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) % 256;
    x = s[i]; s[i] = s[j]; s[j] = x;
  }
  let i = 0; j = 0;
  const output = Buffer.alloc(input.length);
  for (let y = 0; y < input.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i]; s[i] = s[j]; s[j] = x;
    output[y] = input[y] ^ s[(s[i] + s[j]) % 256];
  }
  return output;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  console.log("🚀 [IPN] Start. ID:", Date.now());

  const { env_key, data } = req.body;
  if (!env_key || !data) return res.status(400).send("Missing data");

  try {
    // 1. Cheia Privată
    let pkPem = process.env.MOBILPAY_PRIVATE_KEY_PEM;
    if (!pkPem) throw new Error("MOBILPAY_PRIVATE_KEY_PEM missing");
    pkPem = pkPem.replace(/\\n/g, '\n').replace(/"/g, '').trim();

    // 2. Decriptare RSA
    const privateKey = forge.pki.privateKeyFromPem(pkPem);
    const envKeyBuffer = Buffer.from(env_key, "base64");
    const decryptedEnvKey = privateKey.decrypt(envKeyBuffer.toString("binary"), "RSAES-PKCS1-V1_5" as any);
    
    // 3. Decriptare RC4
    const dataBuffer = Buffer.from(data, "base64");
    const rc4KeyBuffer = Buffer.from(decryptedEnvKey, "binary");
    const decryptedXmlBuffer = rc4Decrypt(rc4KeyBuffer, dataBuffer);
    const xmlStr = decryptedXmlBuffer.toString("utf8");

    // 🔥 LOG CRITIC: Vedem ce am decriptat!
    console.log("📜 XML DECRIPTAT:", xmlStr); 

    // 4. Parsare XML (Safe Mode)
    const xmlObj = await parseStringPromise(xmlStr);
    
    // Verificăm structura cu '?' ca să nu mai primim eroare de "undefined"
    const order = xmlObj?.order;
    const orderId = order?.$?.id;
    
    // Aici crăpa înainte (la obj[0] sau action[0]). Folosim ?. peste tot.
    const action = order?.obj?.[0]?.action?.[0] || order?.action?.[0]; // Poate fi in locuri diferite
    const error = order?.obj?.[0]?.$?.error_code || order?.$?.error_code;

    console.log(`📊 STATUS DETECTAT: ID=${orderId}, Action=${action}, Error=${error}`);

    // 5. Procesare
    if (orderId && (action === "confirmed" || action === "paid")) {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();

      if (orderSnap.exists) {
        const orderData = orderSnap.data();
        if (orderData?.status !== "completed") {
          await orderRef.update({ 
            status: "completed",
            paymentDate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log("📧 Trimit email către:", orderData?.email);
          await sendOrderConfirmation({
            nume: orderData?.details || "Client",
            email: orderData?.email,
            adresa: "N/A", 
            produse: orderData?.produse || [],
            total: orderData?.amount,
            orderId: orderId
          });
          console.log("🎉 Email trimis!");
        }
      }
    }

    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">0</crc>`);

  } catch (err: any) {
    console.error("❌ EROARE:", err.message);
    // Logăm tot stack-ul dacă e nevoie
    console.error(err);
    return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">0</crc>`);
  }
}