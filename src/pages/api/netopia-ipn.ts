import type { NextApiRequest, NextApiResponse } from "next";
import forge from "node-forge";
import { parseStringPromise } from "xml2js";
import { sendOrderConfirmation } from "@/lib/email"; // Asigură-te că importul e corect
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// --- Configurare Firebase ---
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
    console.error("🔥 Eroare inițializare Firebase:", e);
  }
}
const db = getFirestore();

// --- RC4 Decrypt ---
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

  console.log("🚀 [IPN] Start procesare notificare Netopia.");
  
  const { env_key, data } = req.body;

  if (!env_key || !data) {
    console.error("❌ [IPN] Lipsesc datele (env_key/data).");
    return res.status(400).send("Missing data");
  }

  try {
    // 1. Verificare Cheie Privată
    let pkPem = process.env.MOBILPAY_PRIVATE_KEY_PEM;
    if (!pkPem) throw new Error("Variabila MOBILPAY_PRIVATE_KEY_PEM lipsește!");
    
    // Curățare cheie (foarte important pt Vercel)
    pkPem = pkPem.replace(/\\n/g, '\n').replace(/"/g, '').trim(); 

    // 2. Decriptare RSA
    console.log("🔑 [IPN] Decriptare RSA...");
    const privateKey = forge.pki.privateKeyFromPem(pkPem);
    const envKeyBuffer = Buffer.from(env_key, "base64");
    const decryptedEnvKey = privateKey.decrypt(envKeyBuffer.toString("binary"), "RSAES-PKCS1-V1_5" as any);

    // 3. Decriptare RC4
    console.log("Dd [IPN] Decriptare RC4...");
    const dataBuffer = Buffer.from(data, "base64");
    const rc4KeyBuffer = Buffer.from(decryptedEnvKey, "binary");
    const decryptedXmlBuffer = rc4Decrypt(rc4KeyBuffer, dataBuffer);
    const xmlStr = decryptedXmlBuffer.toString("utf8");

    // 4. Parsare XML
    const xmlObj = await parseStringPromise(xmlStr);
    const order = xmlObj.order;
    const orderId = order.$.id;
    const action = order.obj[0].action[0]; 
    const error = order.obj[0].$.error_code; 

    console.log(`📊 [IPN] Status Netopia: ID=${orderId}, Action=${action}, Error=${error}`);

    if (error == "0" && (action === "confirmed" || action === "paid")) {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        console.error("❌ [IPN] Comanda NU a fost găsită în Firebase:", orderId);
      } else {
        const orderData = orderSnap.data();
        
        // Verificăm să nu trimitem mailul de două ori
        if (orderData?.status !== "completed") {
            console.log("✅ [IPN] Confirmare plată. Actualizez Firebase...");
            
            await orderRef.update({ 
                status: "completed",
                paymentDate: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log("📧 [IPN] Trimit email către:", orderData?.email);
            
            // APELARE FUNCȚIE EMAIL
            const emailSent = await sendOrderConfirmation({
                nume: orderData?.details || "Client",
                email: orderData?.email, // Adresa din Firebase
                adresa: "Adresă (vezi detalii cont)", 
                produse: orderData?.produse || [],
                total: orderData?.amount,
                orderId: orderId
            });

            if (emailSent) console.log("🎉 [IPN] Email trimis cu succes!");
            else console.error("⚠️ [IPN] Eroare la trimitere email (vezi logs sendOrderConfirmation).");
            
        } else {
            console.log("ℹ️ [IPN] Comanda era deja completată.");
        }
      }
    }

    // Răspuns XML Obligatoriu
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">0</crc>`);

  } catch (err: any) {
    console.error("❌ [IPN CRASH]:", err.message);
    // Nu trimitem 500 la Netopia ca să nu reîncerce la infinit dacă e eroare de cod
    return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">0</crc>`);
  }
}