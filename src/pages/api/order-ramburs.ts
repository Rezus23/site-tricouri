import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer"; // 👈 Folosim Nodemailer (pe care îl ai deja)

// 1. Init Firebase
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

// 2. Configurare Transport Email (Gmail/SMTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Asigură-te că ai asta în .env.local
        pass: process.env.EMAIL_PASS, // Asigură-te că ai asta în .env.local
    },
});

// 3. Funcție Scădere Stoc
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

  try {
    const { orderId, amount, email, produse, adresaLivrare, userId } = req.body;

    // A. Salvăm Comanda în Firebase
    await db.collection("orders").doc(orderId).set({
        orderId,
        amount,
        email,
        userId: userId || "guest",
        produse,
        adresaLivrare,
        status: "confirmed", // Status confirmat direct (nu așteptăm plată)
        metodaPlata: "ramburs",
        paymentDate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // B. Scădem Stocul
    await updateProductStock(produse);

    // C. Trimitem Email Client (Confirmare)
    await transporter.sendMail({
        from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Confirmare Comandă #${orderId} - Ramburs`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #000;">Salut ${adresaLivrare.nume},</h1>
            <p>Comanda ta a fost înregistrată cu succes!</p>
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
                <p><strong>Metodă de plată:</strong> Ramburs (Plata la curier)</p>
                <p><strong>Total de plată:</strong> ${amount} RON</p>
                <p><strong>ID Comandă:</strong> ${orderId}</p>
            </div>
            <h3>Produse comandate:</h3>
            <ul>${produse.map((p:any) => `<li>${p.titlu} (${p.marimeSelectata || p.marime})</li>`).join('')}</ul>
            <br/>
            <p>Vei fi contactat de curier pentru livrare.</p>
          </div>
        `
    });

    // D. Trimitem Email Admin (Notificare ție)
    // Putem refolosi logica simplă aici sau poți importa funcția din netopia-ipn dacă o exporți
    const adminBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 3px solid #0000ff; max-width: 600px;">
            <h2 style="color: #0000ff;">📦 COMANDĂ NOUĂ (RAMBURS) #${orderId}</h2>
            <p><strong>Total de încasat:</strong> ${amount} RON</p>
            <p><strong>Client:</strong> ${adresaLivrare.nume} ${adresaLivrare.prenume}</p>
            ${adresaLivrare.detalii ? `<p style="background:yellow"><strong>Notă client:</strong> ${adresaLivrare.detalii}</p>` : ''}
            <hr/>
            <p>Vezi detalii complete în Firebase.</p>
        </div>
    `;

    await transporter.sendMail({
        from: `"Site Orders" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Îți trimite ție
        subject: `[RAMBURS] Comandă Nouă #${orderId} - ${amount} RON`,
        html: adminBody,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Eroare comanda ramburs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}