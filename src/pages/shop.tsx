import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import BlurredBackground from "@/components/BlurredBackground";
import { FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/router";
import { FaFire } from "react-icons/fa"; // 👈 IMPORT NOU PENTRU ICONIȚĂ

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
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Produs[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    { id: "all", label: "Toate Produsele" },
    { id: "tricouri", label: "Sezon 25/26" },
    { id: "retro", label: "Retro" },
    { id: "nationale", label: "Echipe Naționale" },
    { id: "custom", label: "Precomandă" }, // ID-ul este 'custom'
  ];

  // 1. FETCH PRODUSE
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
      } catch (error) {
        console.error("Eroare:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduse();
  }, []);

  // 2. DETECTARE URL PARAMETER
  useEffect(() => {
    if (router.isReady) {
        const urlCategory = router.query.categorie as string;
        if (urlCategory && categories.some(c => c.id === urlCategory)) {
            setActiveCategory(urlCategory);
        } else {
            setActiveCategory("all");
        }
    }
  }, [router.isReady, router.query]);

  // 3. LOGICA DE FILTRARE
  useEffect(() => {
    if (allProducts.length === 0) return;

    if (activeCategory === "all") {
        const filtered = allProducts.filter(p => p.categorie !== "custom");
        setFilteredProducts(filtered);
    } else {
        const filtered = allProducts.filter(p => p.categorie === activeCategory);
        setFilteredProducts(filtered);
    }
  }, [activeCategory, allProducts]);

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsDropdownOpen(false);
    
    router.push({
        pathname: '/shop',
        query: categoryId === 'all' ? {} : { categorie: categoryId }
    }, undefined, { shallow: true });
  };

  const currentLabel = categories.find(c => c.id === activeCategory)?.label || "Toate Produsele";

  // --- HELPER: Funcție pentru a randa un card de produs (pentru a nu duplica codul HTML) ---
  const renderCard = (produs: Produs) => {
    const img1 = produs.imagini?.[0] || produs.imagine || "/images/logo.jpg";
    const img2 = (produs.imagini && produs.imagini.length > 1) ? produs.imagini[1] : null;
    const totalStoc = produs.marimi?.reduce((acc, m) => acc + m.stoc, 0) ?? 0;
    const isSoldOut = produs.marimi && produs.marimi.length > 0 && totalStoc <= 0;

    return (
        <div key={produs.id} className="group relative bg-white rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] hover:-translate-y-2">
            <Link href={`/magazin/${produs.id}`} className="block relative aspect-[4/5] bg-[#f4f4f5] overflow-hidden">
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest text-gray-900 shadow-sm border border-gray-100">
                    {produs.categorie === 'tricouri' ? '25/26' : (produs.categorie || "Oficial")}
                </span>
            </div>

            <img
                src={img1}
                alt={produs.titlu}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out 
                ${!isSoldOut && "group-hover:scale-105"} 
                ${isSoldOut && "grayscale opacity-60"}`}
            />
            
            {img2 && !isSoldOut && (
                <img src={img2} alt="spate" className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
            )}

            {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/10">
                    <span className="bg-red-600 text-white px-4 py-2 font-black text-lg uppercase tracking-widest transform -rotate-12 shadow-xl border-2 border-white">
                        Sold Out
                    </span>
                </div>
            )}

            {!isSoldOut && (
                <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button className="w-full bg-white text-black font-bold py-3 rounded-xl shadow-xl hover:bg-black hover:text-white transition-colors text-xs uppercase tracking-widest">
                        Vezi Detalii
                    </button>
                </div>
            )}
            </Link>

            <div className="p-5 bg-white relative z-10">
            <div className="flex justify-between items-start gap-4 mb-1">
                <Link href={`/magazin/${produs.id}`}>
                    <h3 className="font-bold text-md text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 uppercase">
                        {produs.titlu}
                    </h3>
                </Link>
                <p className="font-black text-lg text-gray-900 whitespace-nowrap">
                    {produs.pret} <span className="text-[10px] text-gray-500 align-top font-normal">RON</span>
                </p>
            </div>
            
            {isSoldOut ? (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-2">Stoc Epuizat</p>
            ) : (
                <div className="flex items-center gap-1 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">În Stoc</p>
                </div>
            )}
            </div>
        </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-black">
        <BlurredBackground />
        <p className="text-xl text-white font-bold drop-shadow-md animate-pulse">
          Se încarcă colecția...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0a0a0a]">
      <BlurredBackground />

      <div className="max-w-[1400px] mx-auto p-6 relative z-10 pt-10">
        <h1 className="text-5xl md:text-7xl font-black text-center mb-8 text-white tracking-tighter drop-shadow-xl uppercase">
          Descoperirea pasiunii tale începe <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">AICI</span>
        </h1>

        {/* DROPDOWN MENU */}
        <div className="relative flex justify-center mb-16 z-50">
            <div className="relative inline-block text-left w-72">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between w-full px-6 py-4 bg-white/95 backdrop-blur-md text-gray-900 font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white transition-all duration-300 border border-white/20 uppercase tracking-wide group"
                >
                    {currentLabel}
                    <FiChevronDown className={`text-xl transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 origin-top">
                        <div className="py-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleSelectCategory(cat.id)}
                                    className={`block w-full text-left px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors
                                        ${activeCategory === cat.id 
                                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600" 
                                            : "text-gray-700 hover:bg-gray-50 hover:text-black"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* LISTA PRODUSE */}
        {filteredProducts.length === 0 ? (
          <div className="text-center mt-20 p-10 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 max-w-lg mx-auto">
            <div className="text-5xl mb-4">🤔</div>
            <h3 className="text-xl text-white font-bold mb-2">Niciun produs aici.</h3>
            <p className="text-gray-400 mb-6">Momentan nu avem produse în categoria <strong>{currentLabel}</strong>.</p>
            <Link href="/contact" className="inline-block bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                Cere un produs
            </Link>
          </div>
        ) : (
          <>
            {/* 👇 AICI ESTE LOGICA DE SEPARARE PENTRU PRECOMANDĂ 👇 */}
            {activeCategory === 'custom' ? (
                <>
                    {/* 1. Primele 2 produse */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {filteredProducts.slice(0, 2).map(renderCard)}
                    </div>

                    {/* 2. Textul despărțitor (doar dacă sunt mai mult de 2 produse) */}
                    {filteredProducts.length > 2 && (
                        <div className="mb-10 pt-6 border-t border-gray-800">
                             <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <FaFire className="text-orange-500" />
                                Articole populare la <span className="text-blue-500">precomandă</span>
                            </h2>
                        </div>
                    )}

                    {/* 3. Restul produselor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredProducts.slice(2).map(renderCard)}
                    </div>
                </>
            ) : (
                /* 👇 Cazul normal (Grid unic pentru celelalte categorii) */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(renderCard)}
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}