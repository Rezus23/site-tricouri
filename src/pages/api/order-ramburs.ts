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

// --- HELPER 1: HTML PENTRU ADMIN (Formatul tău cu chenar) ---
const generateAdminHtml = (orderId: string, amount: number, produse: any[], adresa: any) => {
    const produseHTML = produse.map((p: any) => 
        `<li style="margin-bottom: 5px;">${p.titlu} (${p.marimeSelectata || p.marime}) - <strong>${p.pret} RON</strong></li>`
    ).join('');

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
            <h3 style="background-color: #333; color: white; padding: 5px 10px;">📦 Produse:</h3>
            <ul>${produseHTML}</ul>
            <h3 style="background-color: #333; color: white; padding: 5px 10px; margin-top: 20px;">📍 Detalii Livrare:</h3>
            ${detaliiLivrareHTML}
        </div>
    `;
};

// --- HELPER 2: HTML PENTRU CLIENT (REPLICĂ EXACTĂ POZA ATAȘATĂ) ---
const generateClientHtml = (orderId: string, produse: any[], adresa: any, financial: any) => {
    const { total } = financial;

    // Generăm rândurile tabelului de produse
    const produseHtml = produse.map((p: any) => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #555;">
                ${p.titlu} (${p.marimeSelectata || p.marime})
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">
                ${Number(p.pret).toFixed(2)} RON
            </td>
        </tr>
    `).join('');

    // Link logo (folosește un URL public valid către logo-ul tău dacă ai, altfel am pus un placeholder curat)
    // Recomand să urci logo-ul tău undeva (ex: imgur sau în public folder și să pui link-ul complet)
    const logoUrl = "public/images/logo.jpg";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { width: 80px; height: auto; }
            h2 { color: #000; font-size: 20px; margin-bottom: 10px; }
            .intro-text { color: #666; font-size: 14px; margin-bottom: 25px; line-height: 1.5; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 30px; background-color: #ffffff; }
            .section-title { font-weight: bold; font-size: 15px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; color: #000; }
            .info-row { margin-bottom: 5px; font-size: 14px; color: #444; }
            .info-label { font-weight: bold; color: #222; }
            .products-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .th-header { background-color: #f3f4f6; color: #4b5563; font-size: 13px; font-weight: bold; padding: 8px; text-align: left; }
            .th-header-right { text-align: right; }
            .total-section { margin-top: 15px; text-align: right; font-size: 18px; font-weight: bold; color: #000; }
            .footer { text-align: center; color: #9ca3af; font-size: 13px; margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                 <img src="${logoUrl}" alt="Passion4Jerseys" class="logo" style="display:block; margin: 0 auto 20px;">
            </div>

            <h2>Salut, ${adresa.nume} ${adresa.prenume}!</h2>
            <p class="intro-text">
                Comanda ta <strong>#${orderId}</strong> a fost confirmată cu succes.
            </p>

            <div class="card">
                <div class="section-title">
                    📍 Detalii Livrare
                </div>
                <div style="border-top: 1px solid #f0f0f0; margin-top: 10px; padding-top: 10px;">
                    <div class="info-row"><span class="info-label">Destinatar:</span> ${adresa.nume} ${adresa.prenume}</div>
                    <div class="info-row"><span class="info-label">Adresă:</span> ${adresa.adresa}</div>
                    <div class="info-row"><span class="info-label">Oraș/Județ:</span> ${adresa.oras}, ${adresa.judet} ${adresa.codPostal ? `(${adresa.codPostal})` : ''}</div>
                    <div class="info-row"><span class="info-label">Telefon:</span> ${adresa.telefon}</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div class="section-title">
                    📦 Produse comandate:
                </div>
                
                <table class="products-table">
                    <thead>
                        <tr>
                            <th class="th-header">Produs</th>
                            <th class="th-header th-header-right">Preț</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${produseHtml}
                    </tbody>
                </table>
                
                <div style="border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px;"></div>
                
                <div class="total-section">
                    Total: ${total.toFixed(2)} RON
                </div>
            </div>

            <div class="footer">
                Vă mulțumim și vă mai așteptăm pe site-ul nostru!
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

    // 1. Salvare Firebase
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

    // 2. Scădere Stoc
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

    // 3. Email Client (Design Nou)
    const htmlClient = generateClientHtml(orderId, produse, adresaLivrare, financialData);
    await transporter.sendMail({
        from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Confirmare Comandă #${orderId}`,
        html: htmlClient
    });

    // 4. Email Admin (Design Vechi)
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