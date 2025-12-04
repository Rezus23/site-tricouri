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
  categorie?: string;
};

export default function Shop() {
  const [allProducts, setAllProducts] = useState<Produs[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState("all");

  // Lista categorii
  const categories = [
    { id: "all", label: "Toate" },
    { id: "tricouri", label: "Sezon 24/25" },
    { id: "retro", label: "Retro" },
    { id: "nationale", label: "Echipe Naționale" },
    { id: "sorturi", label: "Șorturi" },
  ];

  useEffect(() => {
    const fetchProduse = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => {
            const d = doc.data();
            let marimiFinale: MarimeStoc[] = [];
            if (Array.isArray(d.marimi)) {
                if (typeof d.marimi[0] === 'string') {
                    marimiFinale = d.marimi.map((m: string) => ({ nume: m, stoc: 99 }));
                } else {
                    marimiFinale = d.marimi;
                }
            }
            return { id: doc.id, ...d, marimi: marimiFinale };
        }) as Produs[];

        setAllProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Eroare:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduse();
  }, []);

  // Filtrare
  useEffect(() => {
    if (activeCategory === "all") {
        setFilteredProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.categorie === activeCategory);
        setFilteredProducts(filtered);
    }
  }, [activeCategory, allProducts]);

  // 👇 FUNCȚIA NOUĂ DE TOGGLE
  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId && categoryId !== "all") {
        // Dacă apăsăm pe categoria deja activă (și nu e "Toate"), o dezactivăm -> Revine la "Toate"
        setActiveCategory("all");
    } else {
        // Altfel, o activăm pe cea nouă
        setActiveCategory(categoryId);
    }
  };

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
        <h1 className="text-5xl font-extrabold text-center mb-8 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          Magazin Tricouri
        </h1>

        {/* FILTRE (CATEGORII) */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)} // 👈 Folosim funcția nouă
                    className={`px-6 py-2 rounded-full font-bold transition-all duration-300 shadow-lg border 
                        ${activeCategory === cat.id 
                            ? "bg-white text-black border-white scale-105" 
                            : "bg-black/50 text-gray-300 border-white/20 hover:bg-black/80 hover:text-white"
                        }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center mt-10 p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-xl max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
            <div className="text-4xl mb-4">🤔</div>
            <h3 className="text-xl text-gray-900 font-bold mb-2">Nu am găsit produse aici.</h3>
            <p className="text-gray-600 mb-6">Momentan nu avem produse în categoria selectată.</p>
            <div className="border-t pt-6">
                <Link href="/contact" className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
                    Contactează-ne
                </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((produs) => {
              const img1 = produs.imagini?.[0] || produs.imagine || "/images/logo.jpg";
              const img2 = (produs.imagini && produs.imagini.length > 1) ? produs.imagini[1] : null;
              const totalStoc = produs.marimi?.reduce((acc, m) => acc + m.stoc, 0) ?? 0;
              const isSoldOut = produs.marimi && produs.marimi.length > 0 && totalStoc <= 0;

              return (
                <div
                  key={produs.id}
                  className={`bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden flex flex-col group
                    ${isSoldOut ? "opacity-90" : "hover:shadow-2xl hover:-translate-y-2"} 
                  `}
                >
                  <Link href={`/magazin/${produs.id}`} className="block relative h-72 bg-gray-50 overflow-hidden">
                    <img
                      src={img1}
                      alt={produs.titlu}
                      className={`absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-500 ${!isSoldOut && "group-hover:scale-110"} ${isSoldOut && "grayscale brightness-75"}`}
                    />
                    {img2 && !isSoldOut && (
                      <img
                        src={img2}
                        alt="spate"
                        className="absolute inset-0 w-full h-full object-contain p-6 bg-gray-50 transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-10"
                      />
                    )}
                    {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <span className="bg-white text-red-600 px-6 py-3 font-black text-2xl uppercase tracking-widest transform -rotate-12 shadow-2xl border-4 border-double border-red-600">
                                SOLD OUT
                            </span>
                        </div>
                    )}
                  </Link>

                  <div className="p-6 flex flex-col flex-grow text-center relative z-20 bg-white/95">
                    <Link href={`/magazin/${produs.id}`}>
                      <h3 className="font-bold text-xl text-gray-900 hover:text-blue-700 transition-colors mb-2 leading-tight">
                        {produs.titlu}
                      </h3>
                    </Link>
                    
                    {isSoldOut ? (
                        <p className="text-xl font-black text-red-600 uppercase tracking-wider mt-auto">
                            Stoc Epuizat
                        </p>
                    ) : (
                        <p className="text-2xl font-extrabold text-gray-900 mt-auto tracking-tight flex items-baseline justify-center gap-1">
                            {produs.pret}
                            <span className="text-xs font-medium text-gray-500 uppercase">RON</span>
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