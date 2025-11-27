import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

// Definim tipul produsului (Firebase returneaza ID string)
type Produs = {
  id: string;
  titlu: string;
  pret: number;
  imagine: string;
  marimi?: string[];
};

export default function Shop() {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);
  const { adaugaInCos } = useCart();

  useEffect(() => {
    const fetchProduse = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Produs[];

        setProduse(data);
      } catch (error) {
        console.error("Eroare la încărcarea produselor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduse();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Se încarcă produsele...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
        Magazin Tricouri
      </h1>

      {produse.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>Nu există produse momentan.</p>
          <p className="text-sm">Mergi în Admin Panel să adaugi primele tricouri!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {produse.map((produs) => (
            <div
              key={produs.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              {/* Imaginea */}
              <Link href={`/produs/${produs.id}`} className="block relative h-64 bg-gray-50">
                <img
                  src={produs.imagine}
                  alt={produs.titlu}
                  className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Detalii */}
              <div className="p-5 flex flex-col flex-grow">
                <Link href={`/produs/${produs.id}`}>
                  <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors mb-1">
                    {produs.titlu}
                  </h3>
                </Link>
                
                <p className="text-xl font-bold text-blue-600 mb-4">
                  {produs.pret} RON
                </p>

                {/* Mărimi */}
                {produs.marimi && produs.marimi.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {produs.marimi.map((marime) => (
                      <span key={marime} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {marime}
                      </span>
                    ))}
                  </div>
                )}

                {/* Buton Adaugă în Coș - FIX AICI */}
                <button
                  onClick={() => {
                    // ⚠️ FIX: Construim obiectul manual ca să evităm conflictul string vs number
                    adaugaInCos({ 
                        id: 0, // Trimitem un număr fictiv (contextul generează oricum cartId unic)
                        titlu: produs.titlu,
                        pret: produs.pret
                    });
                    alert(`✅ ${produs.titlu} adăugat în coș!`);
                  }}
                  className="mt-auto w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors active:scale-95"
                >
                  Adaugă în Coș
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}