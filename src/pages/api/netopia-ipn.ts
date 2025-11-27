import type { NextApiRequest, NextApiResponse } from "next";
import forge from "node-forge";
import { parseStringPromise } from "xml2js";
import { sendOrderConfirmation } from "@/lib/email"; // Pentru email client
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer"; // Pentru notificarea admin

// --- 1. Configurare Firebase Admin ---
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
try { db.settings({ ignoreUndefinedProperties: true }); } catch (e) {}


// --- 2. Funcție Decriptare RC4 (Helper) ---
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

// --- 3. Funcție de trimitere Notificare Admin ---
async function sendAdminNotificationEmail(order: any, adminEmail: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const adresaLivrare = order.adresaLivrare;

    const adresaAdminHTML = adresaLivrare ? `
        <div style="padding: 15px; border: 1px solid #c08419; background-color: #fff9e6; margin-top: 15px; border-radius: 6px;">
            <h4 style="color: #c08419; margin-top: 0; font-size: 16px;">Detalii Livrare Client:</h4>
            <p style="margin: 5px 0;"><strong>Client:</strong> ${adresaLivrare.prenume} ${adresaLivrare.nume}</p>
            <p style="margin: 5px 0;"><strong>Email Client:</strong> ${order.email}</p>
            <p style="margin: 5px 0;"><strong>Telefon:</strong> ${adresaLivrare.telefon}</p>
            <p style="margin: 5px 0;"><strong>Adresa:</strong> ${adresaLivrare.adresa}, ${adresaLivrare.oras}, ${adresaLivrare.judet}</p>
            <p style="font-size: 1.1em; font-weight: bold; margin-top: 10px;">TOTAL: ${order.amount?.toFixed(2) ?? '0.00'} RON</p>
        </div>
    ` : `<p>Adresa nu a fost salvată.</p>`;

    const produseHTML = order.produse?.map((p: any) => 
        `<li style="margin-bottom: 5px;">${p.titlu} (${p.pret} RON)</li>`
    ).join('');
    
    const adminEmailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f4f4f4;">
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; border-top: 4px solid #dc2626;">
                <h1 style="color: #dc2626; font-size: 24px;">🚨 COMANDĂ NOUĂ PRIMITĂ! #${order.orderId}</h1>
                <p style="font-size: 16px; margin-bottom: 20px;">Un nou client a finalizat plata cu succes pe site.</p>
                
                ${adresaAdminHTML}

                <h3 style="margin-top: 30px; color: #1f2937;">Produse Comandate:</h3>
                <ul style="padding-left: 20px;">${produseHTML}</ul>

                <p style="margin-top: 30px; font-weight: bold;">Acționează rapid pentru a pregăti coletul.</p>
            </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
        from: `"Notificări Comenzi" <${process.env.EMAIL_USER}>`,
        to: adminEmail, // Trimitem către tine (adresa din EMAIL_USER)
        subject: `URGENT: COMANDA NOUĂ #${order.orderId} - ${order.amount?.toFixed(2)} RON`,
        html: adminEmailBody,
    });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  console.log("🚀 [IPN] Start procesare.");

  const { env_key, data } = req.body;
  if (!env_key || !data) return res.status(400).send("Missing data");

  try {
    // Decriptare
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

    // Parsare
    const xmlObj = await parseStringPromise(xmlStr);
    const order = xmlObj?.order;
    const orderId = order?.$?.id;
    const mobilepay = order?.mobilpay?.[0];
    const action = mobilepay?.action?.[0]; 
    const error = mobilepay?.error?.[0]?.$?.code; 

    // Procesare
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
          
          console.log("✅ Firebase actualizat. Trimit emailuri...");

          // --- 1. TRIMITE EMAIL CLIENT (Confimare comandă) ---
          await sendOrderConfirmation({
            nume: orderData?.adresaLivrare?.nume || "Client",
            email: orderData?.email,
            adresa: "Vezi detalii", 
            produse: orderData?.produse || [],
            total: orderData?.amount,
            orderId: orderId,
            adresaLivrare: orderData?.adresaLivrare,
          });
          
          // --- 2. TRIMITE EMAIL ADMIN (Notificare comandă nouă) ---
          await sendAdminNotificationEmail(orderData, process.env.EMAIL_USER!);
          
          console.log("🎉 Emailuri trimise cu succes!");
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
    console.error("❌ IPN ERROR:", err.message);
    return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">0</crc>`);
  }
}