import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

// Definim tipul produsului
type Produs = {
  id: string;
  titlu: string;
  pret: number;
  imagine: string;      // Fallback pentru produse vechi
  imagini?: string[];   // Lista de poze (produse noi)
  descriere?: string;
  marimi?: string[];    // Lista de mărimi
};

export default function PaginaProdus() {
  const router = useRouter();
  const { id } = router.query; // Preluăm ID-ul din URL
  
  const [produs, setProdus] = useState<Produs | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stări pentru interacțiune
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  
  const { adaugaInCos } = useCart();

  useEffect(() => {
    if (!id) return; 

    const getProdus = async () => {
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Logică pentru imagini: Dacă avem array, îl luăm. Dacă nu, facem array din singura poză.
          const imaginiList = data.imagini || (data.imagine ? [data.imagine] : []);
          
          setProdus({ id: docSnap.id, ...data, imagini: imaginiList } as Produs);
          
          // Setăm imaginea principală ca fiind prima din listă
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

  // Funcție Adăugare în Coș
  const handleAddToCart = () => {
    if (!produs) return;

    // Validare Mărime
    if (produs.marimi && produs.marimi.length > 0 && !selectedSize) {
        alert("⚠️ Te rog selectează o mărime înainte de a adăuga în coș!");
        return;
    }

    // Construim titlul final
    const titluFinal = selectedSize 
        ? `${produs.titlu} (${selectedSize})` 
        : produs.titlu;

    adaugaInCos({
        id: 0, 
        titlu: titluFinal,
        pret: produs.pret
    });

    alert(`✅ ${titluFinal} a fost adăugat în coș!`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Se încarcă detaliile...</div>;
  if (!produs) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Produsul nu a fost găsit.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      
      {/* 👇 MODIFICARE: Link fix către /shop */}
      <Link 
        href="/shop" 
        className="inline-block mb-8 text-gray-500 hover:text-black hover:underline transition font-medium"
      >
        ← Înapoi la Magazin
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* --- COL 1: GALERIE FOTO --- */}
        <div className="flex flex-col gap-4">
            {/* Imaginea Mare */}
            <div className="bg-white border rounded-2xl overflow-hidden h-[500px] flex items-center justify-center shadow-sm relative">
                <img 
                    src={selectedImage || "/placeholder.png"} 
                    alt={produs.titlu} 
                    className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105" 
                />
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
          
          {/* Selector Mărimi */}
          {produs.marimi && produs.marimi.length > 0 && (
              <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-700">Alege Mărimea:</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                      {produs.marimi.map(m => (
                          <button
                            key={m}
                            onClick={() => setSelectedSize(m)}
                            className={`px-5 py-3 border rounded-lg font-semibold transition-all duration-200 min-w-[50px] ${
                                selectedSize === m 
                                ? 'bg-black text-white border-black shadow-md transform scale-105' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:bg-gray-50'
                            }`}
                          >
                              {m}
                          </button>
                      ))}
                  </div>
                  {!selectedSize && <p className="text-red-500 text-sm mt-2">* Selectarea mărimii este obligatorie</p>}
              </div>
          )}

          {/* Descriere */}
          <div className="mb-10">
            <h3 className="font-bold text-lg mb-3 border-b pb-2">Descriere Produs</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {produs.descriere || "Nu există o descriere detaliată pentru acest produs."}
            </p>
          </div>

          {/* Buton ADAUGĂ ÎN COȘ */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2"
          >
            🛒 Adaugă în Coș
          </button>

          {/* Info Livrare */}
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 justify-center">
             <span>🚚 Livrare rapidă</span>
             <span>•</span>
             <span>💳 Plată Securizată Netopia</span>
          </div>
        </div>
      </div>
    </div>
  );
}