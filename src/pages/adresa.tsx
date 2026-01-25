import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { FiTruck, FiTag, FiCheckCircle, FiAlertCircle, FiCreditCard, FiPackage } from "react-icons/fi"; 

// 1. TIP DATE
type Adresa = {
  nume: string;
  prenume: string;
  telefon: string;
  email: string;
  adresa: string;
  oras: string;
  judet: string;
  codPostal: string;
  detalii: string; 
};

export default function AdresaLivrare() {
  const { cart, golesteCos } = useCart(); 
  const { user } = useAuth();
  const router = useRouter();

  const subtotal = cart.reduce((acc, p) => acc + Number(p.pret), 0);
  const COST_LIVRARE = 15.00;
  const COD_PROMO_VALID = "DROP20"; // Poți schimba codul aici dacă vrei

  const [promoInput, setPromoInput] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState<"idle" | "success" | "error">("idle");

  const [metodaPlata, setMetodaPlata] = useState<"card" | "ramburs">("card");

  // 👇 STARE NOUĂ: Previne redirectul către Cart după ce golim coșul
  const [orderCompleted, setOrderCompleted] = useState(false);

  const [formData, setFormData] = useState<Adresa>({
    nume: user?.displayName?.split(' ')[0] || "",
    prenume: user?.displayName?.split(' ')[1] || "",
    telefon: "",
    email: user?.email || "",
    adresa: "",
    oras: "",
    judet: "",
    codPostal: "",
    detalii: "", 
  });
  
  const [loading, setLoading] = useState(false);
  const [livrareSelectata, setLivrareSelectata] = useState(true);

  // Calcul final
  const totalFinal = subtotal - discount + (livrareSelectata ? COST_LIVRARE : 0);

  // 👇 PROTECȚIE COȘ GOL (Actualizată)
  useEffect(() => {
    // Dacă comanda NU e finalizată și coșul e gol, trimite la /cart
    if (!orderCompleted && cart.length === 0) {
        router.push("/cart");
    }
  }, [cart, router, orderCompleted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = () => {
    if (promoInput.trim().toUpperCase() === COD_PROMO_VALID) {
        const totalBrut = subtotal + (livrareSelectata ? COST_LIVRARE : 0);
        // Aplicăm 20% reducere
        const valoareDiscount = totalBrut * 0.20;
        
        setDiscount(valoareDiscount);
        setPromoStatus("success");
    } else {
        setDiscount(0);
        setPromoStatus("error");
    }
  };

  // 👇 FUNCȚIA DE FINALIZARE COMANDĂ
  const handleFinalizeOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    const currentUserId = user?.uid; 
    const orderId = `CMD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      // --- CAZUL 1: RAMBURS ---
      if (metodaPlata === "ramburs") {
          const res = await fetch("/api/order-ramburs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  orderId,
                  amount: totalFinal,
                  email: formData.email,
                  produse: cart,
                  adresaLivrare: formData,
                  userId: currentUserId,
                  discount: discount,       
                  costLivrare: livrareSelectata ? COST_LIVRARE : 0
              })
          });

          if (res.ok) {
              // 👇 LOGICA DE REDIRECȚIONARE CORECTĂ
              setOrderCompleted(true); // 1. Spunem paginii că am terminat (nu da redirect la Cart)
              golesteCos();             // 2. Golim coșul
              router.push("/successramburs"); // 3. Mergem la pagina de succes
          } else {
              alert("A apărut o eroare la plasarea comenzii ramburs.");
          }
      } 
      // --- CAZUL 2: CARD (NETOPIA) ---
      else {
          const res = await fetch("/api/netopia-create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: totalFinal,
              email: formData.email,
              userId: currentUserId,
              details: `Comandă (${formData.email}) ${discount > 0 ? '- DISCOUNT' : ''}`,
              produse: cart,
              adresaLivrare: formData, 
              costLivrare: COST_LIVRARE,
              discount: discount
            }),
          });

          const text = await res.text();

          if (!res.ok) {
            console.error("Eroare API:", res.status, text);
            alert("Eroare la server Netopia. Încearcă din nou.");
            return;
          }

          // Netopia returnează un formular HTML ascuns pe care îl executăm automat
          document.open();
          document.write(text);
          document.close();
      }

    } catch (err) {
      console.error("Eroare fetch:", err);
      alert("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  };

  // Dacă coșul e gol și nu am terminat comanda, nu randăm nimic (așteptăm redirectul)
  if (!orderCompleted && cart.length === 0) return null; 

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
        className="p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        placeholder={`Introdu ${label.toLowerCase()}...`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-4 pb-10 font-sans">
      
      <div className="max-w-2xl mx-auto mb-6">
        <Link href="/cart" className="text-gray-500 hover:text-black font-medium transition">
            ← Înapoi la Coș
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
          Detalii Livrare
        </h1>

        <form onSubmit={handleFinalizeOrder} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderInput('nume', 'Nume')}
            {renderInput('prenume', 'Prenume')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderInput('email', 'Email')}
            {renderInput('telefon', 'Telefon')}
          </div>

          {renderInput('adresa', 'Adresă (stradă, număr, bloc, ap.)')}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {renderInput('oras', 'Oraș')}
            {renderInput('judet', 'Județ')}
            {renderInput('codPostal', 'Cod Poștal', false)}
          </div>

          {/* DETALII ADIȚIONALE */}
          <div className="flex flex-col">
            <label htmlFor="detalii" className="mb-1 text-sm font-bold text-gray-700">
              Detalii Adiționale <span className="text-gray-400 font-normal ml-1">(opțional)</span>
            </label>
            <textarea
              id="detalii"
              name="detalii"
              value={formData.detalii}
              onChange={handleChange}
              rows={3}
              className="p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none shadow-sm resize-none"
              placeholder="Ex: interfon, interval orar preferat, cerințe comandă custom..."
            />
          </div>

          {/* METODĂ LIVRARE */}
          <div className="pt-6 border-t border-gray-200 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Metodă de livrare</h3>
            <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${livrareSelectata ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        checked={livrareSelectata}
                        onChange={() => setLivrareSelectata(true)} 
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 accent-blue-600"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 flex items-center gap-2">
                            <FiTruck /> Livrare prin Curier Rapid
                        </span>
                        <span className="text-sm text-gray-500">Termen: 2-5 zile lucrătoare</span>
                    </div>
                </div>
                <span className="font-bold text-gray-900">{COST_LIVRARE} RON</span>
            </label>
          </div>

          {/* METODĂ DE PLATĂ */}
          <div className="pt-6 border-t border-gray-200 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Metodă de Plată</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Opțiune CARD */}
                <div 
                    onClick={() => setMetodaPlata("card")}
                    className={`cursor-pointer p-4 border rounded-xl flex items-center gap-3 transition-all ${metodaPlata === 'card' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${metodaPlata === 'card' ? 'border-blue-600' : 'border-gray-400'}`}>
                        {metodaPlata === 'card' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 flex items-center gap-2"><FiCreditCard /> Card Online</p>
                        <p className="text-xs text-gray-500">Securizat prin Netopia</p>
                    </div>
                </div>

                {/* Opțiune RAMBURS */}
                <div 
                    onClick={() => setMetodaPlata("ramburs")}
                    className={`cursor-pointer p-4 border rounded-xl flex items-center gap-3 transition-all ${metodaPlata === 'ramburs' ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${metodaPlata === 'ramburs' ? 'border-blue-600' : 'border-gray-400'}`}>
                        {metodaPlata === 'ramburs' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 flex items-center gap-2"><FiPackage /> Ramburs</p>
                        <p className="text-xs text-gray-500">Plata la curier</p>
                    </div>
                </div>

            </div>
          </div>

          {/* COD PROMO */}
          <div className="pt-6 border-t border-gray-200 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiTag className="text-blue-600" /> Cod Promoțional
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Ai un cod? Inserează-l aici cu litere mari" 
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-black uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    disabled={promoStatus === "success"}
                />
                <button 
                    type="button" 
                    onClick={handleApplyPromo}
                    disabled={promoStatus === "success"}
                    className="bg-gray-900 text-white px-6 rounded-lg font-bold hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Aplică
                </button>
            </div>
            
            {promoStatus === "success" && (
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1 font-medium animate-in fade-in">
                    <FiCheckCircle /> Cod aplicat cu succes! (20% din Total)
                </p>
            )}
            {promoStatus === "error" && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium animate-in fade-in">
                    <FiAlertCircle /> Cod invalid sau expirat.
                </p>
            )}
          </div>

          {/* REZUMAT FINAL */}
          <div className="pt-6 border-t border-gray-200 mt-4 bg-gray-50 p-5 rounded-xl">
            <div className="flex justify-between items-center mb-2 text-gray-600">
                <span>Subtotal produse:</span>
                <span>{subtotal.toFixed(2)} RON</span>
            </div>
            
            <div className="flex justify-between items-center mb-4 text-gray-600">
                <span>Livrare:</span>
                <span>{livrareSelectata ? `${COST_LIVRARE.toFixed(2)} RON` : '15.00 RON'}</span>
            </div>

            {discount > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600 font-bold border-t border-gray-200 pt-2">
                    <span>Reducere (20% din Total):</span>
                    <span>- {discount.toFixed(2)} RON</span>
                </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                <span className="text-lg font-bold text-gray-800">Total de plată:</span>
                <span className="text-3xl font-extrabold text-blue-600">{totalFinal.toFixed(2)} RON</span>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-right">
                {metodaPlata === 'card' ? 'Plată securizată prin Netopia' : 'Plătești numerar la primirea coletului'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || (cart.length === 0 && !orderCompleted)}
            className="w-full bg-black text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition font-bold text-lg shadow-lg active:scale-95 disabled:bg-gray-400 flex justify-center items-center gap-2"
          >
            {loading 
                ? 'Se procesează...' 
                : (metodaPlata === 'card' ? `Plătește ${totalFinal.toFixed(2)} RON` : 'CONFIRMĂ COMANDA')
            }
          </button>
        </form>
      </div>
    </div>
  );
}