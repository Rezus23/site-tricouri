import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useState, FormEvent, useEffect } from "react";

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

      // 1. Apel către API-ul Netopia (care acum salvează și adresa)
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
        console.error("Eroare API /api/netopia-create:", res.status, text);
        alert("Eroare la server (netopia-create). Vezi consola (F12 → Console).");
        return;
      }

      // 2. Redirecționare către Netopia (prin HTML-ul primit)
      document.open();
      document.write(text);
      document.close();

    } catch (err) {
      console.error("Eroare la fetch /api/netopia-create:", err);
      alert("Eroare de rețea sau JS în browser. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null; // Nu afișăm nimic dacă redirecționăm

  const renderInput = (name: keyof Adresa, label: string, required: boolean = true) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium">{label}{required && <span className="text-red-500">*</span>}</label>
      <input
        type={name === 'email' ? 'email' : (name === 'telefon' ? 'tel' : 'text')}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="p-4 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Pasul 1: Detalii Livrare</h1>

      <form onSubmit={handlePayWithNetopia} className="space-y-4">
        {/* Nume și Prenume */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderInput('nume', 'Nume')}
          {renderInput('prenume', 'Prenume')}
        </div>
        
        {/* Email și Telefon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderInput('email', 'Email')}
          {renderInput('telefon', 'Telefon')}
        </div>

        {/* Adresa */}
        {renderInput('adresa', 'Adresă (stradă, număr, bloc, ap.)')}
        
        {/* Oraș, Județ, Cod Poștal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {renderInput('oras', 'Oraș')}
          {renderInput('judet', 'Județ')}
          {renderInput('codPostal', 'Cod Poștal', false)}
        </div>

        <div className="pt-4 border-t mt-6">
          <p className="text-xl font-bold text-gray-700">Total de plată: {total.toFixed(2)} RON</p>
        </div>

        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="w-full bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
        >
          {loading ? 'Se procesează...' : 'Continuă la Plată (Netopia)'}
        </button>
      </form>
    </div>
  );
}