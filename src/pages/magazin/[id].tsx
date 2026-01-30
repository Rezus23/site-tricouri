import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { FiX, FiZoomIn, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BlurredBackground from "@/components/BlurredBackground";
import SizeChart from "@/components/SizeChart";
import { LuRuler } from "react-icons/lu";

type MarimeStoc = {
  nume: string;
  stoc: number;
  piept?: number;  
  lungime?: number;
};

// 👇 1. Actualizăm tipul produsului
type Produs = {
  id: string;
  titlu: string;
  pret: number;
  imagine: string;      
  imagini?: string[];   
  descriere?: string;
  marimi?: MarimeStoc[];
  personalizare?: string;
  categorie: string; // sau 'category' daca asa e in firebase
};

export default function PaginaProdus() {
  const router = useRouter();
  const { id } = router.query; 
  
  const [produs, setProdus] = useState<Produs | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stări
  const [selectedSize, setSelectedSize] = useState("");
  const [customText, setCustomText] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  
  // State pentru indexul curent din slider
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

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
              marimi: marimiFinale,
              // Asigurăm compatibilitate dacă în firebase e 'category' sau 'categorie'
              categorie: data.categorie || data.category || "" 
          } as Produs);
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

  // Funcții Slider
  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
      if (sliderRef.current) {
          const index = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
          setCurrentImageIndex(index);
      }
  };


  // 👇 2. Funcția de adăugare optimizată pentru debug
  const handleAddToCart = () => {
    if (!produs) return;
    
    // Verificare vizuală în consolă
    console.log("---- ADAUG ÎN COȘ ----");
    console.log("Text Personalizare:", customText);

    if (produs.marimi && produs.marimi.length > 0 && !selectedSize) {
        alert("⚠️ Te rog selectează o mărime înainte de a adăuga în coș!");
        return;
    }

    let stocDisponibil = 99; 
    if (produs.marimi && selectedSize) {
        const marimeGasita = produs.marimi.find(m => m.nume === selectedSize);
        if (marimeGasita) stocDisponibil = marimeGasita.stoc;
    }

    const produseInCos = cart.filter(item => 
        item.id === produs.id && item.marime === selectedSize
    ).length;

    if (produseInCos + 1 > stocDisponibil) {
        alert(`❌ Stoc insuficient! Ai deja ${produseInCos} bucăți în coș.`);
        return;
    }

    const titluFinal = selectedSize 
        ? `${produs.titlu} (${selectedSize})` 
        : produs.titlu;

    const imgCurenta = produs.imagini && produs.imagini.length > 0 
        ? produs.imagini[currentImageIndex] 
        : produs.imagine;

    // Adăugăm în coș
    adaugaInCos({
        id: produs.id, 
        titlu: titluFinal,
        pret: produs.pret,
        imagine: imgCurenta,
        marimeSelectata: selectedSize,
        // 👇 AICI E CHEIA: Trimitem textul sau un string gol, dar NU undefined
        personalizare: customText || "" 
    });
    
    // Feedback vizual rapid
    // alert("Produs adăugat! Text: " + customText);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center relative">
        <BlurredBackground />
        <p className="text-white text-xl font-bold animate-pulse">Se încarcă...</p>
    </div>
  );

  if (!produs) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Produsul nu a fost găsit.</div>;

  const toateImaginile = produs.imagini && produs.imagini.length > 0 
    ? produs.imagini 
    : [produs.imagine];

  // 👇 Verificăm dacă e produs custom (includem și varianta cu literă mare sau precomandă)
  const isCustomProduct = 
      produs.categorie === 'custom' || 
      produs.categorie === 'Custom' || 
      produs.categorie === 'precomanda';

  return (
    <div className="min-h-screen relative">
      <BlurredBackground />

      <div className="max-w-6xl mx-auto p-0 md:p-6 relative z-10 pt-20 md:pt-24">
        
        <div className="px-4 md:px-0">
            <Link 
                href="/shop" 
                className="inline-block mb-4 md:mb-8 text-gray-300 hover:text-white hover:underline transition font-medium"
            >
                ← Înapoi la Magazin
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12 bg-transparent md:bg-white/90 md:backdrop-blur-md md:p-8 md:rounded-3xl md:shadow-2xl">
            
            {/* --- ZONA IMAGINI --- */}
            <div className="relative group">
                <div 
                    ref={sliderRef}
                    onScroll={handleScroll}
                    className="w-full overflow-x-scroll snap-x snap-mandatory flex scrollbar-hide bg-white md:rounded-2xl h-[50vh] md:h-[500px]"
                >
                    {toateImaginile.map((img, idx) => (
                        <div 
                            key={idx} 
                            className="w-full flex-shrink-0 snap-center flex items-center justify-center h-full bg-white relative cursor-zoom-in"
                            onClick={() => setIsZoomed(true)}
                        >
                            <img 
                                src={img} 
                                alt={`${produs.titlu} ${idx}`} 
                                className="max-h-full w-auto object-contain p-4"
                            />
                        </div>
                    ))}
                </div>

                {toateImaginile.length > 1 && (
                    <>
                        <button onClick={() => scrollSlider('left')} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg text-black opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"><FiChevronLeft size={24} /></button>
                        <button onClick={() => scrollSlider('right')} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg text-black opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"><FiChevronRight size={24} /></button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {toateImaginile.map((_, idx) => (
                                <div key={idx} className={`h-2 w-2 rounded-full transition-all ${currentImageIndex === idx ? "bg-black w-4" : "bg-gray-300"}`} />
                            ))}
                        </div>
                    </>
                )}
                <div className="md:hidden absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                     {currentImageIndex + 1} / {toateImaginile.length}
                </div>
            </div>

            {/* --- DETALII PRODUS --- */}
            <div className="flex flex-col bg-white md:bg-transparent p-6 md:p-0 rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-none">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">{produs.titlu}</h1>
                <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-8">{produs.pret} RON</p>
                
                {/* SELECTOR MĂRIMI */}
                {produs.marimi && produs.marimi.length > 0 && (
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-gray-700">Alege Mărimea:</span>
                            <button onClick={() => setIsSizeChartOpen(true)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline transition font-medium">
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
                        
                        {selectedSize && produs.marimi.find(m => m.nume === selectedSize)?.stoc! < 3 && produs.marimi.find(m => m.nume === selectedSize)?.stoc! > 0 && (
                            <p className="text-orange-600 text-sm mt-3 font-bold animate-pulse flex items-center gap-2">
                                🔥 Grăbește-te! Doar {produs.marimi.find(m => m.nume === selectedSize)?.stoc} bucăți rămase!
                            </p>
                        )}
                    </div>
                )}

                {/* 👇 ZONA DE PERSONALIZARE CORECTATĂ */}
                {/* Am schimbat culorile ca să fie vizibil pe fundal alb */}
                {isCustomProduct && (
                   <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                       <label className="block text-sm font-bold mb-2 text-gray-800">
                           PERSONALIZARE TRICOU (Nume + Număr)
                         </label>
                       <input
                           type="text"
                           placeholder="Ex: MESSI 10"
                           value={customText}
                           onChange={(e) => setCustomText(e.target.value)}
                           // 👇 AM SCHIMBAT AICI: text-black in loc de text-white
                           className="w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition uppercase placeholder-gray-400"
                       />
                       <p className="text-xs text-gray-500 mt-2">
                           *Lasă gol dacă dorești tricoul simplu, fără număr/nume.
                       </p>
                   </div>
                )}

                <div className="mb-10">
                    <h3 className="font-bold text-lg mb-3 border-b pb-2 text-gray-800">Descriere Produs</h3>
                    <div 
                        className="text-gray-600 leading-relaxed whitespace-pre-line product-description"
                        dangerouslySetInnerHTML={{ __html: produs.descriere || "Nu există o descriere detaliată pentru acest produs." }}
                    />
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
                    src={toateImaginile[currentImageIndex]} 
                    alt="Zoom" 
                    className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl rounded-md"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        )}

        <SizeChart 
           isOpen={isSizeChartOpen} 
           onClose={() => setIsSizeChartOpen(false)} 
           marimi={produs.marimi} 
        />
      </div>
    </div>
  );
}