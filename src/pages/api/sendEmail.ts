import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { nume, email, adresa, produse, total } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
     user: process.env.EMAIL_USER!,
     pass: process.env.EMAIL_PASS!,
    }
  });

  const emailContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #fafafa;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://i.imgur.com/Pq1P8IU.jpeg" alt="TricouriFotbal Logo" style="max-height: 90px;" />
    </div>

    <h2 style="color: #1e40af;">Salut, ${nume}!</h2>
    <p style="font-size: 16px;">Îți mulțumim pentru comanda ta! Iată un rezumat complet:</p>

    <h3 style="margin-top: 24px;">📦 Produse comandate:</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #e5e7eb;">
          <th align="left" style="padding: 8px;">Produs</th>
          <th align="right" style="padding: 8px;">Preț</th>
        </tr>
      </thead>
      <tbody>
        ${produse.map((p: any) => `
          <tr>
            <td style="padding: 8px 0;">${p.titlu}</td>
            <td align="right" style="padding: 8px 0;">${p.pret} RON</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <p style="font-size: 18px; margin-top: 20px;"><strong>Total:</strong> ${total} RON</p>

    <h3 style="margin-top: 20px;">📍 Adresă de livrare:</h3>
    <p style="line-height: 1.5; font-size: 15px;">${nume}<br/>${adresa}<br/>${email}</p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://tricourifotbal.ro/checkout" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Vezi comanda pe site
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center; border-top: 1px solid #ddd; padding-top: 12px;">
      TricouriFotbal – Tricouri autentice pentru fani adevărați ⚽<br/>
      <a href="https://tricourifotbal.ro" style="color: #2563eb; text-decoration: none;">tricourifotbal.ro</a>
    </p>
   </div>
  `;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // sau un email de test
      subject: "Confirmare comandă",
      html: emailContent,
    });

    res.status(200).json({ message: "Email trimis cu succes" });
  } catch (error) {
    console.error("Eroare la trimiterea emailului:", error);
    res.status(500).json({ message: "Eroare la trimiterea emailului" });
  }
}
