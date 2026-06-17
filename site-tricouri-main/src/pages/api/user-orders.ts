import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp, cert } from "firebase-admin/app";
// ... (init Firebase dacă nu e deja inițializat, vezi codul din netopia-create)

const db = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  // Preluăm ID-ul utilizatorului din query-ul URL
  const { userId } = req.query; 

  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ error: "User ID invalid." });
  }

  try {
    const ordersSnapshot = await db.collection("orders")
      .where("userId", "==", userId) // <--- Filtrare CRITICĂ
      .orderBy("createdAt", "desc")
      .get();

    const orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.orderId,
        data: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A',
        total: data.amount,
        status: data.status,
      };
    });

    return res.status(200).json({ orders });

  } catch (error) {
    console.error("Eroare la preluarea comenzilor:", error);
    return res.status(500).json({ error: "Eroare internă de server." });
  }
}