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
  } catch (e) { console.error("🔥 Eroare init Firebase:", e); }
}

const db = getFirestore();

// Evităm eroarea de re-inițializare a setărilor pe Vercel
try {
  db.settings({ ignoreUndefinedProperties: true });
} catch (e) {}


// --- 2. Funcție Decriptare RC4 (CORECTATĂ) ---
function rc4Decrypt(key: Buffer, input: Buffer): Buffer {
  const s: number[] = [];
  let j = 0; 
  let x: number;

  // 1. Inițializare
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }

  // 2. KSA (Amestecare Cheie)
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) % 256;
    x = s[i]; 
    s[i] = s[j]; 
    s[j] = x;
  }

  // 3. PRGA (Generare Stream)
  let i = 0; 
  j = 0;
  // ⚠️ FIX: Declarăm 'output' AICI, înainte să îl folosim în bucla de mai jos
  const output = Buffer.alloc(input.length); 

  for (let y = 0; y < input.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i]; 
    s[i] = s[j]; 
    s[j] = x;
    // Acum putem scrie în output, pentru că a fost declarat mai sus
    output[y] = input[y] ^ s[(s[i] + s[j]) % 256]; 
  }
  
  return output;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  console.log("🚀 [IPN] Start procesare.");

  const { env_key, data } = req.body;
  if (!env_key || !data) return res.status(400).send("Missing data");

  try {
    // --- DECRIPTARE ---
    let pkPem = process.env.MOBILPAY_PRIVATE_KEY_PEM;
    if (!pkPem) throw new Error("Private Key Missing");
    pkPem = pkPem.replace(/\\n/g, '\n').replace(/"/g, '').trim();

    const privateKey = forge.pki.privateKeyFromPem(pkPem);
    const envKeyBuffer = Buffer.from(env_key, "base64");
    const decryptedEnvKey = privateKey.decrypt(envKeyBuffer.toString("binary"), "RSAES-PKCS1-V1_5" as any);
    
    const dataBuffer = Buffer.from(data, "base64");
    const rc4KeyBuffer = Buffer.from(decryptedEnvKey, "binary");
    const decryptedXmlBuffer = rc4Decrypt(rc4KeyBuffer, dataBuffer);
    const xmlStr = decryptedXmlBuffer.toString("utf8");

    // --- PARSARE XML ---
    const xmlObj = await parseStringPromise(xmlStr);
    const order = xmlObj?.order;
    const orderId = order?.$?.id;
    const mobilepay = order?.mobilpay?.[0];
    const action = mobilepay?.action?.[0]; 
    const error = mobilepay?.error?.[0]?.$?.code; 

    // --- 3. PROCESARE & EMAIL ---
    if (orderId && error == "0" && (action === "confirmed" || action === "paid")) {
      const orderRef = db.collection("orders").doc(orderId);
      const orderSnap = await orderRef.get();

      if (orderSnap.exists) {
        const orderData = orderSnap.data() as any; 

        if (orderData?.status !== "completed") {
          await orderRef.update({ 
            status: "completed",
            paymentDate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log("✅ Firebase actualizat. Trimit email...");

          // Construire HTML Email cu Adresa
          const { amount, email, produse, adresaLivrare } = orderData;
          
          const adresaHTML = adresaLivrare ? `
            <div style="border: 1px solid #ccc; padding: 15px; margin-top: 20px; border-radius: 8px; background-color: #f9f9f9;">
              <h3 style="color: #333; margin-top: 0;">Detalii Livrare</h3>
              <p style="margin: 5px 0;"><strong>Nume:</strong> ${adresaLivrare.nume} ${adresaLivrare.prenume}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Telefon:</strong> ${adresaLivrare.telefon}</p>
              <p style="margin: 5px 0;"><strong>Adresa:</strong> ${adresaLivrare.adresa}, ${adresaLivrare.oras}, ${adresaLivrare.judet} ${adresaLivrare.codPostal ? `(${adresaLivrare.codPostal})` : ''}</p>
            </div>
          ` : `<p>Adresa de livrare nu a fost găsită în comandă.</p>`;

          const produseHTML = produse?.map((p: any) => 
            `<li>${p.titlu} (${p.pret} RON)</li>`
          ).join('');

          const emailBody = `
              <html>
                  <body>
                      <h1 style="color: #155724;">Comanda #${orderId} a fost confirmată!</h1>
                      <p>Comanda ta a fost plasată cu succes.</p>
                      ${adresaHTML} 
                      <h3 style="margin-top: 30px; color: #333;">Produse Comandate:</h3>
                      <ul>${produseHTML}</ul>
                      <p style="font-size: 1.2em; font-weight: bold; margin-top: 20px;">
                          Total Plătit: ${amount?.toFixed(2) ?? '0.00'} RON
                      </p>
                  </body>
              </html>
          `;

          // Trimite Email (cu htmlContent)
          await sendOrderConfirmation({
            nume: orderData?.details || "Client",
            email: orderData?.email,
            adresa: "Vezi detalii", 
            produse: orderData?.produse || [],
            total: orderData?.amount,
            orderId: orderId,
            adresaLivrare: orderData?.adresaLivrare,
            htmlContent: emailBody // 👈 Trimitem conținutul HTML generat
          });
          
          console.log("🎉 Email trimis cu succes!");
        } else {
            console.log("ℹ️ Comanda era deja completată.");
        }
      } else {
          console.error("❌ Comanda nu există în Firebase:", orderId);
      }
    }

    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">0</crc>`);

  } catch (err: any) {
    console.error("❌ EROARE CRITICĂ IPN:", err.message);
    return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">0</crc>`);
  }
}