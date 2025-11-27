import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

// --- CONFIGURARE (Aici pui datele tale Cloudinary și Emailul Tău) ---
const CLOUDINARY_CLOUD_NAME = "numele_tau_cloud"; 
const CLOUDINARY_UPLOAD_PRESET = "nume_preset_unsigned"; 
const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

type Produs = { id: string; titlu: string; pret: number; imagine: string; };

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth(); // Presupunem că auth are loading state
  const router = useRouter();
  
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Formular
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ titlu: "", pret: "", descriere: "" });

  // 1. SECURITATE: Te dăm afară dacă nu ești admin
  useEffect(() => {
    // Așteptăm să se încarce userul, apoi verificăm
    if (!authLoading) {
        if (!user || user.email !== ADMIN_EMAIL) {
            router.push("/"); // Redirect acasă
        } else {
            fetchProduse(); // Ești admin, încarcă produsele
        }
    }
  }, [user, authLoading, router]);

  // 2. Citește Produsele
  const fetchProduse = async () => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setProduse(snap.docs.map(d => ({ id: d.id, ...d.data() } as Produs)));
  };

  // 3. Upload Imagine pe Cloudinary
  const uploadImage = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST", body: data
    });
    const json = await res.json();
    return json.secure_url;
  };

  // 4. Adaugă Produs
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Alege o poză!");
    setLoading(true);

    try {
      const imageUrl = await uploadImage(imageFile);
      await addDoc(collection(db, "products"), {
        ...formData,
        pret: Number(formData.pret),
        imagine: imageUrl,
        createdAt: serverTimestamp()
      });
      alert("Produs adăugat!");
      setFormData({ titlu: "", pret: "", descriere: "" });
      setImageFile(null);
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

  if (!user || user.email !== ADMIN_EMAIL) return null; // Nu randam nimic daca nu e admin

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard</h1>

      {/* FORMULAR DE ADĂUGARE */}
      <div className="bg-white p-6 rounded shadow mb-10 border">
        <h2 className="text-xl font-bold mb-4">Adaugă Produs Nou</h2>
        <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input placeholder="Titlu" className="border p-2 rounded" 
                    value={formData.titlu} onChange={e => setFormData({...formData, titlu: e.target.value})} required />
                <input placeholder="Preț" type="number" className="border p-2 rounded" 
                    value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} required />
            </div>
            <textarea placeholder="Descriere" className="border p-2 rounded w-full" 
                value={formData.descriere} onChange={e => setFormData({...formData, descriere: e.target.value})} />
            <input type="file" onChange={e => e.target.files && setImageFile(e.target.files[0])} />
            
            <button disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded w-full hover:bg-green-700">
                {loading ? "Se salvează..." : "Adaugă Produs"}
            </button>
        </form>
      </div>

      {/* LISTA DE PRODUSE */}
      <h2 className="text-2xl font-bold mb-4">Lista Produse ({produse.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {produse.map(p => (
            <div key={p.id} className="border p-4 rounded bg-white shadow flex flex-col justify-between">
                <div>
                    <img src={p.imagine} alt={p.titlu} className="h-32 w-full object-contain mb-2" />
                    <p className="font-bold">{p.titlu}</p>
                    <p className="text-green-600">{p.pret} RON</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="bg-red-100 text-red-600 py-1 mt-2 rounded hover:bg-red-200">
                    🗑️ Șterge
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}