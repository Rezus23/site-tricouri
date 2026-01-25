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

// 2. Configurare Email (Nodemailer)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// --- HELPER 1: HTML PENTRU ADMIN (Formatul tău "Alertă Roșie") ---
const generateAdminHtml = (orderId: string, amount: number, produse: any[], adresa: any) => {
    const produseHTML = produse.map((p: any) => 
        `<li style="margin-bottom: 5px;">${p.titlu} (${p.marimeSelectata || p.marime}) - <strong>${p.pret} RON</strong></li>`
    ).join('');

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

    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 3px solid #0000ff; max-width: 600px; margin: auto;">
            <h2 style="color: #0000ff; margin-top: 0;">📦 COMANDĂ NOUĂ (RAMBURS) #${orderId}</h2>
            
            <p style="font-size: 18px;"><strong>Total de Încasat (La Curier):</strong> <span style="color: green;">${amount} RON</span></p>
            
            <h3 style="background-color: #333; color: white; padding: 5px 10px; margin-bottom: 0;">📦 Produse de trimis:</h3>
            <ul style="border: 1px solid #ddd; border-top: none; padding: 15px 15px 15px 35px; margin-top: 0;">
                ${produseHTML}
            </ul>

            <h3 style="background-color: #333; color: white; padding: 5px 10px; margin-bottom: 0; margin-top: 20px;">📍 Detalii Livrare (AWB):</h3>
            ${detaliiLivrareHTML}

            <p style="margin-top: 30px; font-size: 12px; color: #666;">Verifică Firebase pentru datele brute.</p>
        </div>
    `;
};

// --- HELPER 2: HTML PENTRU CLIENT (Formatul Profesional Clean) ---
const generateClientHtml = (orderId: string, produse: any[], adresa: any, financial: any) => {
    const { subtotal, costLivrare, discount, total } = financial;
    const produseHtml = produse.map((p: any) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;"><img src="${p.img}" alt="produs" style="width: 50px; border-radius: 5px;"></td>
            <td style="padding: 10px;">
                <p style="margin:0; font-weight:bold;">${p.titlu}</p>
                <p style="margin:0; font-size:12px; color:#777;">Mărime: ${p.marimeSelectata || p.marime}</p>
            </td>
            <td style="padding: 10px; text-align:right;">${p.pret} RON</td>
        </tr>
    `).join('');

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #fff; border: 1px solid #eee;">
        <div style="background: #000; padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin:0;">PASSION4JERSEYS</h1>
            <p style="color: #ccc; margin:0;">Confirmare Comandă Ramburs</p>
        </div>
        <div style="padding: 20px;">
            <p>Salut <strong>${adresa.nume}</strong>,</p>
            <p>Comanda ta <strong>#${orderId}</strong> a fost înregistrată. Vei plăti suma de <strong>${total} RON</strong> la curier.</p>
            
            <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                <thead>
                    <tr style="background:#f9f9f9;"><th colspan="2" style="text-align:left; padding:10px;">Produs</th><th style="text-align:right; padding:10px;">Preț</th></tr>
                </thead>
                <tbody>${produseHtml}</tbody>
            </table>

            <div style="text-align:right; margin-top:20px; padding-top:10px; border-top:2px solid #000;">
                <p style="margin:5px 0;">Subtotal: ${subtotal.toFixed(2)} RON</p>
                <p style="margin:5px 0;">Livrare: ${costLivrare.toFixed(2)} RON</p>
                ${discount > 0 ? `<p style="margin:5px 0; color:green;">Discount: -${discount.toFixed(2)} RON</p>` : ''}
                <h3 style="margin:10px 0;">TOTAL: ${total.toFixed(2)} RON</h3>
            </div>

            <div style="background:#f9f9f9; padding:15px; margin-top:20px; border-radius:5px;">
                <p style="margin:0; font-weight:bold;">Adresa de livrare:</p>
                <p style="margin:5px 0; color:#555;">${adresa.adresa}, ${adresa.oras}, ${adresa.judet}</p>
                <p style="margin:0; color:#555;">Tel: ${adresa.telefon}</p>
            </div>
        </div>
    </div>`;
};

// --- HANDLER PRINCIPAL ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { orderId, amount, email, produse, adresaLivrare, userId, discount = 0, costLivrare = 15 } = req.body;
    
    // Calculăm subtotal pentru email
    const subtotal = produse.reduce((acc: number, p: any) => acc + Number(p.pret), 0);
    const financialData = { subtotal, costLivrare, discount, total: amount };

    // 1. Salvăm în Firebase
    await db.collection("orders").doc(orderId).set({
        orderId,
        amount,
        email,
        userId: userId || "guest",
        produse,
        adresaLivrare,
        status: "confirmed", // Confirmat direct pentru Ramburs
        metodaPlata: "ramburs",
        discount,
        paymentDate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Scădem Stocul
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

    // 3. Trimitem Email CLIENT (Design Clean)
    const htmlClient = generateClientHtml(orderId, produse, adresaLivrare, financialData);
    await transporter.sendMail({
        from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Confirmare Comandă #${orderId} - Ramburs`,
        html: htmlClient
    });

    // 4. Trimitem Email ADMIN (Formatul tău cu tabel și chenar)
    // Am schimbat doar culoarea chenarului în albastru (0000ff) ca să distingi rapid Ramburs vs Card (care e roșu)
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