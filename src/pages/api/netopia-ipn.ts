import type { NextApiRequest, NextApiResponse } from "next";
import forge from "node-forge";
import { parseStringPromise } from "xml2js";
import { sendOrderConfirmation } from "@/lib/email"; 
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

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
try { db.settings({ ignoreUndefinedProperties: true }); } catch (e) {}

// --- 2. Funcție Decriptare RC4 ---
function rc4Decrypt(key: Buffer, input: Buffer): Buffer {
  const s: number[] = [];
  let j = 0; let x: number;
  for (let i = 0; i < 256; i++) { s[i] = i; }
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

// --- 3. Funcție Notificare Admin (MODIFICATĂ) ---
async function sendAdminNotification(order: any) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const produseHTML = order.produse?.map((p: any) => 
        `<li style="margin-bottom: 5px;">${p.titlu} - <strong>${p.pret} RON</strong></li>`
    ).join('');

    // Extragem adresa
    const adresa = order.adresaLivrare;
    
    // Construim blocul HTML cu detaliile de livrare
    const detaliiLivrareHTML = adresa ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; background-color: #fff8f8; border: 1px solid #ffcccc;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Nume Client:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${adresa.nume} ${adresa.prenume}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Telefon:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="tel:${adresa.telefon}">${adresa.telefon}</a></td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${adresa.email}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Adresă:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${adresa.adresa}</td>
            </tr>
            <tr>
                <td style="padding: 8px; font-weight: bold;">Oraș/Județ:</td>
                <td style="padding: 8px;">${adresa.oras}, ${adresa.judet} ${adresa.codPostal ? `(${adresa.codPostal})` : ''}</td>
            </tr>
            ${adresa.detalii ? `
            <tr>
                <td style="padding: 8px; font-weight: bold; background-color: #fff3cd; color: #856404; border-top: 2px solid #ffeeba;">📝 Detalii Adiționale:</td>
                <td style="padding: 8px; background-color: #fff3cd; color: #856404; font-style: italic; border-top: 2px solid #ffeeba;">${adresa.detalii}</td>
            </tr>
            ` : ''}
        </table>
    ` : `<p style="color: red;">Adresa nu este disponibilă.</p>`;

    const adminBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 3px solid #dc2626; max-width: 600px; margin: auto;">
            <h2 style="color: #dc2626; margin-top: 0;">🚨 COMANDĂ NOUĂ! #${order.orderId}</h2>
            
            <p style="font-size: 18px;"><strong>Total Încasat:</strong> <span style="color: green;">${order.amount} RON</span></p>
            
            <h3 style="background-color: #333; color: white; padding: 5px 10px; margin-bottom: 0;">📦 Produse de trimis:</h3>
            <ul style="border: 1px solid #ddd; border-top: none; padding: 15px 15px 15px 35px; margin-top: 0;">
                ${produseHTML}
            </ul>

            <h3 style="background-color: #333; color: white; padding: 5px 10px; margin-bottom: 0; margin-top: 20px;">📍 Detalii Livrare (AWB):</h3>
            ${detaliiLivrareHTML}

            <p style="margin-top: 30px; font-size: 12px; color: #666;">Verifică Firebase pentru datele brute.</p>
        </div>
    `;

    await transporter.sendMail({
        from: `"Admin Alert" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Trimite ție
        subject: `💰 COMANDĂ NOUĂ #${order.orderId} - ${order.amount} RON`,
        html: adminBody,
    });
}

// --- 4. Funcție Scădere Stoc ---
async function updateProductStock(produseComanda: any[]) {
  for (const item of produseComanda) {
    if (!item.id) continue;
    const marime = item.marimeSelectata || item.marime; 
    if (!marime) continue;

    const productRef = db.collection("products").doc(String(item.id));
    
    await db.runTransaction(async (t) => {
      const doc = await t.get(productRef);
      if (!doc.exists) return;

      const data = doc.data();
      const marimi = data?.marimi || [];

      let stocModificat = false;
      const marimiActualizate = marimi.map((m: any) => {
        if (m.nume === marime) {
          const stocNou = Math.max(0, m.stoc - 1);
          stocModificat = true;
          return { ...m, stoc: stocNou };
        }
        return m;
      });

      if (stocModificat) {
          t.update(productRef, { marimi: marimiActualizate });
      }
    });
  }
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
          // 1. Actualizăm statusul
          await orderRef.update({ 
            status: "completed",
            paymentDate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log("✅ Firebase actualizat.");

          // 2. Scădem stocul
          try {
              await updateProductStock(orderData.produse);
          } catch (stocErr) {
              console.error("⚠️ Eroare stoc:", stocErr);
          }

          // 3. Trimitem Email Client
          await sendOrderConfirmation({
            nume: orderData?.details,
            email: orderData?.email,
            adresa: "Detalii în cont", 
            produse: orderData?.produse || [],
            total: orderData?.amount,
            orderId: orderId,
            adresaLivrare: orderData?.adresaLivrare,
          });
          
          // 4. Trimitem Email Admin (Cu noile detalii)
          try {
             await sendAdminNotification(orderData);
             console.log("📨 Notificare Admin trimisă!");
          } catch(e) { console.error("Err admin email", e); }

        } else {
            console.log("ℹ️ Comanda era deja procesată.");
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