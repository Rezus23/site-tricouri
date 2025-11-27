// src/pages/produs/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

type Produs = {
  id: string;
  titlu: string;
  pret: number;
  imagini: string[];
  descriere?: string;
  marimi?: string[];
};

export default function PaginaProdus() {
  const router = useRouter();
  const { id } = router.query;
  const [produs, setProdus] = useState<Produs | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
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
          const imaginiList = data.imagini || (data.imagine ? [data.imagine] : []);
          setProdus({ id: docSnap.id, ...data, imagini: imaginiList } as Produs);
          setSelectedImage(imaginiList[0]);
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    getProdus();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Se încarcă...</div>;
  if (!produs) return <div className="p-10 text-center">Produs inexistent.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <button onClick={() => router.back()} className="mb-6 text-gray-500 hover:text-black">← Înapoi</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-4">
            <div className="bg-white border rounded-xl overflow-hidden h-[450px] flex items-center justify-center">
                <img src={selectedImage} alt={produs.titlu} className="max-h-full max-w-full object-contain" />
            </div>
            {produs.imagini.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                    {produs.imagini.map((img, idx) => (
                        <img key={idx} src={img} onClick={() => setSelectedImage(img)} 
                        className={`h-20 w-20 border-2 rounded cursor-pointer object-cover ${selectedImage === img ? 'border-blue-500' : 'border-gray-200'}`} />
                    ))}
                </div>
            )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-2">{produs.titlu}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">{produs.pret} RON</p>
          
          {produs.marimi && (
              <div className="mb-6 flex gap-2">
                  {produs.marimi.map(m => (
                      <button key={m} onClick={() => setSelectedSize(m)}
                        className={`px-4 py-2 border rounded ${selectedSize === m ? 'bg-black text-white' : 'bg-white'}`}>
                          {m}
                      </button>
                  ))}
              </div>
          )}
          <p className="mb-8 text-gray-700">{produs.descriere}</p>
          <button onClick={() => {
              if (produs.marimi && !selectedSize) return alert("Alege mărimea!");
              const titluFinal = selectedSize ? `${produs.titlu} (${selectedSize})` : produs.titlu;
              adaugaInCos({ id: 0, titlu: titluFinal, pret: produs.pret });
              alert("Adăugat!");
          }} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700">
            Adaugă în Coș
          </button>
        </div>
      </div>
    </div>
  );
}