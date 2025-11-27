import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import BlurredBackground from "@/components/BlurredBackground"; // 👈 IMPORT NOU

type Produs = {
  id: string;
  titlu: string;
  pret: number;
  imagine: string;    
  imagini?: string[]; 
  marimi?: string[];
};

export default function Shop() {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Loading State cu fundal
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <BlurredBackground />
        <p className="text-xl text-white font-bold drop-shadow-md animate-pulse">
          Se încarcă produsele...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* 1. FUNDAL BLURAT */}
      <BlurredBackground />

      <div className="max-w-7xl mx-auto p-6 relative z-10 pt-10">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Magazin Tricouri
        </h1>

        {produse.length === 0 ? (
          <div className="text-center mt-20 p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl max-w-md mx-auto">
            <p className="text-xl text-gray-600 font-semibold">Nu există produse momentan.</p>
            <p className="text-sm text-gray-500 mt-2">Revin-o curând pentru noutăți!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {produse.map((produs) => {
              
              // Logică imagine (prima din listă sau fallback)
              const imaginePrincipala = (produs.imagini && produs.imagini.length > 0) 
                  ? produs.imagini[0] 
                  : produs.imagine;

              return (
                <div
                  key={produs.id}
                  className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col"
                >
                  {/* 🎯 LINK PRINCIPAL (Click pe imagine) */}
                  <Link href={`/magazin/${produs.id}`} className="block relative h-72 bg-gray-50 group overflow-hidden">
                    <img
                      src={imaginePrincipala}
                      alt={produs.titlu}
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Badge "Vezi Detalii" la hover */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg text-sm">
                            Vezi Detalii
                        </span>
                    </div>
                  </Link>

                  {/* Detalii */}
                  <div className="p-6 flex flex-col flex-grow">
                    <Link href={`/magazin/${produs.id}`}>
                      <h3 className="font-bold text-xl text-gray-900 hover:text-blue-700 transition-colors mb-2 leading-tight">
                        {produs.titlu}
                      </h3>
                    </Link>
                    
                    <p className="text-2xl font-extrabold text-blue-600 mb-6">
                      {produs.pret} RON
                    </p>

                    {/* Buton către detalii */}
                    <Link
                      href={`/magazin/${produs.id}`}
                      className="mt-auto w-full bg-black text-white py-3 rounded-xl text-center font-bold hover:bg-gray-800 transition-colors active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      Vezi Detalii & Mărime 
                      <span className="text-lg">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}