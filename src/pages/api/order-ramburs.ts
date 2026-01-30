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

// 2. Configurare Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// --- HELPER 1: HTML PENTRU ADMIN (Rămâne cel cu chenar roz pentru tine) ---
const generateAdminHtml = (orderId: string, amount: number, produse: any[], adresa: any) => {
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
            <ul style="list-style: none; padding-left: 0;">
                ${produseHTML}
            </ul>
            <h3 style="background-color: #333; color: white; padding: 5px 10px; margin-top: 20px;">📍 Detalii Livrare:</h3>
            ${detaliiLivrareHTML}
        </div>
    `;
};

// --- HELPER 2: HTML PENTRU CLIENT (NOUL DESIGN CERUT DE TINE) ---
const generateClientHtml = (orderId: string, produse: any[], adresa: any, financial: any) => {
    const { total } = financial;
    
    // Numele pentru salut
    const salutNume = adresa ? `${adresa.prenume} ${adresa.nume}` : "Client";

    // Construim blocul de produse folosind designul tău, DAR adăugând Mărimea și Personalizarea
    const produseLinii = produse.map((p: any) => `
        <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">
                <span style="color: #111827; font-weight: 500;">${p.titlu}</span>
                <br/>
                <span style="font-size: 12px; color: #6b7280;">Mărime: ${p.marimeSelectata || p.marime}</span>
                ${p.personalizare ? `<br/><span style="font-size: 12px; color: #db2777; font-weight: bold;">✏️ Personalizare: ${p.personalizare}</span>` : ''}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold; text-align: right;">
                ${Number(p.pret).toFixed(2)} RON
            </td>
        </tr>
    `).join("");

    return `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        
        <div style="background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
           <img src="https://i.imgur.com/Pq1P8IU.jpeg" alt="Passion4Jerseys Logo" style="max-height: 80px; width: auto;" />
        </div>

        <div style="padding: 30px;">
           <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Salut, ${salutNume}!</h2>
           <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
             Comanda ta <strong>#${orderId}</strong> a fost confirmată cu succes.
           </p>

           <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #111827; margin-top: 0; font-size: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 10px;">📍 Detalii Livrare</h3>
            <p style="margin: 4px 0; color: #374151;"><strong>Destinatar:</strong> ${adresa.nume} ${adresa.prenume}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Adresă:</strong> ${adresa.adresa}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Oraș/Județ:</strong> ${adresa.oras}, ${adresa.judet} ${adresa.codPostal ? `(${adresa.codPostal})` : ''}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Telefon:</strong> ${adresa.telefon}</p>
           </div>

           <h3 style="color: #111827; font-size: 16px; margin-top: 25px; margin-bottom: 10px;">📦 Produse comandate:</h3>
           <table style="width: 100%; border-collapse: collapse;">
             <thead>
               <tr style="background-color: #f3f4f6; text-align: left;">
                 <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; color: #374151; font-size: 14px;">Produs</th>
                 <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; color: #374151; font-size: 14px; text-align: right;">Preț</th>
               </tr>
             </thead>
             <tbody>
               ${produseLinii}
             </tbody>
           </table>

           <div style="text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #f3f4f6;">
             <p style="font-size: 18px; color: #111827; margin: 0;">Total: <strong>${Number(total).toFixed(2)} RON</strong></p>
           </div>

           <div style="margin-top: 40px; text-align: center; color: #4b5563; font-size: 15px;">
             <p style="margin-bottom: 5px;">Vă mulțumim și vă mai așteptăm pe site-ul nostru!</p>
             <p style="margin-top: 0; color: #1d4ed8; font-weight: bold;">Echipa Passion4Jerseys</p>
           </div>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
          <a href="https://passion4jerseys.ro" style="color: #2563eb; text-decoration: none;">Vizitează magazinul online</a>
        </div>
       </div>
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
        produse, // Aici se salvează și personalizarea dacă vine din frontend
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

    // 3. Email Client (FOLOSIM NOUL DESIGN)
    const htmlClient = generateClientHtml(orderId, produse, adresaLivrare, financialData);
    await transporter.sendMail({
        from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Confirmare Comandă #${orderId}`,
        html: htmlClient
    });

    // 4. Email Admin (Chenar Roz pentru personalizare)
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