// src/lib/email.ts
import nodemailer from "nodemailer";

interface EmailData {
  nume: string;
  email: string;
  adresa: string;
  produse: { titlu: string; pret: number }[];
  total: number;
  orderId: string;
}

export async function sendOrderConfirmation(data: EmailData) {
  const { nume, email, adresa, produse, total, orderId } = data;

  // Configurare Transporter (Gmail sau alt SMTP)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Atenție: Folosește App Password, nu parola contului!
    },
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #fafafa;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://i.imgur.com/Pq1P8IU.jpeg" alt="TricouriFotbal Logo" style="max-height: 90px;" />
      </div>

      <h2 style="color: #1e40af;">Salut, ${nume}!</h2>
      <p style="font-size: 16px;">Îți mulțumim pentru comanda ta! Plata a fost confirmată.</p>
      <p>ID Comandă: <strong>${orderId}</strong></p>

      <h3 style="margin-top: 24px;">📦 Produse comandate:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #e5e7eb;">
            <th align="left" style="padding: 8px;">Produs</th>
            <th align="right" style="padding: 8px;">Preț</th>
          </tr>
        </thead>
        <tbody>
          ${produse
            .map(
              (p) => `
            <tr>
              <td style="padding: 8px 0;">${p.titlu}</td>
              <td align="right" style="padding: 8px 0;">${p.pret} RON</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <p style="font-size: 18px; margin-top: 20px;"><strong>Total:</strong> ${total} RON</p>

      <h3 style="margin-top: 20px;">📍 Adresă de livrare:</h3>
      <p style="line-height: 1.5; font-size: 15px;">${adresa}</p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://site-tricouri.vercel.app" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Înapoi pe site
        </a>
      </div>
     </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmare comandă #${orderId}`,
      html: emailContent,
    });
    console.log(`Email trimis cu succes către ${email}`);
    return true;
  } catch (error) {
    console.error("Eroare la trimiterea emailului:", error);
    return false;
  }
}