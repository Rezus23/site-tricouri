import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { produse, email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: produse.map((prod: any) => ({
        price_data: {
          currency: 'ron',
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

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err);
    return res.status(500).json({ error: 'Stripe session failed' });
  }
}