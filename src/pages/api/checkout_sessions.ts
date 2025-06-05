import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// ✅ Tipul pentru produs
interface Produs {
  titlu: string;
  pret: number | string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { produse, email }: { produse: Produs[]; email: string } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,

      // ✅ colectează adresă de livrare
      shipping_address_collection: {
        allowed_countries: ["RO"],
      },

      // ✅ opțiuni de livrare
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "FAN COURIER",
            type: "fixed_amount",
            fixed_amount: { amount: 3000, currency: "ron" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 3 },
            },
          },
        },
      ],

      line_items: produse.map((prod) => ({
        price_data: {
          currency: "ron",
          product_data: {
            name: prod.titlu,
          },
          unit_amount: Math.round(Number(prod.pret) * 100),
        },
        quantity: 1,
      })),

      success_url: `${req.headers.origin}/succes`,
      cancel_url: `${req.headers.origin}/checkout`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: "Eroare la sesiunea Stripe" });
  }
}