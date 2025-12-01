import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { FiX, FiZoomIn} from "react-icons/fi";
import { LuRuler } from "react-icons/lu";
import BlurredBackground from "@/components/BlurredBackground";
import SizeChart from "@/components/SizeChart"; // Asigură-te că ai creat acest fișier!

// Definim tipul pentru Mărimi cu Stoc
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
  descriere?: string;
  marimi?: MarimeStoc[]; 
};

export default function PaginaProdus() {
  const router = useRouter();
  const { id } = router.query; 
  
  const [produs, setProdus] = useState<Produs | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stări Interacțiune
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false); // Stare pentru Pop-up Mărimi
  
  // Importăm cart pentru a verifica cantitatea deja adăugată
  const { adaugaInCos, cart } = useCart();

  useEffect(() => {
    if (!id) return; 

    const getProdus = async () => {
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const imaginiList = data.imagini || (data.imagine ? [data.imagine] : []);
          
          // Compatibilitate pentru produse vechi (convertim string[] în obiecte)
          let marimiFinale: MarimeStoc[] = [];
          if (Array.isArray(data.marimi)) {
             if (typeof data.marimi[0] === 'string') {
                 marimiFinale = data.marimi.map((m: string) => ({ nume: m, stoc: 99 }));
             } else {
                 marimiFinale = data.marimi;
             }
          }

          setProdus({ 
              id: docSnap.id, 
              ...data, 
              imagini: imaginiList,
              marimi: marimiFinale 
          } as Produs);
          
          if (imaginiList.length > 0) setSelectedImage(imaginiList[0]);
        } else {
          console.log("Produsul nu există!");
        }
      } catch (error) {
        console.error("Eroare:", error);
      } finally {
        setLoading(false);
      }
    };

    getProdus();
  }, [id]);

  const handleAddToCart = () => {
    if (!produs) return;

    // 1. Validare selectare mărime
    if (produs.marimi && produs.marimi.length > 0 && !selectedSize) {
        alert("⚠️ Te rog selectează o mărime înainte de a adăuga în coș!");
        return;
    }

    // 2. Verificare Stoc vs Coș
    let stocDisponibil = 99; 
    if (produs.marimi && selectedSize) {
        const marimeGasita = produs.marimi.find(m => m.nume === selectedSize);
        if (marimeGasita) {
            stocDisponibil = marimeGasita.stoc;
        }
    }

    const produseInCos = cart.filter(item => 
        item.id === produs.id && item.marime === selectedSize
    ).length;

    if (produseInCos + 1 > stocDisponibil) {
        alert(`❌ Stoc insuficient! Ai deja ${produseInCos} bucăți în coș, iar stocul total este ${stocDisponibil}.`);
        return;
    }

    // 3. Adăugare
    const titluFinal = selectedSize 
        ? `${produs.titlu} (${selectedSize})` 
        : produs.titlu;

    adaugaInCos({
        id: produs.id, 
        titlu: titluFinal,
        pret: produs.pret,
        imagine: selectedImage || produs.imagini?.[0] || produs.imagine,
        marimeSelectata: selectedSize
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center relative">
        <BlurredBackground />
        <p className="text-white text-xl font-bold animate-pulse">Se încarcă...</p>
    </div>
  );

  if (!produs) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Produsul nu a fost găsit.</div>;

  return (
    <div className="min-h-screen relative">
      <BlurredBackground />

      <div className="max-w-6xl mx-auto p-6 relative z-10 pt-10">
        <Link 
            href="/shop" 
            className="inline-block mb-8 text-gray-300 hover:text-white hover:underline transition font-medium"
        >
            ← Înapoi la Magazin
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
            
            {/* --- COL 1: GALERIE FOTO --- */}
            <div className="flex flex-col gap-4">
                <div 
                    className="bg-white border rounded-2xl overflow-hidden h-[500px] flex items-center justify-center shadow-sm relative group cursor-zoom-in"
                    onClick={() => setIsZoomed(true)}
                >
                    <img 
                        src={selectedImage || "/placeholder.png"} 
                        alt={produs.titlu} 
                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/50 text-white p-3 rounded-full backdrop-blur-sm">
                            <FiZoomIn className="text-2xl" />
                        </div>
                    </div>
                </div>
                
                {/* Thumbnails */}
                {produs.imagini && produs.imagini.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {produs.imagini.map((img, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedImage(img)}
                                className={`h-24 w-24 border-2 rounded-lg cursor-pointer flex-shrink-0 overflow-hidden transition-all ${
                                    selectedImage === img 
                                    ? 'border-black ring-2 ring-gray-200 opacity-100' 
                                    : 'border-gray-200 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img src={img} className="h-full w-full object-cover" alt={`thumb-${idx}`}/>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- COL 2: DETALII PRODUS --- */}
            <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">{produs.titlu}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-8">{produs.pret} RON</p>
            
            {/* SELECTOR MĂRIMI */}
            {produs.marimi && produs.marimi.length > 0 && (
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-700">Alege Mărimea:</span>
                        
                        {/* Buton Ghid Mărimi */}
                        <button 
                            onClick={() => setIsSizeChartOpen(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline transition font-medium"
                        >
                            <LuRuler /> Ghid mărimi
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {produs.marimi.map((m) => {
                            const isOutOfStock = m.stoc <= 0;
                            return (
                                <button
                                    key={m.nume}
                                    disabled={isOutOfStock}
                                    onClick={() => !isOutOfStock && setSelectedSize(m.nume)}
                                    className={`px-5 py-3 border rounded-lg font-semibold transition-all duration-200 min-w-[50px] relative
                                        ${isOutOfStock 
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through opacity-60' 
                                            : selectedSize === m.nume 
                                                ? 'bg-black text-white border-black shadow-md transform scale-105' 
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {m.nume}
                                </button>
                            );
                        })}
                    </div>
                    {!selectedSize && <p className="text-red-500 text-sm mt-2 font-medium">* Selectarea mărimii este obligatorie</p>}
                    
                    {/* Mesaj Stoc Limitat */}
                    {selectedSize && produs.marimi.find(m => m.nume === selectedSize)?.stoc! < 3 && produs.marimi.find(m => m.nume === selectedSize)?.stoc! > 0 && (
                        <p className="text-orange-600 text-sm mt-3 font-bold animate-pulse flex items-center gap-2">
                            🔥 Grăbește-te! Doar {produs.marimi.find(m => m.nume === selectedSize)?.stoc} bucăți rămase!
                        </p>
                    )}
                </div>
            )}

            <div className="mb-10">
                <h3 className="font-bold text-lg mb-3 border-b pb-2 text-gray-800">Descriere Produs</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {produs.descriere || "Nu există o descriere detaliată pentru acest produs."}
                </p>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={produs.marimi && produs.marimi.length > 0 && !selectedSize}
                className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Adaugă în Coș
            </button>

            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 justify-center">
                <span> Livrare rapidă</span>
                <span>•</span>
                <span> Plată Securizată Netopia</span>
            </div>
            </div>
        </div>

        {/* MODAL ZOOM */}
        {isZoomed && (
            <div 
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center cursor-zoom-out animate-in fade-in duration-200"
                onClick={() => setIsZoomed(false)}
            >
                <button 
                    className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition"
                    onClick={() => setIsZoomed(false)}
                >
                    <FiX />
                </button>
                <img 
                    src={selectedImage} 
                    alt="Zoom" 
                    className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl rounded-md"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        )}

        {/* MODAL SIZE CHART (TABEL MĂRIMI) */}
        <SizeChart isOpen={isSizeChartOpen} onClose={() => setIsSizeChartOpen(false)} />

      </div>
    </div>
  );
}