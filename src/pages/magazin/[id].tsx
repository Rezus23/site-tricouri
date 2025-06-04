import { useRouter } from "next/router";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const produse = [
  { id: 1, titlu: "Tricou Real Madrid", pret: "129.99", descriere: "Tricou oficial Real Madrid, sezon 2024/25." },
  { id: 2, titlu: "Tricou FC Barcelona", pret: "124.99", descriere: "Tricou oficial FC Barcelona, ediție limitată." },
  { id: 3, titlu: "Tricou Manchester City", pret: "139.99", descriere: "Tricou original Manchester City, 2024." },
  { id: 4, titlu: "Tricou PSG", pret: "119.99", descriere: "Tricou PSG cu design exclusiv." },
  { id: 5, titlu: "Tricou Juventus", pret: "109.99", descriere: "Tricou Juventus alb-negru, ediție fan." },
];

export default function DetaliiProdus() {
  const router = useRouter();
  const { id } = router.query;
  const { adaugaInCos } = useCart();

  const produs = produse.find((p) => p.id === Number(id));

  if (!produs) return <div className="text-center mt-10 text-red-600">Produsul nu a fost găsit.</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{produs.titlu}</h1>
      <p className="text-gray-700 mb-2">{produs.descriere}</p>
      <p className="text-xl font-semibold mb-4">{produs.pret} RON</p>

      <button
        onClick={() => adaugaInCos({ ...produs, pret: Number(produs.pret) })}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
      >
        Adaugă în coș
      </button>

      <div className="mt-6">
        <Link href="/shop">
          <span className="text-blue-600 hover:underline">← Înapoi la magazin</span>
        </Link>
      </div>
    </div>
  );
}