import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

// --- CONFIGURARE ---
const CLOUDINARY_CLOUD_NAME = "debck79qe"; // Pune datele tale
const CLOUDINARY_UPLOAD_PRESET = "pozetricouri"; // Pune presetul tău
const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

// Definim structura nouă pentru mărimi
type MarimeStoc = {
  nume: string;
  stoc: number;
};

type Produs = { 
  id: string; 
  titlu: string; 
  pret: number; 
  imagini: string[]; 
  marimi?: MarimeStoc[]; // 👈 LISTĂ DE OBIECTE (Nume + Stoc)
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Stare Formular
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({ 
    titlu: "", 
    pret: "", 
    marimi: "", // Input-ul rămâne text (ex: "S:5, M:10")
    descriere: "" 
  });

  // 1. SECURITATE
  useEffect(() => {
    if (!authLoading) {
        if (!user || user.email !== ADMIN_EMAIL) {
            router.push("/");
        } else {
            fetchProduse();
        }
    }
  }, [user, authLoading, router]);

  // 2. Citește Produsele
  const fetchProduse = async () => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    const data = snap.docs.map(d => {
        const docData = d.data();
        // Compatibilitate imagini
        const imagini = docData.imagini || (docData.imagine ? [docData.imagine] : []);
        
        // Compatibilitate mărimi vechi (dacă există produse vechi fără stoc)
        let marimiFinale: MarimeStoc[] = [];
        if (Array.isArray(docData.marimi)) {
            // Verificăm dacă e formatul vechi (string[]) sau nou (object[])
            if (typeof docData.marimi[0] === 'string') {
                marimiFinale = docData.marimi.map((m: string) => ({ nume: m, stoc: 99 })); // Fallback stoc 99
            } else {
                marimiFinale = docData.marimi;
            }
        }

        return { id: d.id, ...docData, imagini, marimi: marimiFinale } as Produs;
    });
    setProduse(data);
  };

  // 3. Upload Imagine
  const uploadSingleImage = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST", body: data
    });
    const json = await res.json();
    if (!json.secure_url) throw new Error("Eroare upload Cloudinary");
    return json.secure_url;
  };

  // 4. Adaugă Produs
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) return alert("Alege măcar o poză!");
    setLoading(true);

    try {
      // Upload poze
      const uploadPromises = imageFiles.map(file => uploadSingleImage(file));
      const imageUrls = await Promise.all(uploadPromises);

      // 👈 PARSARE MĂRIMI + STOC
      // Transformăm "S:5, M:10" -> [{nume: "S", stoc: 5}, {nume: "M", stoc: 10}]
      const marimiProcesate: MarimeStoc[] = formData.marimi
        .split(",")
        .map((item) => {
          const parts = item.trim().split(":"); // Spargem după ":"
          const nume = parts[0]?.trim().toUpperCase();
          // Dacă nu pui stoc (ex: scrii doar "S"), punem 0 default
          const stoc = parts[1] ? parseInt(parts[1].trim()) : 0; 
          
          return { nume, stoc };
        })
        .filter((m) => m.nume !== ""); // Eliminăm intrările goale

      await addDoc(collection(db, "products"), {
        titlu: formData.titlu,
        pret: Number(formData.pret),
        marimi: marimiProcesate, // 👈 Salvăm structura complexă
        descriere: formData.descriere,
        imagini: imageUrls,
        createdAt: serverTimestamp()
      });

      alert("Produs adăugat cu stoc! ✅");
      setFormData({ titlu: "", pret: "", marimi: "", descriere: "" });
      setImageFiles([]);
      fetchProduse();
    } catch (err) {
      console.error(err);
      alert("Eroare la adăugare");
    } finally {
      setLoading(false);
    }
  };

  // 5. Șterge Produs
  const handleDelete = async (id: string) => {
    if (!confirm("Sigur ștergi produsul?")) return;
    try {
        await deleteDoc(doc(db, "products", id));
        setProduse(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert("Eroare la ștergere"); }
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard (Cu Stoc)</h1>

      {/* FORMULAR */}
      <div className="bg-white p-6 rounded shadow mb-10 border border-gray-300">
        <h2 className="text-xl font-bold mb-4">Adaugă Produs Nou</h2>
        <form onSubmit={handleAdd} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nume Produs</label>
                    <input 
                        placeholder="Ex: Tricou Real Madrid" 
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.titlu} onChange={e => setFormData({...formData, titlu: e.target.value})} 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Preț (RON)</label>
                    <input 
                        placeholder="Ex: 250" 
                        type="number" 
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} 
                        required 
                    />
                </div>
            </div>
            
            {/* INPUT MĂRIMI CU STOC */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mărimi și Stoc (Format: Mărime:Cantitate)</label>
                <input 
                    placeholder="Ex: S:5, M:10, L:2, XL:0" 
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.marimi} onChange={e => setFormData({...formData, marimi: e.target.value})} 
                    required 
                />
                <p className="text-xs text-gray-500 mt-1">Separă prin virgulă. Folosește "două puncte" pentru stoc.</p>
            </div>

            {/* INPUT POZE */}
            <div className="border-2 border-dashed p-4 rounded text-center cursor-pointer hover:bg-gray-50 transition relative">
                <label className="cursor-pointer block w-full h-full">
                    <span className="font-bold text-gray-600 block mb-2">
                        {imageFiles.length > 0 
                            ? `📸 ${imageFiles.length} poze selectate` 
                            : "Click aici pentru a alege pozele (ține CTRL pentru mai multe)"}
                    </span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={e => {
                            if (e.target.files) setImageFiles(Array.from(e.target.files));
                        }} 
                    />
                </label>
                {imageFiles.length > 0 && (
                    <div className="flex gap-2 justify-center mt-2">
                        {imageFiles.map((file, i) => (
                            <img key={i} src={URL.createObjectURL(file)} className="h-10 w-10 object-cover rounded border" alt="preview"/>
                        ))}
                    </div>
                )}
            </div>

            <textarea 
                placeholder="Descriere produs..." 
                className="border p-2 rounded w-full h-24 focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.descriere} onChange={e => setFormData({...formData, descriere: e.target.value})} 
            />
            
            <button disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded w-full hover:bg-green-700 font-bold transition">
                {loading ? "Se procesează..." : "Salvează Produsul"}
            </button>
        </form>
      </div>

      {/* LISTA PRODUSE */}
      <h2 className="text-2xl font-bold mb-4">Produse în Magazin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {produse.map(p => (
            <div key={p.id} className="border p-4 rounded bg-white shadow flex flex-col justify-between">
                <div>
                    <div className="h-40 w-full mb-3 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img src={p.imagini[0]} alt={p.titlu} className="h-full object-contain" />
                    </div>
                    <h3 className="font-bold text-lg">{p.titlu}</h3>
                    <p className="text-green-600 font-bold mb-2">{p.pret} RON</p>
                    
                    {/* Afișare Stoc */}
                    <div className="text-sm bg-gray-50 p-2 rounded border">
                        <p className="font-bold text-gray-700 mb-1">Stoc:</p>
                        <div className="flex flex-wrap gap-2">
                            {p.marimi?.map((m, idx) => (
                                <span key={idx} className={`px-2 py-1 rounded text-xs border ${m.stoc > 0 ? 'bg-white border-gray-300' : 'bg-red-50 text-red-500 border-red-200'}`}>
                                    {m.nume}: <b>{m.stoc}</b>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="bg-red-100 text-red-600 py-2 mt-4 rounded hover:bg-red-200 font-bold transition">
                    🗑️ Șterge
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}