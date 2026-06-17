import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";

// --- CONFIGURARE ---
const CLOUDINARY_CLOUD_NAME = "debck79qe"; 
const CLOUDINARY_UPLOAD_PRESET = "pozetricouri"; 
const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

// Categoriile disponibile
const CATEGORII = [
  { id: "tricouri", label: "Sezon 25/26" },
  { id: "retro", label: "Retro" },
  { id: "nationale", label: "Echipe Naționale" },
  { id: "custom", label: "custom" },
];

type MarimeStoc = {
  nume: string;
  stoc: number;
  piept?: number;
  lungime?: number;
};

type Produs = { 
  id: string; 
  titlu: string; 
  pret: number; 
  imagini: string[]; 
  marimi?: MarimeStoc[]; 
  descriere?: string;
  categorie?: string;
   // 👈 Câmpul categorie
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // 👇 STARE FORMULAR (Categorie default: tricouri)
  const [formData, setFormData] = useState({ 
    titlu: "", 
    pret: "", 
    marimi: "", 
    descriere: "",
    categorie: "tricouri" 
  });

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
    try {
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
    } catch (e) {
        console.error("Eroare fetch:", e);
    }
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

  // --- SUBMIT (ADĂUGARE / EDITARE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imageFiles.length === 0 && existingImages.length === 0) return alert("Alege măcar o poză!");
    
    setLoading(true);

    try {
      let newImageUrls: string[] = [];
      if (imageFiles.length > 0) {
          const uploadPromises = imageFiles.map(file => uploadSingleImage(file));
          newImageUrls = await Promise.all(uploadPromises);
      }

      const finalImages = imageFiles.length > 0 ? newImageUrls : existingImages;

      const marimiProcesate: MarimeStoc[] = formData.marimi
        .split(",")
        .map((item) => {
          const parts = item.trim().split(":");
          const nume = parts[0]?.trim().toUpperCase();
          const stoc = parts[1] ? parseInt(parts[1].trim()) : 0;
          const piept = parts[2] ? parseInt(parts[2].trim()) : undefined;
          const lungime = parts[3] ? parseInt(parts[3].trim()) : undefined;
          
          // 💡 FIX: Convertim 'undefined' la 'null' pentru Firestore, sau nu le includem dacă sunt undefined
          // Firestore nu acceptă undefined.
          const obj: any = { nume, stoc };
          if (piept !== undefined) obj.piept = piept;
          if (lungime !== undefined) obj.lungime = lungime;
          
          return obj as MarimeStoc;
        })
        .filter((m) => m.nume !== "");

      // 💡 FIX CRITIC: Asigurăm valori implicite pentru câmpurile opționale
      const productData = {
        titlu: formData.titlu || "",
        pret: Number(formData.pret) || 0,
        marimi: marimiProcesate,
        descriere: formData.descriere || "",
        categorie: formData.categorie || "tricouri", // Default dacă lipsește
        imagini: finalImages || [],
        ...(editMode ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() })
      };

      if (editMode && editProductId) {
          await updateDoc(doc(db, "products", editProductId), productData);
          alert("Produs actualizat! ✏️");
      } else {
          await addDoc(collection(db, "products"), productData);
          alert("Produs adăugat! ✅");
      }

      resetForm(); // Apelează funcția de resetare inteligentă
      fetchProduse();
    } catch (err) {
      console.error("Eroare la salvare:", err);
      alert("Eroare la salvare! Verifică consola (F12).");
    } finally {
      setLoading(false);
    }
  };

  // --- RESETARE FORMULAR (Păstrează categoria) ---
  const resetForm = () => {
      // Păstrăm categoria curentă ca să adaugi mai multe la rând
      const currentCat = formData.categorie; 

      setFormData({ 
          titlu: "", 
          pret: "", 
          marimi: "", 
          descriere: "", 
          categorie: currentCat // 👈 Nu resetăm la default, ci păstrăm ce ai ales
      });
      
      setImageFiles([]);
      setExistingImages([]);
      setEditMode(false);
      setEditProductId(null);
  };

  const handleEditClick = (produs: Produs) => {
      setEditMode(true);
      setEditProductId(produs.id);
      setExistingImages(produs.imagini);
      
      const marimiString = produs.marimi?.map(m => {
          let str = `${m.nume}:${m.stoc}`;
          if (m.piept || m.lungime) str += `:${m.piept || ''}:${m.lungime || ''}`;
          return str;
      }).join(", ") || "";

      setFormData({
          titlu: produs.titlu,
          pret: String(produs.pret),
          marimi: marimiString,
          descriere: produs.descriere || "",
          categorie: produs.categorie || "tricouri"
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur ștergi produsul?")) return;
    try {
        await deleteDoc(doc(db, "products", id));
        setProduse(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert("Eroare la ștergere"); }
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const inputClass = "border border-gray-400 p-3 rounded w-full text-black bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium";
  const labelClass = "block text-sm font-bold text-gray-800 mb-1";

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-100 pt-32 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b border-gray-300 pb-4">🛠️ Admin Dashboard</h1>

      <div className={`bg-white p-8 rounded-xl shadow-lg mb-12 border ${editMode ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
                {editMode ? `✏️ Editează Produsul` : `➕ Adaugă Produs Nou`}
            </h2>
            {editMode && (
                <button onClick={resetForm} className="text-sm text-red-500 flex items-center gap-1 hover:underline">
                    <FiX /> Anulează Editarea
                </button>
            )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Nume Produs</label>
                    <input placeholder="Ex: Tricou Real Madrid" className={inputClass} value={formData.titlu} onChange={e => setFormData({...formData, titlu: e.target.value})} required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Preț (RON)</label>
                        <input placeholder="250" type="number" className={inputClass} value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} required />
                    </div>
                    
                    {/* 👇 SELECTOR CATEGORIE */}
                    <div>
                        <label className={labelClass}>Categorie</label>
                        <select 
                            className={inputClass} 
                            value={formData.categorie} 
                            onChange={e => setFormData({...formData, categorie: e.target.value})}
                        >
                            {CATEGORII.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div>
                <label className={labelClass}>Mărimi și Stoc</label>
                <input placeholder="Ex: S:5, M:10" className={inputClass} value={formData.marimi} onChange={e => setFormData({...formData, marimi: e.target.value})} required />
            </div>

            {/* ... zona de imagini rămâne neschimbată ... */}
             <div>
                <label className={labelClass}>Imagini</label>
                
                {editMode && existingImages.length > 0 && imageFiles.length === 0 && (
                    <div className="mb-3 flex gap-2 flex-wrap">
                        {existingImages.map((img, idx) => (
                            <img key={idx} src={img} className="h-16 w-16 object-cover rounded border border-blue-200" alt="old" />
                        ))}
                        <p className="text-xs text-gray-500 w-full mt-1">Imagini curente.</p>
                    </div>
                )}

                <div className="border-2 border-dashed border-gray-400 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition relative bg-white">
                    <label className="cursor-pointer block w-full h-full">
                        <span className="font-bold text-gray-600 block mb-2">
                            {imageFiles.length > 0 ? `📸 ${imageFiles.length} poze` : (editMode ? "Schimbă pozele" : "Alege pozele")}
                        </span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) setImageFiles(Array.from(e.target.files)); }} />
                    </label>
                </div>
            </div>

            <div>
                <label className={labelClass}>Descriere</label>
                <textarea placeholder="Descriere..." className={`${inputClass} h-32`} value={formData.descriere} onChange={e => setFormData({...formData, descriere: e.target.value})} />
            </div>
            
            <button disabled={loading} className={`px-6 py-4 rounded-lg w-full font-bold transition shadow-md text-lg text-white ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'}`}>
                {loading ? "Se procesează..." : (editMode ? "Actualizează" : "Salvează")}
            </button>
        </form>
      </div>

      {/* LISTA PRODUSE - Cu etichetă de categorie */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Produse Existente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produse.map(p => (
            <div key={p.id} className={`bg-white border p-5 rounded-xl shadow-sm flex flex-col justify-between transition ${editProductId === p.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                <div>
                    <div className="h-48 w-full mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 relative">
                        <img src={p.imagini[0]} alt={p.titlu} className="h-full object-contain p-2" />
                        {/* Badge Categorie */}
                        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                            {CATEGORII.find(c => c.id === p.categorie)?.label || "Nedefinit"}
                        </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{p.titlu}</h3>
                    <p className="text-blue-600 font-bold mb-3 text-xl">{p.pret} RON</p>
                </div>
                
                <div className="flex gap-2 mt-5">
                    <button onClick={() => handleEditClick(p)} className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg hover:bg-blue-100 font-bold transition flex items-center justify-center gap-2">
                        <FiEdit />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-100 font-bold transition flex items-center justify-center gap-2">
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}