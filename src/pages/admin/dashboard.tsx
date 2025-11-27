import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

// --- CONFIGURARE ---
const CLOUDINARY_CLOUD_NAME = "debck79qe"; // Pune cloud name-ul tău
const CLOUDINARY_UPLOAD_PRESET = "pozetricouri"; // Pune preset-ul tău
const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

type Produs = { 
  id: string; 
  titlu: string; 
  pret: number; 
  imagine: string; 
  marimi?: string[]; // 👈 NOU: Lista de mărimi
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Stare Formular
  const [imageFile, setImageFile] = useState<File | null>(null);
  // 👈 NOU: Am adăugat 'marimi' în starea formularului
  const [formData, setFormData] = useState({ 
    titlu: "", 
    pret: "", 
    marimi: "", // Va fi un string gen "S, M, L"
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
    setProduse(snap.docs.map(d => ({ id: d.id, ...d.data() } as Produs)));
  };

  // 3. Upload Imagine
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

      // 👈 PROCESARE MĂRIMI: Transformăm "S, M, L" în ["S", "M", "L"]
      const marimiArray = formData.marimi
        .split(",")
        .map((s) => s.trim().toUpperCase()) // Le facem mari și scoatem spațiile
        .filter((s) => s !== ""); // Eliminăm golurile

      await addDoc(collection(db, "products"), {
        titlu: formData.titlu,
        pret: Number(formData.pret),
        marimi: marimiArray, // Salvăm ca listă (Array)
        descriere: formData.descriere,
        imagine: imageUrl,
        createdAt: serverTimestamp()
      });

      alert("Produs adăugat! ✅");
      // Reset
      setFormData({ titlu: "", pret: "", marimi: "", descriere: "" });
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

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard</h1>

      {/* FORMULAR DE ADĂUGARE */}
      <div className="bg-white p-6 rounded shadow mb-10 border">
        <h2 className="text-xl font-bold mb-4">Adaugă Produs Nou</h2>
        <form onSubmit={handleAdd} className="space-y-4">
            
            {/* Rândul 1: Nume și Preț */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nume Produs</label>
                    <input 
                        placeholder="Ex: Tricou Real Madrid" 
                        className="border p-2 rounded w-full" 
                        value={formData.titlu} 
                        onChange={e => setFormData({...formData, titlu: e.target.value})} 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Preț (RON)</label>
                    <input 
                        placeholder="Ex: 250" 
                        type="number" 
                        className="border p-2 rounded w-full" 
                        value={formData.pret} 
                        onChange={e => setFormData({...formData, pret: e.target.value})} 
                        required 
                    />
                </div>
            </div>

            {/* Rândul 2: Mărimi */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mărimi disponibile</label>
                <input 
                    placeholder="Ex: S, M, L, XL (separate prin virgulă)" 
                    className="border p-2 rounded w-full" 
                    value={formData.marimi} 
                    onChange={e => setFormData({...formData, marimi: e.target.value})} 
                    required 
                />
                <p className="text-xs text-gray-500 mt-1">Scrie mărimile separate prin virgulă.</p>
            </div>

            {/* Rândul 3: Poză */}
            <div className="border-2 border-dashed p-4 rounded text-center cursor-pointer hover:bg-gray-50 transition">
                <label className="cursor-pointer block">
                    <span className="font-bold text-gray-600">
                        {imageFile ? `📸 Fișier selectat: ${imageFile.name}` : "Click aici pentru a alege poza 🖼️"}
                    </span>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => e.target.files && setImageFile(e.target.files[0])} 
                    />
                </label>
            </div>

            {/* Descriere */}
            <textarea 
                placeholder="Descriere produs..." 
                className="border p-2 rounded w-full" 
                rows={3}
                value={formData.descriere} 
                onChange={e => setFormData({...formData, descriere: e.target.value})} 
            />
            
            <button disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded w-full hover:bg-green-700 font-bold text-lg">
                {loading ? "Se salvează..." : "Adaugă Produsul"}
            </button>
        </form>
      </div>

      {/* LISTA DE PRODUSE EXISTENTE */}
      <h2 className="text-2xl font-bold mb-4">Lista Produse ({produse.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {produse.map(p => (
            <div key={p.id} className="border p-4 rounded bg-white shadow flex flex-col justify-between">
                <div>
                    <img src={p.imagine} alt={p.titlu} className="h-32 w-full object-contain mb-2" />
                    <p className="font-bold">{p.titlu}</p>
                    <p className="text-green-600 font-bold">{p.pret} RON</p>
                    {/* Afișăm mărimile disponibile */}
                    <div className="text-sm text-gray-500 mt-1">
                        Mărimi: {p.marimi ? p.marimi.join(", ") : "Standard"}
                    </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="bg-red-100 text-red-600 py-1 mt-3 rounded hover:bg-red-200 font-bold">
                    🗑️ Șterge
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}