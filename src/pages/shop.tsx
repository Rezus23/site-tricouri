import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import BlurredBackground from "@/components/BlurredBackground";

type MarimeStoc = {
  nume: string;
  stoc: number;
};

type Produs = {
  id: string;
  titlu: string;
  pret: number;
  imagine: string;    
  imagini?: string[]; 
  marimi?: MarimeStoc[];
};

export default function Shop() {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduse = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => {
            const d = doc.data();
            
            // Compatibilitate mărimi
            let marimiFinale: MarimeStoc[] = [];
            if (Array.isArray(d.marimi)) {
                if (typeof d.marimi[0] === 'string') {
                    marimiFinale = d.marimi.map((m: string) => ({ nume: m, stoc: 99 }));
                } else {
                    marimiFinale = d.marimi;
                }
            }

            return {
                id: doc.id,
                ...d,
                marimi: marimiFinale
            };
        }) as Produs[];

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
          Catalog tricouri
        </h1>

        {produse.length === 0 ? (
          <div className="text-center mt-20 p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-xl max-w-md mx-auto">
            <p className="text-xl text-gray-600 font-semibold">Nu există produse momentan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {produse.map((produs) => {
              
              const img1 = produs.imagini?.[0] || produs.imagine || "/images/logo.jpg";
              const img2 = (produs.imagini && produs.imagini.length > 1) ? produs.imagini[1] : null;

              // 1. CALCUL STOC
              // Dacă produsul are mărimi definite, calculăm suma stocurilor.
              // Dacă nu are mărimi (produse vechi), considerăm că are stoc (0 la sumă, dar nu e marcat ca sold out).
              const totalStoc = produs.marimi?.reduce((acc, m) => acc + m.stoc, 0) ?? 0;
              
              // E sold out DOAR dacă are lista de mărimi definită ȘI suma e 0
              const isSoldOut = produs.marimi && produs.marimi.length > 0 && totalStoc <= 0;

              return (
                <div
                  key={produs.id}
                  className={`bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden flex flex-col group
                    ${isSoldOut ? "opacity-80" : "hover:shadow-2xl hover:-translate-y-2"} 
                  `}
                >
                  {/* ZONA IMAGINE */}
                  <Link href={`/magazin/${produs.id}`} className="block relative h-72 bg-gray-50 overflow-hidden">
                    <img
                      src={img1}
                      alt={produs.titlu}
                      className={`absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-500 ${!isSoldOut && "group-hover:scale-110"} ${isSoldOut && "grayscale"}`}
                    />
                    
                    {/* Hover image (doar dacă nu e sold out) */}
                    {img2 && !isSoldOut && (
                      <img
                        src={img2}
                        alt="spate"
                        className="absolute inset-0 w-full h-full object-contain p-6 bg-gray-50 transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-10"
                      />
                    )}

                    {/* Badge SOLD OUT pe imagine */}
                    {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                            <span className="text-white font-black text-xl tracking-widest border-4 border-white px-4 py-2 transform -rotate-12">
                                SOLD OUT
                            </span>
                        </div>
                    )}
                  </Link>

                  {/* DETALII */}
                  <div className="p-6 flex flex-col flex-grow text-center relative z-20 bg-white/95">
                    <Link href={`/magazin/${produs.id}`}>
                      <h3 className="font-bold text-xl text-gray-900 hover:text-blue-700 transition-colors mb-2 leading-tight">
                        {produs.titlu}
                      </h3>
                    </Link>
                    
                    {/* 2. LOGICA PREȚ vs SOLD OUT */}
                    {isSoldOut ? (
                        <p className="text-xl font-black text-red-600 uppercase tracking-wider mt-auto">

                        </p>
                    ) : (
                        <p className="text-2xl font-mono font-bold text-blue-600 mt-auto tracking-tight">
                          {produs.pret} RON
                        </p>
                    )}

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