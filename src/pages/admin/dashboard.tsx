import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

// --- CONFIGURARE ---
const CLOUDINARY_CLOUD_NAME = "dvj426x"; // Pune numele tău corect
const CLOUDINARY_UPLOAD_PRESET = "pozetricouri"; // Pune presetul tău
const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

type MarimeStoc = {
  nume: string;
  stoc: number;
};

type Produs = { 
  id: string; 
  titlu: string; 
  pret: number; 
  imagini: string[]; 
  marimi?: MarimeStoc[]; 
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

  const fetchProduse = async () => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    
    const data = snap.docs.map(d => {
        const docData = d.data();
        const imagini = docData.imagini || (docData.imagine ? [docData.imagine] : []);
        
        let marimiFinale: MarimeStoc[] = [];
        if (Array.isArray(docData.marimi)) {
            if (typeof docData.marimi[0] === 'string') {
                marimiFinale = docData.marimi.map((m: string) => ({ nume: m, stoc: 99 }));
            } else {
                marimiFinale = docData.marimi;
            }
        }

        return { id: d.id, ...docData, imagini, marimi: marimiFinale } as Produs;
    });
    setProduse(data);
  };

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) return alert("Alege măcar o poză!");
    setLoading(true);

    try {
      const uploadPromises = imageFiles.map(file => uploadSingleImage(file));
      const imageUrls = await Promise.all(uploadPromises);

      const marimiProcesate: MarimeStoc[] = formData.marimi
        .split(",")
        .map((item) => {
          const parts = item.trim().split(":");
          const nume = parts[0]?.trim().toUpperCase();
          const stoc = parts[1] ? parseInt(parts[1].trim()) : 0; 
          return { nume, stoc };
        })
        .filter((m) => m.nume !== "");

      await addDoc(collection(db, "products"), {
        titlu: formData.titlu,
        pret: Number(formData.pret),
        marimi: marimiProcesate,
        descriere: formData.descriere,
        imagini: imageUrls,
        createdAt: serverTimestamp()
      });

      alert("Produs adăugat! ✅");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur ștergi produsul?")) return;
    try {
        await deleteDoc(doc(db, "products", id));
        setProduse(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert("Eroare la ștergere"); }
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  // 👇 STILURI NOI PENTRU INPUT-URI
  const inputClass = "border border-gray-300 p-3 rounded w-full text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50 pt-32"> {/* Fundal gri deschis pt lizibilitate */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">🛠️ Admin Dashboard</h1>

      {/* FORMULAR */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-12 border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Adaugă Produs Nou</h2>
        
        <form onSubmit={handleAdd} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Nume Produs</label>
                    <input 
                        placeholder="Ex: Tricou Real Madrid" 
                        className={inputClass} 
                        value={formData.titlu} onChange={e => setFormData({...formData, titlu: e.target.value})} 
                        required 
                    />
                </div>
                <div>
                    <label className={labelClass}>Preț (RON)</label>
                    <input 
                        placeholder="Ex: 250" 
                        type="number" 
                        className={inputClass} 
                        value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} 
                        required 
                    />
                </div>
            </div>
            
            <div>
                <label className={labelClass}>Mărimi și Stoc</label>
                <input 
                    placeholder="Format: S:5, M:10, L:2, XL:0" 
                    className={inputClass} 
                    value={formData.marimi} onChange={e => setFormData({...formData, marimi: e.target.value})} 
                    required 
                />
                <p className="text-xs text-gray-500 mt-1">Separă prin virgulă. Folosește "două puncte" pentru stoc.</p>
            </div>

            <div>
                <label className={labelClass}>Imagini</label>
                <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition relative bg-white">
                    <label className="cursor-pointer block w-full h-full">
                        <span className="font-bold text-gray-500 block mb-2">
                            {imageFiles.length > 0 
                                ? `📸 ${imageFiles.length} poze selectate` 
                                : "Click aici pentru a alege pozele 🖼️"}
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
                        <div className="flex gap-2 justify-center mt-4 flex-wrap">
                            {imageFiles.map((file, i) => (
                                <img key={i} src={URL.createObjectURL(file)} className="h-16 w-16 object-cover rounded border shadow-sm" alt="preview"/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className={labelClass}>Descriere</label>
                <textarea 
                    placeholder="Descrie produsul..." 
                    className={`${inputClass} h-32`} 
                    value={formData.descriere} onChange={e => setFormData({...formData, descriere: e.target.value})} 
                />
            </div>
            
            <button disabled={loading} className="bg-black text-white px-6 py-4 rounded-lg w-full font-bold hover:bg-gray-800 transition shadow-md text-lg">
                {loading ? "Se încarcă..." : "Salvează Produsul"}
            </button>
        </form>
      </div>

      {/* LISTA PRODUSE */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Produse Existente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produse.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                    <div className="h-48 w-full mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                        <img src={p.imagini[0]} alt={p.titlu} className="h-full object-contain p-2" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{p.titlu}</h3>
                    <p className="text-blue-600 font-bold mb-3 text-xl">{p.pret} RON</p>
                    
                    <div className="text-xs bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                        <p className="font-bold mb-2">Stoc:</p>
                        <div className="flex flex-wrap gap-2">
                            {p.marimi?.map((m, idx) => (
                                <span key={idx} className={`px-2 py-1 rounded border ${m.stoc > 0 ? 'bg-white border-gray-300' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {m.nume}: <b>{m.stoc}</b>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="bg-red-50 text-red-600 border border-red-100 py-2 mt-5 rounded-lg hover:bg-red-100 font-bold transition w-full">
                     Șterge
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}