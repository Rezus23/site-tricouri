// src/pages/api/netopia-ipn.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  console.log("IPN primit de la Netopia:", req.body);
  // TODO: decriptare env_key + data și update la Firestore

  return res
    .status(200)
    .send(
      `<?xml version="1.0" encoding="utf-8"?><crc error_type="0" error_code="0">OK</crc>`
    );
}
