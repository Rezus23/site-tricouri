// src/pages/api/netopia-create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { encrypt } from "@/lib/mobilpay/encrypt";

import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ----------------------
// TIPURI NECESARE
// ----------------------

type Product = {
  pret?: number;
  price?: number;
};

interface CreateOrderBody {
  amount?: number;
  details?: string;
  produse?: Product[];
}

// ----------------------
// FORMAT TIMESTAMP
// ----------------------
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

// ----------------------
// FIREBASE INIT
// ----------------------
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ----------------------
// HANDLER
// ----------------------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const body: CreateOrderBody = req.body;

    let amount = Number(body.amount);
    const details: string = body.details || "Comandă tricouri";

    // Dacă amount e invalid și avem produse → calculează totalul
    if ((!amount || amount <= 0) && Array.isArray(body.produse)) {
      amount = body.produse.reduce(
        (acc: number, p: Product) =>
          acc + Number(p.pret || p.price || 0),
        0
      );
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Sumă invalidă" });
    }

    const signature =
      process.env.MOBILPAY_SIGNATURE || process.env.NETOPIA_MERCHANT_ID;

    if (!signature) {
      console.error("Lipsește MOBILPAY_SIGNATURE / NETOPIA_MERCHANT_ID");
      return res
        .status(500)
        .json({ error: "Configurare Netopia incompletă (signature lipsă)" });
    }

    const siteUrl = process.env.SITE_URL || "https://site-tricouri.vercel.app";
    const confirmUrl = `${siteUrl}/api/netopia-ipn`;
    const returnUrl = `${siteUrl}/succes`;

    const envBase =
      process.env.NETOPIA_ENV === "live"
        ? "https://secure.mobilpay.ro"
        : "https://sandboxsecure.mobilpay.ro";

    const paymentUrl = `${envBase}`;
    const orderId = `ORD-${Date.now()}`;
    const timestamp = formatTimestamp(new Date());

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <order type="card" id="${orderId}" timestamp="${timestamp}">
      <signature>${signature}</signature>
      <url>
        <confirm>${confirmUrl}</confirm>
        <return>${returnUrl}</return>
      </url>
      <invoice currency="RON" amount="${amount.toFixed(2)}">
        <details>${details}</details>
      </invoice>
    </order>`.trim();

    const encrypted = encrypt(xml);

    await db.collection("orders").doc(orderId).set({
      orderId,
      amount,
      currency: "RON",
      status: "pending",
      provider: "netopia",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const html = `
      <!DOCTYPE html>
      <html lang="ro">
      <head>
        <meta charset="utf-8" />
        <title>Redirecționare către plată</title>
      </head>
      <body>
        <p>Te redirecționăm către Netopia...</p>
        <form id="mobilpay" action="${paymentUrl}" method="post">
          <input type="hidden" name="env_key" value="${encrypted.env_key}" />
          <input type="hidden" name="data" value="${encrypted.data}" />
          <input type="hidden" name="iv" value="${encrypted.iv}" />
          <input type="hidden" name="cipher" value="${encrypted.cipher}" />
        </form>
        <script>
          document.getElementById('mobilpay').submit();
        </script>
      </body>
      </html>
    `.trim();

    res.status(200).send(html);
  } catch (err) {
    console.error("MobilPay create error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Eroare internă",
    });
  }
}
