import nodemailer from "nodemailer";

// 1. Definim structura adresei (Asta lipsea sau nu era recunoscută)
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

// 2. Actualizăm interfața principală
interface EmailData {
  nume: string;
  email: string;
  adresa: string;
  produse: { titlu: string; pret: number }[];
  total: number;
  orderId: string;
  adresaLivrare?: AdresaLivrare; // 👈 AICI ESTE FIX-UL CRITIC (opțional cu ?)
}

export async function sendOrderConfirmation(data: EmailData) {
  const { nume, email, adresa, produse, total, orderId, adresaLivrare } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Construim HTML-ul pentru adresa detaliată
  const detaliiLivrareHTML = adresaLivrare 
    ? `
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #e5e7eb;">
        <h3 style="color: #374151; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">📍 Detalii Livrare</h3>
        <p style="margin: 3px 0;"><strong>Destinatar:</strong> ${adresaLivrare.nume} ${adresaLivrare.prenume}</p>
        <p style="margin: 3px 0;"><strong>Telefon:</strong> ${adresaLivrare.telefon}</p>
        <p style="margin: 3px 0;"><strong>Adresă:</strong> ${adresaLivrare.adresa}</p>
        <p style="margin: 3px 0;"><strong>Oraș/Județ:</strong> ${adresaLivrare.oras}, ${adresaLivrare.judet} ${adresaLivrare.codPostal ? `(${adresaLivrare.codPostal})` : ''}</p>
      </div>
    `
    : `<p style="margin-top: 10px;"><strong>Adresă:</strong> ${adresa}</p>`;

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
         <h2 style="color: #1e40af;">Salut, ${nume}!</h2>
         <p style="font-size: 16px; color: #4b5563;">Comanda ta <strong>#${orderId}</strong> a fost confirmată cu succes.</p>
      </div>

      ${detaliiLivrareHTML}

      <h3 style="margin-top: 24px; color: #111827;">📦 Produse comandate:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #e5e7eb;">
            <th align="left" style="padding: 10px; border-bottom: 2px solid #ccc;">Produs</th>
            <th align="right" style="padding: 10px; border-bottom: 2px solid #ccc;">Preț</th>
          </tr>
        </thead>
        <tbody>
          ${produse.map(p => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${p.titlu}</td>
              <td align="right" style="padding: 10px 0; border-bottom: 1px solid #eee;">${Number(p.pret).toFixed(2)} RON</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px;">
        <p style="font-size: 18px; font-weight: bold; color: #1e40af;">Total: ${Number(total).toFixed(2)} RON</p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #6b7280; font-size: 12px;">
        <p>Mulțumim că ai ales Passion4Jerseys!</p>
        <a href="https://passion4jerseys.ro" style="color: #2563eb; text-decoration: none;">Vizitează site-ul</a>
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