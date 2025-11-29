import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import BlurredBackground from "@/components/BlurredBackground";

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
      <BlurredBackground />

      <div className="max-w-7xl mx-auto p-6 relative z-10 pt-10">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Magazin Tricouri
        </h1>

        {produse.length === 0 ? (
          <div className="text-center mt-20 p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl max-w-md mx-auto">
            <p className="text-xl text-gray-600 font-semibold">Nu există produse momentan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {produse.map((produs) => {
              
              // 1. Pregătim imaginile
              // img1: Imaginea principală (mereu vizibilă sub)
              const img1 = produs.imagini?.[0] || produs.imagine || "/images/logo.jpg";
              
              // img2: Imaginea secundară (doar dacă există, altfel null)
              const img2 = (produs.imagini && produs.imagini.length > 1) ? produs.imagini[1] : null;

              return (
                <div
                  key={produs.id}
                  // 'group' este esențial aici pentru hover
                  className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col group"
                >
                  {/* ZONA DE IMAGINE */}
                  <Link href={`/magazin/${produs.id}`} className="block relative h-72 bg-gray-50 overflow-hidden">
                    
                    {/* --- IMAGINEA 1 (Baza) --- */}
                    <img
                      src={img1}
                      alt={produs.titlu}
                      className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-500"
                    />

                    {/* --- IMAGINEA 2 (Overlay la Hover) --- */}
                    {/* O randăm doar dacă există. Are opacity-0 standard și opacity-100 la hover */}
                    {img2 && (
                      <img
                        src={img2}
                        alt={`${produs.titlu} spate`}
                        className="absolute inset-0 w-full h-full object-contain p-6 bg-gray-50 transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-10"
                      />
                    )}
                  </Link>

                  {/* DETALII */}
                  <div className="p-6 flex flex-col flex-grow text-center relative z-20 bg-white/95">
                    <Link href={`/magazin/${produs.id}`}>
                      <h3 className="font-bold text-xl text-gray-900 hover:text-blue-700 transition-colors mb-2 leading-tight">
                        {produs.titlu}
                      </h3>
                    </Link>
                    
                    <p className="text-2xl font-extrabold text-blue-600">
                      {produs.pret} RON
                    </p>
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