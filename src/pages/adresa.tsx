import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";

type Adresa = {
  nume: string;
  prenume: string;
  telefon: string;
  email: string;
  adresa: string;
  oras: string;
  judet: string;
  codPostal: string;
};

export default function AdresaLivrare() {
  const { cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const total = cart.reduce((acc, p) => acc + Number(p.pret), 0);

  const [formData, setFormData] = useState<Adresa>({
    nume: user?.displayName?.split(' ')[0] || "",
    prenume: user?.displayName?.split(' ')[1] || "",
    telefon: "",
    email: user?.email || "",
    adresa: "",
    oras: "",
    judet: "",
    codPostal: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dacă coșul este gol, redirecționează înapoi la coș
    if (cart.length === 0) {
        router.push("/cart");
    }
  }, [cart, router]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayWithNetopia = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const currentUserId = user?.uid; 
      const amount = Number(total.toFixed(2));

      // 1. Apel către API-ul Netopia (salvează și adresa)
      const res = await fetch("/api/netopia-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          email: formData.email,
          userId: currentUserId,
          details: `Comandă tricouri (${formData.email})`,
          produse: cart,
          adresaLivrare: formData, // 👈 TRIMITEM ADRESA COMPLETĂ
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Eroare API:", res.status, text);
        alert("Eroare la server. Încearcă din nou.");
        return;
      }

      // 2. Redirecționare către Netopia
      document.open();
      document.write(text);
      document.close();

    } catch (err) {
      console.error("Eroare fetch:", err);
      alert("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null; 

  const renderInput = (name: keyof Adresa, label: string, required: boolean = true) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-bold text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type={name === 'email' ? 'email' : (name === 'telefon' ? 'tel' : 'text')}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        className="p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm placeholder-gray-400"
        placeholder={`Introdu ${label.toLowerCase()}...`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-4 pb-10">
      
      {/* Link Înapoi */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/cart" className="text-gray-500 hover:text-black font-medium transition">
            ← Înapoi la Coș
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        <h1 className="text-3xl font-extrabold mb-2 text-center text-gray-900">
          Detalii Livrare
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
            Completează datele pentru a finaliza comanda.
        </p>

        <form onSubmit={handlePayWithNetopia} className="space-y-6">
          
          {/* Nume și Prenume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderInput('nume', 'Nume')}
            {renderInput('prenume', 'Prenume')}
          </div>
          
          {/* Email și Telefon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderInput('email', 'Email')}
            {renderInput('telefon', 'Telefon')}
          </div>

          {/* Adresa */}
          {renderInput('adresa', 'Adresă (stradă, număr, bloc, ap.)')}
          
          {/* Oraș, Județ, Cod Poștal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {renderInput('oras', 'Oraș')}
            {renderInput('judet', 'Județ')}
            {renderInput('codPostal', 'Cod Poștal', false)}
          </div>

          {/* Rezumat Plată */}
          <div className="pt-6 border-t border-gray-200 mt-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total de plată:</span>
                <span className="text-2xl font-bold text-blue-600">{total.toFixed(2)} RON</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">Plată securizată prin Netopia</p>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition font-bold text-lg shadow-lg active:scale-95 disabled:bg-gray-400 mt-6 flex justify-center items-center gap-2"
          >
            {loading ? (
                <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Se inițiază plata...
                </>
            ) : (
                'Plătește Securizat'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}