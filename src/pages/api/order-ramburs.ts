import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

// 1. Initializare Firebase
if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (e) { console.error("Firebase init error:", e); }
}
const db = getFirestore();

// 2. Configurare Email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// --- HELPER 1: HTML PENTRU ADMIN (MODIFICAT SĂ ARATE PERSONALIZAREA) ---
const generateAdminHtml = (orderId: string, amount: number, produse: any[], adresa: any) => {
    
    // 👇 AICI ESTE MODIFICAREA MAGICĂ
    const produseHTML = produse.map((p: any) => `
        <li style="margin-bottom: 15px; border-bottom: 1px dashed #ddd; padding-bottom: 10px;">
            <div style="font-size: 14px;">
                <strong>${p.titlu}</strong> 
                <span style="color: #666;">(Mărime: ${p.marimeSelectata || p.marime})</span>
            </div>
            <div style="font-weight: bold; color: #333;">${p.pret} RON</div>

            ${p.personalizare ? `
                <div style="
                    margin-top: 5px; 
                    background-color: #fff0f6; 
                    color: #c41d7f; 
                    border: 1px solid #ffadd2; 
                    padding: 5px 10px; 
                    border-radius: 4px; 
                    font-weight: bold;
                    display: inline-block;
                ">
                    ✏️ PERSONALIZARE: ${p.personalizare}
                </div>
            ` : ''}
        </li>
    `).join('');

    const detaliiLivrareHTML = adresa ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; background-color: #fff8f8; border: 1px solid #ffcccc;">
            <tr><td style="padding: 8px; font-weight: bold;">Nume Client:</td><td style="padding: 8px;">${adresa.nume} ${adresa.prenume}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Telefon:</td><td style="padding: 8px;"><a href="tel:${adresa.telefon}">${adresa.telefon}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${adresa.email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Adresă:</td><td style="padding: 8px;">${adresa.adresa}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Oraș/Județ:</td><td style="padding: 8px;">${adresa.oras}, ${adresa.judet} ${adresa.codPostal ? `(${adresa.codPostal})` : ''}</td></tr>
            ${adresa.detalii ? `<tr><td style="padding: 8px; font-weight: bold; background: #fff3cd;">📝 Detalii:</td><td style="padding: 8px; background: #fff3cd;">${adresa.detalii}</td></tr>` : ''}
        </table>
    ` : `<p style="color: red;">Adresa indisponibilă.</p>`;

    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 3px solid #0000ff; max-width: 600px; margin: auto;">
            <h2 style="color: #0000ff; margin-top: 0;">📦 COMANDĂ NOUĂ (RAMBURS) #${orderId}</h2>
            <p style="font-size: 18px;"><strong>Total de Încasat:</strong> <span style="color: green;">${amount} RON</span></p>
            
            <h3 style="background-color: #333; color: white; padding: 5px 10px;">📦 Produse de pregătit:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
                ${produseHTML}
            </ul>

            <h3 style="background-color: #333; color: white; padding: 5px 10px; margin-top: 20px;">📍 Detalii Livrare (AWB):</h3>
            ${detaliiLivrareHTML}
        </div>
    `;
};

// --- HELPER 2: HTML PENTRU CLIENT (Păstrăm designul clean) ---
const generateClientHtml = (orderId: string, produse: any[], adresa: any, financial: any) => {
    const { total } = financial;
    const logoUrl = "https://passion4jerseys.ro/favicon-nou.png"; 

    const produseHtml = produse.map((p: any) => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #555;">
                <span style="color: #000; font-weight: bold;">${p.titlu}</span> (${p.marimeSelectata || p.marime})
                ${p.personalizare ? `<br/><span style="color: #d63384; font-size: 13px;">Text Custom: ${p.personalizare}</span>` : ''}
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">
                ${Number(p.pret).toFixed(2)} RON
            </td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                 <img src="${logoUrl}" alt="Passion4Jerseys" style="width: 80px; display:block; margin: 0 auto 20px;">
            </div>
            <h2 style="color: #000;">Salut, ${adresa.nume}!</h2>
            <p style="color: #666;">Comanda ta <strong>#${orderId}</strong> a fost confirmată.</p>
            
            <div style="border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <div style="font-weight: bold; margin-bottom: 10px;">📍 Livrare la:</div>
                <div style="color: #444;">${adresa.adresa}, ${adresa.oras}, ${adresa.judet}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f9f9f9;"><th style="text-align: left; padding: 8px;">Produs</th><th style="text-align: right; padding: 8px;">Preț</th></tr>
                </thead>
                <tbody>${produseHtml}</tbody>
            </table>
            
            <div style="text-align: right; margin-top: 15px; font-size: 18px; font-weight: bold;">
                Total: ${total.toFixed(2)} RON
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- HANDLER PRINCIPAL ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { orderId, amount, email, produse, adresaLivrare, userId, discount = 0, costLivrare = 15 } = req.body;
    
    // Calculăm datele financiare
    const subtotal = produse.reduce((acc: number, p: any) => acc + Number(p.pret), 0);
    const financialData = { subtotal, costLivrare, discount, total: amount };

    // 1. Salvare Firebase (Aici deja merge bine)
    await db.collection("orders").doc(orderId).set({
        orderId,
        amount,
        email,
        userId: userId || "guest",
        produse,
        adresaLivrare,
        status: "confirmed",
        metodaPlata: "ramburs",
        discount,
        paymentDate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Scădere Stoc (Neschimbat)
    for (const item of produse) {
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
          if (stocModificat) t.update(productRef, { marimi: marimiActualizate });
        });
    }

    // 3. Email Client
    const htmlClient = generateClientHtml(orderId, produse, adresaLivrare, financialData);
    await transporter.sendMail({
        from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Confirmare Comandă #${orderId}`,
        html: htmlClient
    });

    // 4. Email Admin (Folosind funcția nouă cu personalizare)
    const htmlAdmin = generateAdminHtml(orderId, amount, produse, adresaLivrare);
    await transporter.sendMail({
        from: `"Site Orders" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `[RAMBURS] Comandă #${orderId} - ${amount} RON`,
        html: htmlAdmin,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Eroare comanda ramburs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}