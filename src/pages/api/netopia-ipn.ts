import type { NextApiRequest, NextApiResponse } from "next";
import { encrypt } from "@/lib/mobilpay/encrypt"; // Asigură-te că importul e corect
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
  } catch (e) { console.error("Firebase Init Error:", e); }
}
const db = getFirestore();

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
    const { amount, details, produse, email } = req.body; // <--- Preluăm EMAIL

    // Validări simple
    if (!amount || amount <= 0) return res.status(400).json({ error: "Suma incorectă" });
    
    // Dacă nu avem email, punem unul dummy ca să nu crape baza de date, dar ideal e să fie obligatoriu
    const userEmail = email || "client-fara-email@test.com";

    const signature = process.env.MOBILPAY_SIGNATURE;
    if (!signature) return res.status(500).json({ error: "Missing Signature" });

    const siteUrl = process.env.SITE_URL || "https://site-tricouri.vercel.app";
    const confirmUrl = `${siteUrl}/api/netopia-ipn`;
    const returnUrl = `${siteUrl}/succes`;

    const orderId = `ORD-${Date.now()}`;
    const timestamp = formatTimestamp(new Date());

    // Construire XML
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
        </contact>
      </invoice>
    </order>`.trim();

    // Criptare
    const encrypted = encrypt(xml);

    // 💾 SALVARE ÎN FIREBASE (AICI ERA PROBLEMA)
    // Trebuie să salvăm explicit câmpul "email" ca să îl putem citi mai târziu în IPN
    await db.collection("orders").doc(orderId).set({
      orderId,
      amount: Number(amount),
      email: userEmail, // <--- CRITIC: Salvăm emailul în bază!
      details: details || "",
      currency: "RON",
      status: "pending",
      provider: "netopia",
      produse: produse || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Răspuns HTML Redirect
    const paymentUrl = "http://sandboxsecure.mobilpay.ro"; // sau https pentru prod
    
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