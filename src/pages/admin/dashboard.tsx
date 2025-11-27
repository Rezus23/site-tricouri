import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

// --- CONFIGURARE ---
const CLOUDINARY_CLOUD_NAME = "debck79qe"; // Pune numele tău
const CLOUDINARY_UPLOAD_PRESET = "pozetricouri"; // Pune presetul tău (Unsigned)
const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

type Produs = { 
  id: string; 
  titlu: string; 
  pret: number; 
  imagini: string[]; 
  marimi?: string[]; 
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Stare Formular
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Array de fișiere
  const [formData, setFormData] = useState({ 
    titlu: "", 
    pret: "", 
    marimi: "", 
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
        const imagini = docData.imagini || (docData.imagine ? [docData.imagine] : []);
        return { id: d.id, ...docData, imagini } as Produs;
    });
    setProduse(data);
  };

  // 3. Upload O SINGURĂ imagine
  const uploadSingleImage = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST", body: data
    });
    const json = await res.json();
    if (!json.secure_url) throw new Error("Eroare upload la Cloudinary");
    return json.secure_url;
  };

  // 4. Adaugă Produs
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) return alert("Alege măcar o poză!");
    setLoading(true);

    try {
      // Urcăm toate pozele simultan
      const uploadPromises = imageFiles.map(file => uploadSingleImage(file));
      const imageUrls = await Promise.all(uploadPromises);

      // Procesare Mărimi
      const marimiArray = formData.marimi
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s !== "");

      await addDoc(collection(db, "products"), {
        titlu: formData.titlu,
        pret: Number(formData.pret),
        marimi: marimiArray,
        descriere: formData.descriere,
        imagini: imageUrls, // Salvăm lista de link-uri
        createdAt: serverTimestamp()
      });

      alert("Produs adăugat cu succes! ✅");
      // Reset Formular
      setFormData({ titlu: "", pret: "", marimi: "", descriere: "" });
      setImageFiles([]); // Golim selecția de poze
      fetchProduse();
    } catch (err) {
      console.error(err);
      alert("Eroare la adăugare (verifică consola).");
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
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard</h1>

      {/* FORMULAR */}
      <div className="bg-white p-6 rounded shadow mb-10 border">
        <h2 className="text-xl font-bold mb-4">Adaugă Produs Nou</h2>
        <form onSubmit={handleAdd} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                    placeholder="Titlu Produs" 
                    className="border p-2 rounded" 
                    value={formData.titlu} onChange={e => setFormData({...formData, titlu: e.target.value})} 
                    required 
                />
                <input 
                    placeholder="Preț (RON)" 
                    type="number" 
                    className="border p-2 rounded" 
                    value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} 
                    required 
                />
            </div>
            
            <input 
                placeholder="Mărimi (ex: S, M, L, XL)" 
                className="border p-2 rounded w-full" 
                value={formData.marimi} onChange={e => setFormData({...formData, marimi: e.target.value})} 
                required 
            />

            {/* INPUT MULTIPLE FILES - AICI ESTE MODIFICAREA */}
            <div className="border-2 border-dashed p-4 rounded text-center cursor-pointer hover:bg-gray-50 transition relative">
                <label className="cursor-pointer block w-full h-full">
                    <span className="font-bold text-gray-600 block mb-2">
                        {imageFiles.length > 0 
                            ? `📸 ${imageFiles.length} poze selectate` 
                            : "Click aici pentru a alege pozele (ține apăsat CTRL pentru mai multe) 🖼️"}
                    </span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        multiple // 👈 ACESTA ESTE ATRIBUTUL ESENȚIAL
                        className="hidden" 
                        onChange={e => {
                            if (e.target.files) {
                                // Transformăm FileList în Array real
                                const filesArray = Array.from(e.target.files);
                                setImageFiles(filesArray);
                            }
                        }} 
                    />
                </label>
                
                {/* Buton de Resetare Selecție */}
                {imageFiles.length > 0 && (
                    <button 
                        type="button"
                        onClick={() => setImageFiles([])}
                        className="text-red-500 text-sm underline mt-2"
                    >
                        Șterge selecția
                    </button>
                )}
            </div>
            
            {/* PREVIEW POZE SELECTATE */}
            {imageFiles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {imageFiles.map((file, idx) => (
                        <div key={idx} className="h-24 w-24 border rounded overflow-hidden flex-shrink-0 relative">
                            <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" alt="preview"/>
                        </div>
                    ))}
                </div>
            )}

            <textarea 
                placeholder="Descriere produs..." 
                className="border p-2 rounded w-full" 
                rows={3}
                value={formData.descriere} onChange={e => setFormData({...formData, descriere: e.target.value})} 
            />
            
            <button disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded w-full hover:bg-green-700 font-bold">
                {loading ? "Se încarcă pozele..." : "Adaugă Produs"}
            </button>
        </form>
      </div>

      {/* LISTA PRODUSE */}
      <h2 className="text-2xl font-bold mb-4">Produse Existente ({produse.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {produse.map(p => (
            <div key={p.id} className="border p-4 rounded bg-white shadow flex flex-col justify-between">
                <div>
                    <img src={p.imagini[0]} alt={p.titlu} className="h-48 w-full object-contain mb-2" />
                    <p className="font-bold">{p.titlu}</p>
                    <p className="text-green-600 font-bold">{p.pret} RON</p>
                    <p className="text-xs text-gray-500">{p.imagini.length} poze</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="bg-red-100 text-red-600 py-1 mt-3 rounded hover:bg-red-200">
                    🗑️ Șterge
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}