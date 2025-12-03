import type { NextApiRequest, NextApiResponse } from "next";
import { encrypt } from "@/lib/mobilpay/encrypt";
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// --- 1. Inițializare Firebase ---
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
try { db.settings({ ignoreUndefinedProperties: true }); } catch (e) {}

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
    // 1. Preluăm datele din Frontend
    const { amount, details, produse, email, userId, adresaLivrare } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: "Suma incorectă" });
    
    // Setări de bază
    const userEmail = email || "client-fara-email@test.com";
    const signature = process.env.MOBILPAY_SIGNATURE;
    
    if (!signature) {
        console.error("Lipsește MOBILPAY_SIGNATURE");
        return res.status(500).json({ error: "Configurare server incompletă" });
    }

    // --- 2. CONFIGURARE URL-uri (CRITIC PENTRU VERCEL) ---
    // Folosim hardcodat domeniul TĂU final cu WWW pentru a evita redirect-urile 308
    const siteUrl = "https://www.passion4jerseys.ro"; 
    
    const confirmUrl = `${siteUrl}/api/netopia-ipn`;
    const returnUrl = `${siteUrl}/succes`;

    const orderId = `ORD-${Date.now()}`;
    const timestamp = formatTimestamp(new Date());

    // --- 3. DETECTARE MEDIU (LIVE vs SANDBOX) ---
    // Dacă variabila NETOPIA_ENV este 'live', folosim serverul real. Altfel, sandbox.
    const isLive = process.env.NETOPIA_ENV === "live";
    const paymentUrl = "https://secure.mobilpay.ro"

    console.log(`🚀 Inițiere plată [${isLive ? 'LIVE' : 'SANDBOX'}] către: ${paymentUrl}`);
    console.log(`👉 Confirm URL: ${confirmUrl}`);

    // --- 4. CONSTRUIRE XML ---
    // Netopia cere datele de facturare (billing) și livrare (shipping)
    // Le completăm cu datele din adresaLivrare
    const nume = adresaLivrare?.nume || "Client";
    const prenume = adresaLivrare?.prenume || "Test";
    const telefon = adresaLivrare?.telefon || "";
    const adresaStr = `${adresaLivrare?.adresa || ''}, ${adresaLivrare?.oras || ''}, ${adresaLivrare?.judet || ''}`;

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <order type="card" id="${orderId}" timestamp="${timestamp}">
      <signature>${signature}</signature>
      <url>
        <confirm>${confirmUrl}</confirm>
        <return>${returnUrl}</return>
      </url>
      <invoice currency="RON" amount="${Number(amount).toFixed(2)}">
        <details>${details || "Comanda Passion4Jerseys"}</details>
        <contact>
            <info>${userEmail}</info>
            <mobile>${telefon}</mobile>
        </contact>
        <billing type="person">
            <first_name>${prenume}</first_name>
            <last_name>${nume}</last_name>
            <address>${adresaStr}</address>
            <email>${userEmail}</email>
            <mobile_phone>${telefon}</mobile_phone>
        </billing>
        <shipping>
            <first_name>${prenume}</first_name>
            <last_name>${nume}</last_name>
            <address>${adresaStr}</address>
            <email>${userEmail}</email>
            <mobile_phone>${telefon}</mobile_phone>
        </shipping>
      </invoice>
    </order>`.trim();

    // 5. Criptare
    const encrypted = encrypt(xml);

    // 6. Salvare în Firebase
    await db.collection("orders").doc(orderId).set({
      orderId,
      amount: Number(amount),
      email: userEmail,
      details: details || "",
      currency: "RON",
      status: "pending",
      provider: "netopia",
      env: isLive ? "live" : "sandbox", // Ca să știm cum a fost creată
      produse: produse || [],
      userId: userId || null, 
      adresaLivrare: adresaLivrare || null, 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 7. Generare Formular HTML Auto-Submit
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Redirecționare plată...</title></head>
      <body>
        <p style="text-align:center; margin-top: 50px;">Te redirecționăm către Netopia Payments...</p>
        <form id="payForm" action="${paymentUrl}" method="post">
          <input type="hidden" name="env_key" value="${encrypted.env_key}" />
          <input type="hidden" name="data" value="${encrypted.data}" />
          <input type="hidden" name="cipher" value="${encrypted.cipher}" />
          <input type="hidden" name="iv" value="${encrypted.iv}" />
        </form>
        <script>document.getElementById('payForm').submit();</script>
      </body>
      </html>
    `;

    res.status(200).send(html);

  } catch (err: any) {
    console.error("Create Error:", err);
    res.status(500).json({ error: err.message });
  }
}