import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi"; // Import iconițe

// --- CONFIGURARE ---
const CLOUDINARY_CLOUD_NAME = "dvj426x"; 
const CLOUDINARY_UPLOAD_PRESET = "pozetricouri"; 
const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

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
  descriere?: string; // Adăugat și aici
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Stare Formular
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Stare Editare
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]); // Pentru editare, păstrăm pozele vechi

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

  // 4. Submit (Adăugare sau Editare)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validare imagine: trebuie să avem fie fișiere noi, fie imagini existente (la editare)
    if (imageFiles.length === 0 && existingImages.length === 0) return alert("Alege măcar o poză!");
    
    setLoading(true);

    try {
      // Upload poze noi (dacă există)
      let newImageUrls: string[] = [];
      if (imageFiles.length > 0) {
          const uploadPromises = imageFiles.map(file => uploadSingleImage(file));
          newImageUrls = await Promise.all(uploadPromises);
      }

      // Combinăm pozele vechi (dacă am păstrat vreuna) cu cele noi
      // La editare: poți decide dacă vrei să înlocuiești tot sau să adaugi. 
      // Aici simplificăm: dacă pui poze noi, le înlocuiești pe cele vechi. 
      // Dacă nu pui poze noi, păstrăm cele vechi.
      const finalImages = imageFiles.length > 0 ? newImageUrls : existingImages;

      const marimiProcesate: MarimeStoc[] = formData.marimi
        .split(",")
        .map((item) => {
          const parts = item.trim().split(":");
          const nume = parts[0]?.trim().toUpperCase();
          const stoc = parts[1] ? parseInt(parts[1].trim()) : 0;
          const piept = parts[2] ? parseInt(parts[2].trim()) : undefined;
          const lungime = parts[3] ? parseInt(parts[3].trim()) : undefined;
          
          return { nume, stoc, piept, lungime };
        })
        .filter((m) => m.nume !== "");

      const productData = {
        titlu: formData.titlu,
        pret: Number(formData.pret),
        marimi: marimiProcesate,
        descriere: formData.descriere,
        imagini: finalImages,
        // La editare nu schimbăm createdAt, la adăugare punem timestamp
        ...(editMode ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() })
      };

      if (editMode && editProductId) {
          // UPDATE
          await updateDoc(doc(db, "products", editProductId), productData);
          alert("Produs actualizat! ✏️");
      } else {
          // CREATE
          await addDoc(collection(db, "products"), productData);
          alert("Produs adăugat! ✅");
      }

      resetForm();
      fetchProduse();
    } catch (err) {
      console.error(err);
      alert("Eroare la salvare");
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru a popula formularul la editare
  const handleEditClick = (produs: Produs) => {
      setEditMode(true);
      setEditProductId(produs.id);
      setExistingImages(produs.imagini);
      
      // Convertim array-ul de mărimi înapoi în string pentru input
      const marimiString = produs.marimi?.map(m => {
          let str = `${m.nume}:${m.stoc}`;
          if (m.piept || m.lungime) str += `:${m.piept || ''}:${m.lungime || ''}`;
          return str;
      }).join(", ") || "";

      setFormData({
          titlu: produs.titlu,
          pret: String(produs.pret),
          marimi: marimiString,
          descriere: produs.descriere || ""
      });
      
      // Scroll sus la formular
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
      setFormData({ titlu: "", pret: "", marimi: "", descriere: "" });
      setImageFiles([]);
      setExistingImages([]);
      setEditMode(false);
      setEditProductId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur ștergi produsul?")) return;
    try {
        await deleteDoc(doc(db, "products", id));
        setProduse(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert("Eroare la ștergere"); }
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const inputClass = "border border-gray-300 p-3 rounded w-full text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50 pt-32 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b border-gray-300 pb-4">
          🛠️ Admin Dashboard
      </h1>

      {/* FORMULAR */}
      <div className={`bg-white p-8 rounded-xl shadow-lg mb-12 border transition-colors duration-300 ${editMode ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'}`}>
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
                <div>
                    <label className={labelClass}>Preț (RON)</label>
                    <input placeholder="Ex: 250" type="number" className={inputClass} value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} required />
                </div>
            </div>
            
            <div>
                <label className={labelClass}>Mărimi și Stoc</label>
                <input placeholder="Format: S:5:50:70, M:10" className={inputClass} value={formData.marimi} onChange={e => setFormData({...formData, marimi: e.target.value})} required />
                <p className="text-xs text-gray-500 mt-1">Format: Mărime:Stoc[:Piept:Lungime]</p>
            </div>

            <div>
                <label className={labelClass}>Imagini</label>
                
                {/* Previzualizare imagini existente (la editare) */}
                {editMode && existingImages.length > 0 && imageFiles.length === 0 && (
                    <div className="mb-3 flex gap-2 flex-wrap">
                        {existingImages.map((img, idx) => (
                            <img key={idx} src={img} className="h-16 w-16 object-cover rounded border border-blue-200" alt="old" />
                        ))}
                        <p className="text-xs text-gray-500 w-full mt-1">Acestea sunt imaginile curente. Dacă alegi altele noi, acestea vor fi înlocuite.</p>
                    </div>
                )}

                <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50 transition relative bg-white">
                    <label className="cursor-pointer block w-full h-full">
                        <span className="font-bold text-gray-500 block mb-2">
                            {imageFiles.length > 0 
                                ? `📸 ${imageFiles.length} poze noi selectate` 
                                : (editMode ? "Click pentru a schimba pozele" : "Click pentru a alege pozele")}
                        </span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) setImageFiles(Array.from(e.target.files)); }} />
                    </label>
                    {imageFiles.length > 0 && (
                        <div className="flex gap-2 justify-center mt-4 flex-wrap">
                            {imageFiles.map((file, i) => (
                                <img key={i} src={URL.createObjectURL(file)} className="h-16 w-16 object-cover rounded border border-gray-300 shadow-sm" alt="preview"/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className={labelClass}>Descriere</label>
                <textarea placeholder="Descriere..." className={`${inputClass} h-32`} value={formData.descriere} onChange={e => setFormData({...formData, descriere: e.target.value})} />
            </div>
            
            <button disabled={loading} className={`px-6 py-4 rounded-lg w-full font-bold transition shadow-md text-lg text-white ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'}`}>
                {loading ? "Se procesează..." : (editMode ? "Actualizează Produsul" : "Salvează Produsul")}
            </button>
        </form>
      </div>

      {/* LISTA PRODUSE */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Produse Existente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produse.map(p => (
            <div key={p.id} className={`bg-white border p-5 rounded-xl shadow-sm flex flex-col justify-between transition ${editProductId === p.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:shadow-md'}`}>
                <div>
                    <div className="h-48 w-full mb-4 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 relative group">
                        <img src={p.imagini[0]} alt={p.titlu} className="h-full object-contain p-2" />
                        {/* Buton rapid de editare pe imagine */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button onClick={() => handleEditClick(p)} className="bg-white text-blue-600 p-2 rounded-full shadow-lg transform hover:scale-110 transition">
                                <FiEdit size={20} />
                            </button>
                        </div>
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
                
                <div className="flex gap-2 mt-5">
                    <button onClick={() => handleEditClick(p)} className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg hover:bg-blue-100 font-bold transition flex items-center justify-center gap-2">
                        <FiEdit /> Editează
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg hover:bg-red-100 font-bold transition flex items-center justify-center gap-2">
                        <FiTrash2 /> Șterge
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}