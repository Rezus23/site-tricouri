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

// Interfața datelor
interface EmailData {
  nume: string; // Nume generic sau fallback
  email: string;
  adresa: string;
  produse: { titlu: string; pret: number }[];
  total: number;
  orderId: string;
  adresaLivrare?: AdresaLivrare;
  htmlContent?: string;
}

export async function sendOrderConfirmation(data: EmailData) {
  const { nume, email, produse, total, orderId, adresaLivrare, htmlContent } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 1. Determinăm numele complet pentru salut
  const salutNume = adresaLivrare 
    ? `${adresaLivrare.prenume} ${adresaLivrare.nume}` 
    : nume;

  // 2. Construim blocul HTML pentru adresă (Design curat)
  const detaliiLivrareHTML = adresaLivrare 
    ? `
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 10px;">📍 Detalii Livrare</h3>
        <p style="margin: 4px 0; color: #374151;"><strong>Destinatar:</strong> ${adresaLivrare.nume} ${adresaLivrare.prenume}</p>
        <p style="margin: 4px 0; color: #374151;"><strong>Adresă:</strong> ${adresaLivrare.adresa}</p>
        <p style="margin: 4px 0; color: #374151;"><strong>Oraș/Județ:</strong> ${adresaLivrare.oras}, ${adresaLivrare.judet} ${adresaLivrare.codPostal ? `(${adresaLivrare.codPostal})` : ''}</p>
        <p style="margin: 4px 0; color: #374151;"><strong>Telefon:</strong> ${adresaLivrare.telefon}</p>
      </div>
    `
    : `<p style="margin-top: 10px;"><strong>Adresă:</strong> ${data.adresa}</p>`;

  // 3. Construim template-ul final (Dacă nu primim HTML custom din IPN, folosim acesta)
  let emailBody = htmlContent;

  if (!emailBody) {
    emailBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        
        <div style="background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
           <img src="https://i.imgur.com/Pq1P8IU.jpeg" alt="TricouriFotbal Logo" style="max-height: 80px; width: auto;" />
        </div>

        <div style="padding: 30px;">
           <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Salut, ${salutNume}!</h2>
           <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
             Comanda ta <strong>#${orderId}</strong> a fost confirmată cu succes.
           </p>

           ${detaliiLivrareHTML}

           <h3 style="color: #111827; font-size: 16px; margin-top: 25px; margin-bottom: 10px;">📦 Produse comandate:</h3>
           <table style="width: 100%; border-collapse: collapse;">
             <thead>
               <tr style="background-color: #f3f4f6; text-align: left;">
                 <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; color: #374151; font-size: 14px;">Produs</th>
                 <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; color: #374151; font-size: 14px; text-align: right;">Preț</th>
               </tr>
             </thead>
             <tbody>
               ${produse.map(p => `
                 <tr>
                   <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #4b5563;">${p.titlu}</td>
                   <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: bold; text-align: right;">${Number(p.pret).toFixed(2)} RON</td>
                 </tr>
               `).join("")}
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
  }

  try {
    await transporter.sendMail({
      from: `"Passion4Jerseys" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmare comandă #${orderId}`,
      html: emailBody,
    });
    console.log(`Email trimis cu succes către ${email}`);
    return true;
  } catch (error) {
    console.error("Eroare la trimiterea emailului:", error);
    return false;
  }
}