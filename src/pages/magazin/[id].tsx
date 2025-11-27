import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

type Produs = {
  id: string;
  titlu: string;
  pret: number;
  imagini: string[]; // Listă de poze
  descriere?: string;
  marimi?: string[];
};

export default function PaginaProdus() {
  const router = useRouter();
  const { id } = router.query;
  const [produs, setProdus] = useState<Produs | null>(null);
  const [selectedImage, setSelectedImage] = useState(""); // 👈 Poza curentă mare
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const { adaugaInCos } = useCart();

  useEffect(() => {
    if (!id) return;

    const getProdus = async () => {
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Compatibilitate veche: transformăm 'imagine' în array dacă e cazul
          const imaginiList = data.imagini || (data.imagine ? [data.imagine] : []);
          
          setProdus({ id: docSnap.id, ...data, imagini: imaginiList } as Produs);
          setSelectedImage(imaginiList[0]); // Setăm prima poză ca default
        }
      } catch (error) {
        console.error("Eroare:", error);
      } finally {
        setLoading(false);
      }
    };

    getProdus();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Se încarcă...</div>;
  if (!produs) return <div className="min-h-screen flex items-center justify-center">Produs inexistent.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-black">← Înapoi</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* --- GALERIE FOTO --- */}
        <div className="flex flex-col gap-4">
            {/* Imaginea Mare */}
            <div className="bg-white border rounded-xl overflow-hidden h-[450px] flex items-center justify-center shadow-sm">
                <img src={selectedImage} alt={produs.titlu} className="max-h-full max-w-full object-contain" />
            </div>
            
            {/* Thumbnails (doar dacă sunt mai multe) */}
            {produs.imagini.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {produs.imagini.map((img, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedImage(img)}
                            className={`h-20 w-20 border-2 rounded-lg cursor-pointer flex-shrink-0 overflow-hidden ${
                                selectedImage === img ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                            }`}
                        >
                            <img src={img} className="h-full w-full object-cover hover:scale-110 transition" alt="thumb"/>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* --- DETALII --- */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">{produs.titlu}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">{produs.pret} RON</p>
          
          {/* Selector Mărimi */}
          {produs.marimi && produs.marimi.length > 0 && (
              <div className="mb-6">
                  <p className="font-bold mb-2 text-sm text-gray-600">Mărime:</p>
                  <div className="flex gap-2">
                      {produs.marimi.map(m => (
                          <button
                            key={m}
                            onClick={() => setSelectedSize(m)}
                            className={`px-4 py-2 border rounded-md font-semibold transition ${
                                selectedSize === m 
                                ? 'bg-black text-white border-black' 
                                : 'bg-white text-gray-700 hover:border-black'
                            }`}
                          >
                              {m}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          <div className="prose mb-8 text-gray-700">
            <h3 className="font-bold text-lg mb-2">Descriere:</h3>
            <p>{produs.descriere}</p>
          </div>

          <button
            onClick={() => {
                if (produs.marimi && produs.marimi.length > 0 && !selectedSize) {
                    alert("Te rog selectează o mărime!");
                    return;
                }
                const titluFinal = selectedSize ? `${produs.titlu} (Mărime: ${selectedSize})` : produs.titlu;
                
                adaugaInCos({ id: 0, titlu: titluFinal, pret: produs.pret });
                alert("Adăugat în coș!");
            }}
            className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
          >
            Adaugă în Coș
          </button>
        </div>
      </div>
    </div>
  );
}