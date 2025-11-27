import nodemailer from "nodemailer";

// Definim structura adresei
type AdresaLivrare = {
  nume: string;
  prenume: string;
  telefon: string;
  email: string;
  adresa: string;
  oras: string;
  judet: string;
  codPostal: string;
};

// Actualizăm interfața pentru a accepta 'htmlContent'
interface EmailData {
  nume: string;
  email: string;
  adresa: string;
  produse: { titlu: string; pret: number }[];
  total: number;
  orderId: string;
  adresaLivrare?: AdresaLivrare;
  htmlContent?: string; // 👈 FIXUL ESTE AICI (Am adăugat acest câmp opțional)
}

export async function sendOrderConfirmation(data: EmailData) {
  const { nume, email, adresa, produse, total, orderId, adresaLivrare, htmlContent } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // LOGICĂ: Dacă primim HTML gata făcut (din IPN), îl folosim direct.
  // Dacă nu, generăm noi unul (fallback).
  let emailBody = htmlContent;

  if (!emailBody) {
    // Construim HTML-ul standard doar dacă nu am primit unul custom
    const detaliiLivrareHTML = adresaLivrare 
      ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #374151; margin-top: 0;">📍 Detalii Livrare</h3>
          <p><strong>Destinatar:</strong> ${adresaLivrare.nume} ${adresaLivrare.prenume}</p>
          <p><strong>Adresă:</strong> ${adresaLivrare.adresa}, ${adresaLivrare.oras}</p>
        </div>
      `
      : `<p><strong>Adresă:</strong> ${adresa}</p>`;

    emailBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #1e40af;">Salut, ${nume}!</h2>
        <p>Comanda ta <strong>#${orderId}</strong> a fost confirmată.</p>
        ${detaliiLivrareHTML}
        <h3>📦 Produse:</h3>
        <ul>
          ${produse.map(p => `<li>${p.titlu} - ${Number(p.pret).toFixed(2)} RON</li>`).join("")}
        </ul>
        <p><strong>Total: ${Number(total).toFixed(2)} RON</strong></p>
      </div>
    `;
  }

  try {
    await transporter.sendMail({
      from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmare comandă #${orderId}`,
      html: emailBody, // 👈 Folosim corpul final
    });
    console.log(`Email trimis cu succes către ${email}`);
    return true;
  } catch (error) {
    console.error("Eroare la trimiterea emailului:", error);
    return false;
  }
}