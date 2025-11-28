import type { NextApiRequest, NextApiResponse } from "next";
import { encrypt } from "@/lib/mobilpay/encrypt"; 
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// --- Inițializare Firebase Admin ---
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (e) { console.error("Firebase Init Error:", e); }
}

const db = getFirestore();

// Setăm opțiunea ignoreUndefinedProperties direct pe instanța Firestore
db.settings({
    ignoreUndefinedProperties: true 
});


function formatTimestamp(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    // 👈 MODIFICARE 1: Am adăugat 'adresaLivrare' la destructuring
    const { amount, details, produse, email, userId, adresaLivrare } = req.body; 

    if (!amount || amount <= 0) return res.status(400).json({ error: "Suma incorectă" });
    
    const userEmail = email || "client-fara-email@test.com";

    const signature = process.env.MOBILPAY_SIGNATURE;
    if (!signature) return res.status(500).json({ error: "Missing Signature" });

    const siteUrl = "https://www.passion4jerseys.ro";
    const confirmUrl = `${siteUrl}/api/netopia-ipn`;
    const returnUrl = `${siteUrl}/succes`;

    const orderId = `ORD-${Date.now()}`;
    const timestamp = formatTimestamp(new Date());
    
    // Definește URL-ul de bază Netopia (folosind HTTPS pentru securitate)
    const envBase = 
      process.env.NETOPIA_ENV === "live"
        ? "https://secure.mobilpay.ro" // Mod de producție
        : "https://sandboxsecure.mobilpay.ro"; // Mod Sandbox

    const paymentUrl = `${envBase}`;

    // Construim XML-ul pentru Netopia (nu includem toate detaliile adresei aici, 
    // doar strictul necesar pentru plată, dar le salvăm în DB)
    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <order type="card" id="${orderId}" timestamp="${timestamp}">
      <signature>${signature}</signature>
      <url>
        <confirm>${confirmUrl}</confirm>
        <return>${returnUrl}</return>
      </url>
      <invoice currency="RON" amount="${Number(amount).toFixed(2)}">
        <details>${details || "Comanda Tricouri"}</details>
        <contact>
            <email>${userEmail}</email> 
            <firstName>${adresaLivrare?.prenume || ''}</firstName>
            <lastName>${adresaLivrare?.nume || ''}</lastName>
            <address>${adresaLivrare?.adresa || ''}, ${adresaLivrare?.oras || ''}</address>
            <mobile>${adresaLivrare?.telefon || ''}</mobile>
        </contact>
      </invoice>
    </order>`.trim();

    const encrypted = encrypt(xml);

    // 💾 SALVARE ÎN FIREBASE
    await db.collection("orders").doc(orderId).set({
      orderId,
      amount: Number(amount),
      email: userEmail,
      details: details || "",
      currency: "RON",
      status: "pending",
      provider: "netopia",
      produse: produse || [],
      userId: userId || null, 
      adresaLivrare: adresaLivrare || null, // 👈 MODIFICARE 2: Salvăm adresa
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Formularul de redirect
    const html = `
      <form id="payForm" action="${paymentUrl}" method="post">
        <input type="hidden" name="env_key" value="${encrypted.env_key}" />
        <input type="hidden" name="data" value="${encrypted.data}" />
        <input type="hidden" name="cipher" value="${encrypted.cipher}" />
        <input type="hidden" name="iv" value="${encrypted.iv}" />
      </form>
      <script>document.getElementById('payForm').submit();</script>
    `;

    res.status(200).send(html);

  } catch (err: any) {
    console.error("Create Error:", err);
    res.status(500).json({ error: err.message });
  }
}