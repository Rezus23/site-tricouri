import nodemailer from "nodemailer";

// 1. Actualizăm interfața pentru a accepta 'htmlContent' opțional
interface EmailData {
  nume: string;
  email: string;
  adresa: string;
  produse: { titlu: string; pret: number }[];
  total: number;
  orderId: string;
  htmlContent?: string; // 👈 FIX: Am adăugat acest câmp opțional (?)
}

export async function sendOrderConfirmation(data: EmailData) {
  // Extragem și htmlContent
  const { nume, email, adresa, produse, total, orderId, htmlContent } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Logică: Dacă primim HTML gata făcut (de la IPN), îl folosim.
  // Altfel, generăm noi unul simplu (fallback).
  let finalBody = htmlContent;

  if (!finalBody) {
    // Fallback: Generare HTML standard dacă nu primim unul custom
    finalBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <h2 style="color: #1e40af;">Salut, ${nume}!</h2>
        <p>Îți mulțumim pentru comanda ta #${orderId}!</p>
        
        <h3>Produse:</h3>
        <ul>
          ${produse.map(p => `<li>${p.titlu} - ${p.pret} RON</li>`).join("")}
        </ul>
        
        <p><strong>Total: ${total} RON</strong></p>
        <p>Adresa: ${adresa}</p>
      </div>
    `;
  }

  try {
    await transporter.sendMail({
      from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmare comandă #${orderId}`,
      html: finalBody, // 👈 Folosim corpul final (cel cu adresa)
    });
    console.log(`Email trimis cu succes către ${email}`);
    return true;
  } catch (error) {
    console.error("Eroare la trimiterea emailului:", error);
    return false;
  }
}